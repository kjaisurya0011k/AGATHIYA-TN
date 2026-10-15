-- ============================================================================
-- Migration: 20261015_deletion_requests.sql
-- Description: Creates deletion_requests table with RLS and user isolation.
-- Note: Additive only. Does not alter or drop any existing tables.
-- ============================================================================

-- 1. Create deletion_requests table
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Authenticated users can read only their own deletion requests; Admins can read all
DROP POLICY IF EXISTS "Users can read own deletion_requests" ON public.deletion_requests;
CREATE POLICY "Users can read own deletion_requests"
  ON public.deletion_requests
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Policy: Authenticated users can insert only their own deletion request
DROP POLICY IF EXISTS "Users can insert own deletion_requests" ON public.deletion_requests;
CREATE POLICY "Users can insert own deletion_requests"
  ON public.deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Only platform administrators can update deletion requests (e.g. mark status completed)
DROP POLICY IF EXISTS "Admins can update deletion_requests" ON public.deletion_requests;
CREATE POLICY "Admins can update deletion_requests"
  ON public.deletion_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
