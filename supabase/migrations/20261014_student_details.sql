-- ============================================================================
-- Migration: 20261014_student_details.sql
-- Description: Creates student_details table with RLS, check constraints,
--              auth.users trigger for profiles, and role protection.
-- Note: Additive only. Does not alter or drop existing profiles/opportunities columns.
-- ============================================================================

-- 1. Ensure auto-creation of profiles row with role 'student' on Google first login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'student',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create student_details table (Additive table referencing profiles(id))
CREATE TABLE IF NOT EXISTS public.student_details (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic Student Info
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  district TEXT NOT NULL,
  town TEXT NOT NULL,
  current_status TEXT NOT NULL,
  
  -- Academic Info (school_name optional in Step 1 draft, enforced on final consent)
  school_name TEXT,
  school_board TEXT DEFAULT 'State Board',
  group_stream TEXT DEFAULT 'Maths-Physics-Chemistry-Biology',
  
  -- Sensitive Scholarship Fields (Isolated from profiles)
  community_category TEXT DEFAULT 'Prefer not to say',
  maths_marks NUMERIC(5,2),
  physics_marks NUMERIC(5,2),
  chemistry_marks NUMERIC(5,2),
  total_percentage NUMERIC(5,2),
  cutoff_marks NUMERIC(5,2),
  annual_income_range TEXT DEFAULT 'Prefer not to say',
  
  -- Student Preferences
  interests TEXT[] DEFAULT '{}',
  preferred_language VARCHAR(5) DEFAULT 'en',
  
  -- Minor / Guardian Details (Mandatory when calculated age < 18 on final consent)
  guardian_name TEXT,
  guardian_phone VARCHAR(10),
  guardian_consent_given BOOLEAN DEFAULT FALSE,
  
  -- Consent & Data Privacy
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at TIMESTAMPTZ,
  delete_requested BOOLEAN NOT NULL DEFAULT FALSE,
  delete_requested_at TIMESTAMPTZ,
  
  -- Audit Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- CHECK Constraints
  CONSTRAINT chk_student_phone CHECK (phone_number ~ '^[6-9][0-9]{9}$'),
  CONSTRAINT chk_guardian_phone CHECK (guardian_phone IS NULL OR guardian_phone ~ '^[6-9][0-9]{9}$'),
  CONSTRAINT chk_maths_marks CHECK (maths_marks IS NULL OR (maths_marks >= 0 AND maths_marks <= 100)),
  CONSTRAINT chk_physics_marks CHECK (physics_marks IS NULL OR (physics_marks >= 0 AND physics_marks <= 100)),
  CONSTRAINT chk_chemistry_marks CHECK (chemistry_marks IS NULL OR (chemistry_marks >= 0 AND chemistry_marks <= 100)),
  CONSTRAINT chk_total_percentage CHECK (total_percentage IS NULL OR (total_percentage >= 0 AND total_percentage <= 100)),
  CONSTRAINT chk_cutoff_marks CHECK (cutoff_marks IS NULL OR (cutoff_marks >= 0 AND cutoff_marks <= 200)),
  CONSTRAINT chk_school_name_on_consent CHECK (NOT consent_given OR (school_name IS NOT NULL AND length(trim(school_name)) > 0)),
  CONSTRAINT chk_guardian_on_consent CHECK (
    NOT consent_given OR age >= 18 OR (
      guardian_name IS NOT NULL AND length(trim(guardian_name)) > 0
      AND guardian_phone IS NOT NULL AND guardian_phone ~ '^[6-9][0-9]{9}$'
      AND guardian_consent_given = TRUE
    )
  )
);

-- 3. Row Level Security for student_details
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- Policy 1: User can select own row; Admin can select all rows via profiles role check
DROP POLICY IF EXISTS "Users can read own student_details" ON public.student_details;
CREATE POLICY "Users can read own student_details"
  ON public.student_details
  FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy 2: User can insert own row only
DROP POLICY IF EXISTS "Users can insert own student_details" ON public.student_details;
CREATE POLICY "Users can insert own student_details"
  ON public.student_details
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: User can update own row only
DROP POLICY IF EXISTS "Users can update own student_details" ON public.student_details;
CREATE POLICY "Users can update own student_details"
  ON public.student_details
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Disallow public deletion directly (delete requests handled via flag or admin)
DROP POLICY IF EXISTS "Users can delete own student_details" ON public.student_details;
CREATE POLICY "Users can delete own student_details"
  ON public.student_details
  FOR DELETE
  USING (auth.uid() = id);

-- 4. Prevent users from escalating privileges by updating their own 'role' in profiles
CREATE OR REPLACE FUNCTION public.protect_profiles_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if authenticated caller is an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Account role modifications can only be performed by platform administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_role ON public.profiles;
CREATE TRIGGER trg_protect_profiles_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_role();
