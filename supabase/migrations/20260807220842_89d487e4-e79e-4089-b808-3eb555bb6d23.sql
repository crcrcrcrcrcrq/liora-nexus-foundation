-- Cloud defaults grant ALL on new public tables to anon/authenticated.
-- Narrow that down to the least privilege each role actually needs.
REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;