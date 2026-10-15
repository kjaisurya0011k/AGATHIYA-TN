-- ============================================================================
-- Migration: 20261015_avatar_storage_and_profiles.sql
-- Description: Profile photo upload support for all roles (student, mentor, admin).
--              1. Adds avatar_path and avatar_updated_at to public.profiles.
--              2. Creates private storage bucket 'avatars' (public = false, 2MB, JPG/PNG/WEBP only).
--              3. Configures RLS policies on storage.objects for 'avatars'.
--              4. Enforces avatar_path ownership constraint and update trigger.
-- Note: Additive migration only. DO NOT apply directly without user review.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Function: is_admin() (Idempotent Security-Definer Check)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. Add avatar_path & avatar_updated_at Columns to public.profiles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_path TEXT,
  ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMPTZ;

-- Comment on columns for schema documentation
COMMENT ON COLUMN public.profiles.avatar_path IS 'Path to custom uploaded avatar in private avatars bucket (e.g. {user_id}/avatar.webp)';
COMMENT ON COLUMN public.profiles.avatar_updated_at IS 'Timestamp of last avatar upload, used for cache-busting signed URLs';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Google OAuth profile photo URL, kept as fallback when avatar_path is null';

-- ----------------------------------------------------------------------------
-- 3. Constraint: profiles.avatar_path Must Start with user's own id + '/'
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_avatar_path_prefix'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT chk_profiles_avatar_path_prefix
      CHECK (avatar_path IS NULL OR avatar_path LIKE (id::text || '/%'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Trigger: Enforce avatar update authorization & timestamp synchronization
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_profile_avatar_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- A. Ensure non-admin users cannot update another user's avatar fields
  IF (auth.uid() IS NOT NULL AND auth.uid() <> OLD.id AND NOT public.is_admin()) THEN
    IF (NEW.avatar_path IS DISTINCT FROM OLD.avatar_path OR NEW.avatar_updated_at IS DISTINCT FROM OLD.avatar_updated_at) THEN
      RAISE EXCEPTION 'Unauthorized: You can only update your own profile avatar.';
    END IF;
  END IF;

  -- B. Validate avatar_path format (must start with user_id + '/')
  IF NEW.avatar_path IS NOT NULL THEN
    IF NOT (NEW.avatar_path LIKE (NEW.id::text || '/%')) THEN
      RAISE EXCEPTION 'Invalid avatar_path: Path must begin with user id (%).', (NEW.id::text || '/');
    END IF;
  END IF;

  -- C. Automatically synchronize avatar_updated_at when avatar_path changes and not explicitly set
  IF NEW.avatar_path IS DISTINCT FROM OLD.avatar_path THEN
    NEW.avatar_updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_avatar_update ON public.profiles;
CREATE TRIGGER trg_profile_avatar_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_avatar_update();

-- ----------------------------------------------------------------------------
-- 5. Create Private Storage Bucket 'avatars'
-- ----------------------------------------------------------------------------
-- Private bucket (public = false): Photos require signed URLs
-- Size limit: 2 MB (2,097,152 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp (strictly NO svg, NO gif)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ----------------------------------------------------------------------------
-- 6. Storage Policies on storage.objects for Bucket 'avatars'
-- ----------------------------------------------------------------------------

-- Policy 1: INSERT - Signed-in user can insert only into their own {user_id}/ folder
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: UPDATE - Signed-in user can update only objects in their own {user_id}/ folder
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: DELETE - Signed-in user can delete only objects in their own {user_id}/ folder
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: SELECT - Strict privacy read rules:
--   - A user can read their own avatar.
--   - Admins can read all avatars.
--   - Any signed-in user can read the avatar of an approved mentor.
--   - Student and admin avatars are NOT readable by other students or mentors.
DROP POLICY IF EXISTS "Avatars privacy read policy" ON storage.objects;
CREATE POLICY "Avatars privacy read policy"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      -- 1. User can read their own avatar
      (storage.foldername(name))[1] = auth.uid()::text
      -- 2. Admins can read all avatars
      OR public.is_admin()
      -- 3. Any signed-in user can read avatars of approved mentors
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.mentor_profiles mp ON mp.id = p.id
        WHERE p.id::text = (storage.foldername(storage.objects.name))[1]
          AND p.role = 'mentor'
          AND mp.status = 'approved'
      )
    )
  );
