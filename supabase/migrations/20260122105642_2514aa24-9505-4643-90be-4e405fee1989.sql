-- Fix user_profiles_public view to enforce RLS
-- Drop existing view
DROP VIEW IF EXISTS public.user_profiles_public;

-- Recreate with security_invoker to respect base table RLS
CREATE VIEW public.user_profiles_public 
WITH (security_invoker = on) AS
SELECT user_id, display_name, avatar_url, vine_species, last_seen
FROM public.user_profiles;

-- Revoke all public access
REVOKE ALL ON public.user_profiles_public FROM anon;
REVOKE ALL ON public.user_profiles_public FROM public;

-- Only authenticated users can query (but RLS on base table restricts to own data)
GRANT SELECT ON public.user_profiles_public TO authenticated;