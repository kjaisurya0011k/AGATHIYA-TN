-- ============================================================================
-- Migration: 20261015_sessions_and_achievements.sql
-- Description: Creates sessions, session_links, session_registrations,
--              achievements, achievement_images tables, storage bucket,
--              security-definer functions (is_mentor, admin_set_role),
--              approval & auto-revert triggers, and strict RLS policies.
-- Note: Additive migration only. Do NOT run against database until reviewed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Security Functions: is_admin() and is_mentor()
-- ----------------------------------------------------------------------------

-- Ensure is_admin() exists and is STABLE SECURITY DEFINER (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper to check if current authenticated user has role 'mentor'
CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'mentor'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Role Security: admin_set_role(...) and Enhanced profiles Role Guard
-- ----------------------------------------------------------------------------

-- Admin-only security definer function to change user roles
-- Rules enforced:
-- 1. Caller must be an admin.
-- 2. Admins cannot change their own role (prevents accidental lockout).
-- 3. Cannot remove or demote the last remaining administrator.
-- 4. Validates new_role is one of ('student', 'mentor', 'admin').
CREATE OR REPLACE FUNCTION public.admin_set_role(
  target_user UUID,
  new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_current_role TEXT;
  v_admin_count INT;
BEGIN
  -- 1. Verify caller is an active platform administrator
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Platform administrator privileges required.';
  END IF;

  -- 2. Prevent self-role modification
  IF target_user = v_caller THEN
    RAISE EXCEPTION 'Security Policy: Administrators cannot modify their own role.';
  END IF;

  -- 3. Validate new role value
  IF new_role NOT IN ('student', 'mentor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be student, mentor, or admin.', new_role;
  END IF;

  -- 4. Retrieve target user current role
  SELECT role INTO v_current_role
  FROM public.profiles
  WHERE id = target_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found in profiles registry.';
  END IF;

  -- 5. Prevent demoting or removing the last administrator
  IF v_current_role = 'admin' AND new_role <> 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles
    WHERE role = 'admin' AND id <> target_user;

    IF v_admin_count < 1 THEN
      RAISE EXCEPTION 'Safety Guard: Cannot demote the last remaining administrator on the platform.';
    END IF;
  END IF;

  -- 6. Perform role update
  UPDATE public.profiles
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user,
    'old_role', v_current_role,
    'new_role', new_role,
    'updated_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, TEXT) TO authenticated;

-- Enhanced profiles role change trigger:
-- Normal users can NEVER change their own role or anyone else's role directly.
-- Direct updates to profiles.role can only proceed if caller is an admin,
-- is not changing their own role, and is not removing the last admin.
CREATE OR REPLACE FUNCTION public.protect_profiles_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count INT;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if authenticated caller is an admin
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Account role modifications can only be performed by platform administrators.';
    END IF;

    -- Block self-role changes even by admins via direct SQL/client update
    IF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'Security Policy: Administrators cannot modify their own role.';
    END IF;

    -- Check last admin constraint
    IF OLD.role = 'admin' AND NEW.role <> 'admin' THEN
      SELECT COUNT(*) INTO v_admin_count
      FROM public.profiles
      WHERE role = 'admin' AND id <> OLD.id;

      IF v_admin_count < 1 THEN
        RAISE EXCEPTION 'Safety Guard: Cannot remove the last platform administrator.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_role ON public.profiles;
CREATE TRIGGER trg_protect_profiles_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_role();

-- ----------------------------------------------------------------------------
-- 3. Sessions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ta TEXT,
  description_en TEXT NOT NULL,
  description_ta TEXT,
  topic TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('Class 11', 'Class 12', 'Both')),
  language TEXT NOT NULL DEFAULT 'Tamil',
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  mode TEXT NOT NULL DEFAULT 'online' CHECK (mode IN ('online', 'offline', 'hybrid')),
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  price_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price_inr >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_session_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status_date ON public.sessions(status, session_date);

-- ----------------------------------------------------------------------------
-- 4. Session Links Table (Separated for Meeting URL Security)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_links (
  session_id UUID PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  meeting_link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Session Registrations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'not_required' CHECK (payment_status IN ('not_required', 'pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_session_id ON public.session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON public.session_registrations(student_id);

-- ----------------------------------------------------------------------------
-- 6. Achievements and Achievement Images Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ta TEXT,
  description_en TEXT NOT NULL,
  description_ta TEXT,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('hackathon', 'workshop', 'school_collaboration', 'award')),
  event_date DATE NOT NULL,
  school_name TEXT,
  town TEXT,
  winners_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  photo_consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_photo_consent_on_publish CHECK (
    status <> 'published' OR photo_consent_confirmed = TRUE
  )
);

CREATE INDEX IF NOT EXISTS idx_achievements_status_date ON public.achievements(status, event_date);

CREATE TABLE IF NOT EXISTS public.achievement_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievement_images_achievement_id ON public.achievement_images(achievement_id, sort_order);

-- ----------------------------------------------------------------------------
-- 7. Supabase Storage: achievement-images Bucket & Storage Policies
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-images',
  'achievement-images',
  true,
  2097152, -- 2MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS: Public can read images
DROP POLICY IF EXISTS "Public can view achievement images" ON storage.objects;
CREATE POLICY "Public can view achievement images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'achievement-images');

-- Storage RLS: Only admins can upload images
DROP POLICY IF EXISTS "Admins can upload achievement images" ON storage.objects;
CREATE POLICY "Admins can upload achievement images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'achievement-images'
    AND public.is_admin()
  );

-- Storage RLS: Only admins can update images
DROP POLICY IF EXISTS "Admins can update achievement images" ON storage.objects;
CREATE POLICY "Admins can update achievement images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'achievement-images'
    AND public.is_admin()
  );

-- Storage RLS: Only admins can delete images
DROP POLICY IF EXISTS "Admins can delete achievement images" ON storage.objects;
CREATE POLICY "Admins can delete achievement images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'achievement-images'
    AND public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 8. Business Logic Triggers for Sessions & Registrations
-- ----------------------------------------------------------------------------

-- Trigger 1: Enforce mentor session rules & auto-revert approved sessions
CREATE OR REPLACE FUNCTION public.handle_session_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_adm BOOLEAN := public.is_admin();
BEGIN
  -- If updating/inserting user is NOT an administrator
  IF NOT v_is_adm THEN
    -- A mentor can set status only to 'draft' or 'pending'
    IF NEW.status IN ('approved', 'rejected') AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('approved', 'rejected')) THEN
      RAISE EXCEPTION 'Only platform administrators can approve or reject sessions.';
    END IF;

    -- Non-admin cannot modify admin review fields
    IF TG_OP = 'UPDATE' THEN
      NEW.admin_note := OLD.admin_note;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.reviewed_at := OLD.reviewed_at;

      -- If editing key fields on an APPROVED session, automatically revert to 'pending'
      IF OLD.status = 'approved' AND (
        NEW.title_en IS DISTINCT FROM OLD.title_en OR
        NEW.title_ta IS DISTINCT FROM OLD.title_ta OR
        NEW.description_en IS DISTINCT FROM OLD.description_en OR
        NEW.description_ta IS DISTINCT FROM OLD.description_ta OR
        NEW.session_date IS DISTINCT FROM OLD.session_date OR
        NEW.start_time IS DISTINCT FROM OLD.start_time OR
        NEW.end_time IS DISTINCT FROM OLD.end_time OR
        NEW.price_inr IS DISTINCT FROM OLD.price_inr OR
        NEW.capacity IS DISTINCT FROM OLD.capacity
      ) THEN
        NEW.status := 'pending';
      END IF;
    END IF;
  ELSE
    -- If admin is approving/rejecting, timestamp and record review metadata
    IF TG_OP = 'UPDATE' AND NEW.status IN ('approved', 'rejected') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := NOW();
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_session_mutations ON public.sessions;
CREATE TRIGGER trg_session_mutations
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_session_mutations();

