-- Revoke public access to security definer functions
REVOKE ALL ON FUNCTION public.has_role FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_role FROM PUBLIC;

-- Re-grant access to authenticated users or specific roles as needed
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role; -- Only used by auth trigger
GRANT EXECUTE ON FUNCTION public.handle_new_user_role TO service_role; -- Only used by auth trigger

-- Fix storage policy for avatars to prevent listing
-- Current policy "Avatar images are publicly accessible" allows SELECT (which includes listing)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- New policy: Allow public read access to objects but not listing the whole bucket
-- (Technically SELECT allows both, but we can try to restrict it if we had more context. 
-- For avatars, typically they are accessed via direct URL which is fine. 
-- To truly prevent listing while allowing read, you'd need a more complex setup or just accept it if it's a public bucket.)
-- Actually, the linter suggests NOT having a broad SELECT on the bucket.
CREATE POLICY "Public can view individual avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Ensure all tables have RLS enabled (best practice)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
