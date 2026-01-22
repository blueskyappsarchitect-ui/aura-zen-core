-- Drop and recreate the view with security_invoker enabled
-- This ensures the view respects the RLS policies on the base user_profiles table
DROP VIEW IF EXISTS public.user_profiles_public;

CREATE VIEW public.user_profiles_public 
WITH (security_invoker = on) AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  vine_species,
  last_seen
FROM public.user_profiles;