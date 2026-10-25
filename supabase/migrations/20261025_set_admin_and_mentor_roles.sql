-- ============================================================================
-- Migration / Script: 20261025_set_admin_and_mentor_roles.sql
-- Description: Assign admin and mentor roles by email in Supabase SQL Editor.
--              1. Updates protect_profiles_role and handle_mentor_profile_update
--                 triggers to permit direct SQL Editor / superuser execution
--                 (where auth.uid() is NULL).
--              2. Syncs user from auth.users to public.profiles if needed.
--              3. Sets role = 'admin' and inserts public.admin_details.
--              4. Sets role = 'mentor' and inserts approved public.mentor_profiles.
-- ============================================================================

-- Step 1: Ensure triggers allow direct SQL Editor execution (auth.uid() IS NULL)
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
    -- Allow direct DB admin / service execution from Supabase SQL Editor where auth.uid() is NULL
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Account role modifications can only be performed by platform administrators.';
    END IF;

    -- Block self-role changes even by admins via client update
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id THEN
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

CREATE OR REPLACE FUNCTION public.handle_mentor_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If updating user is authenticated client and NOT an administrator
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
      RAISE EXCEPTION 'Only platform administrators can approve mentor profiles.';
    END IF;

    NEW.review_note := OLD.review_note;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;

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

-- Step 2: Main assignment block
-- >>> INSTRUCTIONS: REPLACE THE TWO EMAILS BELOW WITH YOUR REAL ONES <<<
DO $$
DECLARE
  v_admin_email  TEXT := 'admin@example.com';   -- <-- Put your admin email here
  v_mentor_email TEXT := 'mentor@example.com';  -- <-- Put your mentor email here

  v_admin_id     UUID;
  v_mentor_id    UUID;
BEGIN
  v_admin_email  := lower(trim(v_admin_email));
  v_mentor_email := lower(trim(v_mentor_email));

  -- 1. Sync from auth.users into public.profiles if missing
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url, created_at, updated_at)
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ),
    'student',
    COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ),
    NOW(),
    NOW()
  FROM auth.users u
  WHERE lower(trim(u.email)) IN (v_admin_email, v_mentor_email)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- 2. Set Admin role & admin_details
  SELECT id INTO v_admin_id 
  FROM public.profiles 
  WHERE lower(trim(email)) = v_admin_email;

  IF v_admin_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin',
        updated_at = NOW()
    WHERE id = v_admin_id;

    INSERT INTO public.admin_details (id, designation, created_at, updated_at)
    VALUES (v_admin_id, 'Platform Administrator', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      designation = 'Platform Administrator',
      updated_at = NOW();

    RAISE NOTICE 'SUCCESS: Assigned ADMIN role to % (ID: %)', v_admin_email, v_admin_id;
  ELSE
    RAISE WARNING 'User with email "%" was not found in auth.users. Please ensure this user has signed up once first.', v_admin_email;
  END IF;

  -- 3. Set Mentor role & approved mentor_profiles
  SELECT id INTO v_mentor_id 
  FROM public.profiles 
  WHERE lower(trim(email)) = v_mentor_email;

  IF v_mentor_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'mentor',
        updated_at = NOW()
    WHERE id = v_mentor_id;

    INSERT INTO public.mentor_profiles (
      id,
      headline,
      organisation,
      expertise,
      languages,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_mentor_id,
      'Higher Education & Career Mentor',
      'AGATHIYA Guidance Network',
      ARRAY['Engineering Admissions', 'TNEA Counseling', 'Career Guidance'],
      ARRAY['Tamil', 'English'],
      'approved',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = 'approved',
      updated_at = NOW();

    RAISE NOTICE 'SUCCESS: Assigned MENTOR role to % (ID: %)', v_mentor_email, v_mentor_id;
  ELSE
    RAISE WARNING 'User with email "%" was not found in auth.users. Please ensure this user has signed up once first.', v_mentor_email;
  END IF;

END $$;

-- Step 3: View current admins and mentors
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.updated_at
FROM public.profiles p
WHERE p.role IN ('admin', 'mentor')
ORDER BY p.role, p.email;