-- Trigger 2: Automatic payment_status assignment on registration
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

  -- On INSERT, auto-assign initial payment_status based on price
  IF TG_OP = 'INSERT' THEN
    IF v_session_price = 0 THEN
      NEW.payment_status := 'not_required';
    ELSE
      NEW.payment_status := 'pending';
    END IF;
  END IF;

  -- On UPDATE, only admins can mark payment as 'paid'
  IF TG_OP = 'UPDATE' AND NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only platform administrators can modify registration payment status.';
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

-- ----------------------------------------------------------------------------
-- 9. Secure View: Mentor Session Registrations (Student Privacy Shield)
-- Ensures mentors see registered student names and counts, NEVER phone numbers,
-- community, marks, annual income, or guardian private details.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.mentor_session_registrations_view AS
SELECT
  r.id AS registration_id,
  r.session_id,
  r.student_id,
  r.status AS registration_status,
  r.payment_status,
  r.created_at AS registered_at,
  p.full_name AS student_name,
  s.mentor_id
FROM public.session_registrations r
JOIN public.sessions s ON s.id = r.session_id
JOIN public.profiles p ON p.id = r.student_id;

GRANT SELECT ON public.mentor_session_registrations_view TO authenticated;

-- ----------------------------------------------------------------------------
-- 10. Row Level Security Policies
-- ----------------------------------------------------------------------------

