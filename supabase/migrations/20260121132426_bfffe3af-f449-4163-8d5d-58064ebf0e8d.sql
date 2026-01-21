-- Enable RLS on user_profiles_public view (it's actually a view, so we need to handle it differently)
-- First, let's check if this is a view and add RLS to the underlying table

-- The user_profiles_public is a VIEW, not a table, so we need to ensure the underlying 
-- user_profiles table has proper RLS (which it does), but we should also secure the view

-- For views, we need to use security_invoker or drop and recreate with proper security
-- Let's drop the view and recreate it with SECURITY INVOKER to respect RLS

DROP VIEW IF EXISTS public.user_profiles_public;

CREATE VIEW public.user_profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  display_name,
  avatar_url,
  vine_species,
  last_seen
FROM public.user_profiles;

-- Grant select to authenticated users only
REVOKE ALL ON public.user_profiles_public FROM anon;
REVOKE ALL ON public.user_profiles_public FROM public;
GRANT SELECT ON public.user_profiles_public TO authenticated;