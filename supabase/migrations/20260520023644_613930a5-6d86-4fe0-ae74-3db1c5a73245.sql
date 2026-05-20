REVOKE EXECUTE ON FUNCTION public.has_role FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO service_role;