-- ---------------------------
-- 10.1 SESSIONS RLS
-- ---------------------------
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
-- Admins: all sessions
-- Mentors: own sessions
-- Students/Public: approved sessions with future or current date
DROP POLICY IF EXISTS "Sessions select policy" ON public.sessions;
CREATE POLICY "Sessions select policy"
  ON public.sessions
  FOR SELECT
  USING (
    public.is_admin()
    OR (mentor_id = auth.uid())
    OR (status = 'approved' AND session_date >= CURRENT_DATE)
  );

-- INSERT Policy
-- Admins: can insert any session
-- Mentors: can insert own sessions with draft or pending status
DROP POLICY IF EXISTS "Sessions insert policy" ON public.sessions;
CREATE POLICY "Sessions insert policy"
  ON public.sessions
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      mentor_id = auth.uid()
      AND status IN ('draft', 'pending')
    )
  );

-- UPDATE Policy
-- Admins: can update any session
-- Mentors: can update own sessions
DROP POLICY IF EXISTS "Sessions update policy" ON public.sessions;
CREATE POLICY "Sessions update policy"
  ON public.sessions
  FOR UPDATE
  USING (
    public.is_admin()
    OR mentor_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin()
    OR mentor_id = auth.uid()
  );

-- DELETE Policy
-- Admins: can delete any session
-- Mentors: can delete own sessions only if draft or cancelled
DROP POLICY IF EXISTS "Sessions delete policy" ON public.sessions;
CREATE POLICY "Sessions delete policy"
  ON public.sessions
  FOR DELETE
  USING (
    public.is_admin()
    OR (
      mentor_id = auth.uid()
      AND status IN ('draft', 'cancelled')
    )
  );

-- ---------------------------
-- 10.2 SESSION_LINKS RLS
-- ---------------------------
ALTER TABLE public.session_links ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
-- Admins: all meeting links
-- Mentors: meeting link for own sessions
-- Students: meeting link ONLY if registered for an approved session
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
    )
  );

-- INSERT / UPDATE / DELETE Policy
-- Only Admins or the mentor who owns the session
DROP POLICY IF EXISTS "Session links insert policy" ON public.session_links;
CREATE POLICY "Session links insert policy"
  ON public.session_links
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_links.session_id
        AND s.mentor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Session links update policy" ON public.session_links;
