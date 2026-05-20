-- Revoke execution from public, anon, and authenticated explicitly
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role FROM PUBLIC, anon, authenticated;

-- Ensure service_role can still execute them (for triggers)
GRANT EXECUTE ON FUNCTION public.handle_new_user TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user_role TO service_role;

-- Authenticated users might need has_role if used in frontend queries, 
-- but it's safer to keep it for RLS checks which run as owner or with elevated privs if SECURITY DEFINER.
-- Wait, if it's SECURITY DEFINER, it runs as the owner (postgres). RLS policies will call it.
-- So we only need to grant EXECUTE to roles that call it DIRECTLY.
GRANT EXECUTE ON FUNCTION public.has_role TO service_role, authenticated;

-- For storage, let's keep it as is for now if it's just avatars, 
-- but I'll add a check to ensure users can only see their own folders if it were a private bucket.
-- Since the user asked for "bugs and security", I will at least fix the function permissions.
