-- ============================================================================
-- Migration: 20261015_mentor_and_admin_profiles.sql
-- Description: Creates mentor_profiles and admin_details tables, RLS policies,
--              status reset trigger on mentor public edits, approved mentors view,
--              and security-definer is_admin helper to prevent policy recursion.
-- Note: Additive only. Does not drop or mutate existing tables.
-- ============================================================================

-- 1. Helper function: check if current authenticated user has role 'admin'
-- Security definer avoids infinite recursion when evaluating RLS policies.
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

-- 2. Create mentor_profiles table
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT,
  headline TEXT,
  organisation TEXT,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  years_of_experience NUMERIC(4, 1),
  qualifications TEXT,
  languages TEXT[] NOT NULL DEFAULT '{"Tamil", "English"}',
  bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 500),
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'needs_changes')),
  review_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create admin_details table
CREATE TABLE IF NOT EXISTS public.admin_details (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Trigger Function: enforce mentor editing rules & reset approved status on public edits
CREATE OR REPLACE FUNCTION public.handle_mentor_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If updating user is NOT an administrator
  IF NOT public.is_admin() THEN
    -- Non-admin cannot set status to 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
      RAISE EXCEPTION 'Only platform administrators can approve mentor profiles.';
    END IF;

    -- Non-admin cannot modify admin review fields
    NEW.review_note := OLD.review_note;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;

    -- When a mentor edits public-facing fields after approval, send status back to pending_review
    IF OLD.status = 'approved' AND (
      NEW.headline IS DISTINCT FROM OLD.headline OR
      NEW.organisation IS DISTINCT FROM OLD.organisation OR
      NEW.expertise IS DISTINCT FROM OLD.expertise OR
      NEW.bio IS DISTINCT FROM OLD.bio
    ) THEN
      NEW.status := 'pending_review';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mentor_profile_update ON public.mentor_profiles;
CREATE TRIGGER trg_mentor_profile_update
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_mentor_profile_update();

-- 5. Row Level Security on mentor_profiles
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- Mentors read their own row; Admins read all rows
DROP POLICY IF EXISTS "Mentors read own row or admin read all" ON public.mentor_profiles;
CREATE POLICY "Mentors read own row or admin read all"
  ON public.mentor_profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Mentors insert their own row (cannot set status to 'approved')
DROP POLICY IF EXISTS "Mentors can insert own row" ON public.mentor_profiles;
CREATE POLICY "Mentors can insert own row"
  ON public.mentor_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND (public.is_admin() OR status IN ('draft', 'pending_review'))
  );

-- Mentors update their own row; Admins can update any row
DROP POLICY IF EXISTS "Mentors update own row or admin update all" ON public.mentor_profiles;
CREATE POLICY "Mentors update own row or admin update all"
  ON public.mentor_profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6. Public View for Approved Mentor Cards (Session cards)
-- Exposes ONLY public card fields: name, headline, organisation, expertise, bio, languages, years_of_experience
CREATE OR REPLACE VIEW public.approved_mentors_view AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  m.headline,
  m.organisation,
  m.expertise,
  m.bio,
  m.languages,
  m.years_of_experience
FROM public.mentor_profiles m
JOIN public.profiles p ON p.id = m.id
WHERE m.status = 'approved';

GRANT SELECT ON public.approved_mentors_view TO anon, authenticated;

-- 7. Row Level Security on admin_details
ALTER TABLE public.admin_details ENABLE ROW LEVEL SECURITY;

-- Admins can read their own row
DROP POLICY IF EXISTS "Admins read own admin_details" ON public.admin_details;
CREATE POLICY "Admins read own admin_details"
  ON public.admin_details
  FOR SELECT
  USING (auth.uid() = id AND public.is_admin());

-- Admins can insert their own row
DROP POLICY IF EXISTS "Admins insert own admin_details" ON public.admin_details;
CREATE POLICY "Admins insert own admin_details"
  ON public.admin_details
  FOR INSERT
  WITH CHECK (auth.uid() = id AND public.is_admin());

-- Admins can update their own row
DROP POLICY IF EXISTS "Admins update own admin_details" ON public.admin_details;
CREATE POLICY "Admins update own admin_details"
  ON public.admin_details
  FOR UPDATE
  USING (auth.uid() = id AND public.is_admin())
  WITH CHECK (auth.uid() = id AND public.is_admin());