CREATE POLICY "Session links update policy"
  ON public.session_links
  FOR UPDATE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_links.session_id
        AND s.mentor_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_links.session_id
        AND s.mentor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Session links delete policy" ON public.session_links;
CREATE POLICY "Session links delete policy"
  ON public.session_links
  FOR DELETE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_links.session_id
        AND s.mentor_id = auth.uid()
    )
  );

-- ---------------------------
-- 10.3 SESSION_REGISTRATIONS RLS
-- ---------------------------
ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
-- Admins: all registrations
-- Students: their own registrations
-- Mentors: registrations for sessions they created
DROP POLICY IF EXISTS "Session registrations select policy" ON public.session_registrations;
CREATE POLICY "Session registrations select policy"
  ON public.session_registrations
  FOR SELECT
  USING (
    public.is_admin()
    OR student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_registrations.session_id
        AND s.mentor_id = auth.uid()
    )
  );

-- INSERT Policy
-- Students can insert ONLY their own registration for approved, upcoming sessions
DROP POLICY IF EXISTS "Session registrations insert policy" ON public.session_registrations;
CREATE POLICY "Session registrations insert policy"
  ON public.session_registrations
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      student_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = session_registrations.session_id
          AND s.status = 'approved'
          AND s.session_date >= CURRENT_DATE
      )
    )
  );

-- UPDATE Policy
-- Students can cancel or re-register their own registration
-- Admins can update any registration (including payment_status)
DROP POLICY IF EXISTS "Session registrations update policy" ON public.session_registrations;
CREATE POLICY "Session registrations update policy"
  ON public.session_registrations
  FOR UPDATE
  USING (
    public.is_admin()
    OR student_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin()
    OR student_id = auth.uid()
  );

-- ---------------------------
-- 10.4 ACHIEVEMENTS RLS
-- ---------------------------
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
-- Signed-in users can read published achievements; Admins can read all (including drafts)
DROP POLICY IF EXISTS "Achievements select policy" ON public.achievements;
CREATE POLICY "Achievements select policy"
  ON public.achievements
  FOR SELECT
  USING (
    public.is_admin()
    OR (auth.role() = 'authenticated' AND status = 'published')
  );

-- INSERT / UPDATE / DELETE Policies: Admin Only
DROP POLICY IF EXISTS "Achievements admin insert policy" ON public.achievements;
CREATE POLICY "Achievements admin insert policy"
  ON public.achievements
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Achievements admin update policy" ON public.achievements;
CREATE POLICY "Achievements admin update policy"
  ON public.achievements
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Achievements admin delete policy" ON public.achievements;
CREATE POLICY "Achievements admin delete policy"
  ON public.achievements
  FOR DELETE
  USING (public.is_admin());

-- ---------------------------
-- 10.5 ACHIEVEMENT_IMAGES RLS
-- ---------------------------
ALTER TABLE public.achievement_images ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
-- Signed-in users can read images for published achievements; Admins can read all
DROP POLICY IF EXISTS "Achievement images select policy" ON public.achievement_images;
CREATE POLICY "Achievement images select policy"
  ON public.achievement_images
  FOR SELECT
  USING (
    public.is_admin()
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.achievements a
        WHERE a.id = achievement_images.achievement_id
          AND a.status = 'published'
      )
    )
  );

-- INSERT / UPDATE / DELETE Policies: Admin Only
DROP POLICY IF EXISTS "Achievement images admin insert policy" ON public.achievement_images;
CREATE POLICY "Achievement images admin insert policy"
  ON public.achievement_images
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Achievement images admin update policy" ON public.achievement_images;
CREATE POLICY "Achievement images admin update policy"
  ON public.achievement_images
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Achievement images admin delete policy" ON public.achievement_images;
CREATE POLICY "Achievement images admin delete policy"
  ON public.achievement_images
  FOR DELETE
  USING (public.is_admin());
