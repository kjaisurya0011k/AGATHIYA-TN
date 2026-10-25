-- ============================================================================
-- Migration: 20261025_payment_verification_workflow.sql
-- Description: Complete Admin Payment Verification & Registration Management schema.
--              Extends public.session_registrations with payment metadata, verification/rejection
--              audit columns, constraints, security-definer RPC functions, and updated RLS.
-- ============================================================================

-- 1. Extend public.session_registrations with payment tracking and audit columns
ALTER TABLE public.session_registrations
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI',
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 2. Update payment_status check constraint to support 'verified' and 'rejected'
-- Note: 'paid' is retained for backwards-compatibility.
ALTER TABLE public.session_registrations
  DROP CONSTRAINT IF EXISTS session_registrations_payment_status_check;

ALTER TABLE public.session_registrations
  ADD CONSTRAINT session_registrations_payment_status_check
  CHECK (payment_status IN ('not_required', 'pending', 'verified', 'paid', 'rejected'));

-- 3. Indexes for fast payment queue and audit lookups
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status
  ON public.session_registrations(payment_status);

CREATE INDEX IF NOT EXISTS idx_registrations_tx_ref
  ON public.session_registrations(transaction_reference)
  WHERE transaction_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at
  ON public.session_registrations(payment_submitted_at DESC);

-- 4. Secure RPC: Admin Verify Payment
-- Only platform administrators can verify a payment.
-- Atomically marks payment_status as 'verified', records verified_by & verified_at,
-- clears rejection details, and ensures registration status is 'registered'.
CREATE OR REPLACE FUNCTION public.admin_verify_payment(p_registration_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_reg RECORD;
BEGIN
  -- Verify administrator role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only platform administrators can verify payments.';
  END IF;

  -- Verify registration exists
  SELECT * INTO v_reg
  FROM public.session_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration record % not found.', p_registration_id;
  END IF;

  -- Update registration atomically
  UPDATE public.session_registrations
  SET
    payment_status = 'verified',
    status = 'registered',
    verified_by = v_caller,
    verified_at = NOW(),
    rejection_reason = NULL,
    rejected_by = NULL,
    rejected_at = NULL,
    updated_at = NOW()
  WHERE id = p_registration_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', p_registration_id,
    'payment_status', 'verified',
    'verified_by', v_caller,
    'verified_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_verify_payment(UUID) TO authenticated;

-- 5. Secure RPC: Admin Reject Payment
-- Only platform administrators can reject a payment.
-- Atomically marks payment_status as 'rejected', records rejection_reason, rejected_by & rejected_at.
-- Registration is preserved (not deleted) so the student can review reason and resubmit.
CREATE OR REPLACE FUNCTION public.admin_reject_payment(
  p_registration_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_reg RECORD;
BEGIN
  -- Verify administrator role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only platform administrators can reject payments.';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'A valid rejection reason must be provided.';
  END IF;

  -- Verify registration exists
  SELECT * INTO v_reg
  FROM public.session_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration record % not found.', p_registration_id;
  END IF;

  -- Update registration atomically
  UPDATE public.session_registrations
  SET
    payment_status = 'rejected',
    rejection_reason = trim(p_reason),
    rejected_by = v_caller,
    rejected_at = NOW(),
    updated_at = NOW()
  WHERE id = p_registration_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', p_registration_id,
    'payment_status', 'rejected',
    'rejection_reason', trim(p_reason),
    'rejected_by', v_caller,
    'rejected_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reject_payment(UUID, TEXT) TO authenticated;

-- 6. Trigger update: Enforce payment status transitions
CREATE OR REPLACE FUNCTION public.handle_registration_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_price NUMERIC(10, 2);
BEGIN
  -- Look up session price
  SELECT price_inr INTO v_session_price
  FROM public.sessions
  WHERE id = NEW.session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced session does not exist.';
  END IF;

  -- On INSERT, auto-assign initial payment_status based on price if not set
  IF TG_OP = 'INSERT' THEN
    IF v_session_price = 0 THEN
      NEW.payment_status := 'not_required';
    ELSE
      NEW.payment_status := COALESCE(NEW.payment_status, 'pending');
    END IF;
  END IF;

  -- On UPDATE, only administrators can modify payment_status or verification fields
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
        NEW.verified_by IS DISTINCT FROM OLD.verified_by OR
        NEW.verified_at IS DISTINCT FROM OLD.verified_at OR
        NEW.rejected_by IS DISTINCT FROM OLD.rejected_by OR
        NEW.rejected_at IS DISTINCT FROM OLD.rejected_at) THEN
      IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only platform administrators can modify payment verification status.';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registration_payment_status ON public.session_registrations;
CREATE TRIGGER trg_registration_payment_status
  BEFORE INSERT OR UPDATE ON public.session_registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_registration_payment_status();

-- 7. Update Session Links RLS: Only granted if session is free OR payment is verified/paid
DROP POLICY IF EXISTS "Session links select policy" ON public.session_links;
CREATE POLICY "Session links select policy"
  ON public.session_links
  FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_links.session_id
        AND s.mentor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.session_registrations r
      JOIN public.sessions s ON s.id = r.session_id
      WHERE r.session_id = session_links.session_id
        AND r.student_id = auth.uid()
        AND r.status = 'registered'
        AND s.status = 'approved'
        AND (s.price_inr = 0 OR r.payment_status IN ('verified', 'paid'))
    )
  );

-- 8. Enhanced View for Admin Payment Audit
CREATE OR REPLACE VIEW public.admin_payment_verifications_view AS
SELECT
  r.id AS registration_id,
  r.session_id,
  r.student_id,
  r.status AS registration_status,
  r.payment_status,
  r.payment_method,
  r.transaction_reference,
  r.amount_paid,
  r.payment_submitted_at,
  r.verified_by,
  r.verified_at,
  r.rejection_reason,
  r.rejected_by,
  r.rejected_at,
  r.created_at AS registered_at,
  s.title_en AS session_title,
  s.title_ta AS session_title_ta,
  s.price_inr AS session_price,
  s.session_date,
  s.start_time,
  s.end_time,
  s.mentor_id,
  m_prof.full_name AS mentor_name,
  stu_prof.full_name AS student_name,
  stu_prof.email AS student_email,
  v_prof.full_name AS verified_by_name,
  rej_prof.full_name AS rejected_by_name
FROM public.session_registrations r
JOIN public.sessions s ON s.id = r.session_id
LEFT JOIN public.profiles stu_prof ON stu_prof.id = r.student_id
LEFT JOIN public.profiles m_prof ON m_prof.id = s.mentor_id
LEFT JOIN public.profiles v_prof ON v_prof.id = r.verified_by
LEFT JOIN public.profiles rej_prof ON rej_prof.id = r.rejected_by;

GRANT SELECT ON public.admin_payment_verifications_view TO authenticated;
