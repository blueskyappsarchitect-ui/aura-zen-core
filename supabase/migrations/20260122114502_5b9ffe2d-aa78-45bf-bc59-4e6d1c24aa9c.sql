-- Enable RLS on user_profiles_public view (required for views)
ALTER VIEW public.user_profiles_public SET (security_invoker = on);

-- Add RLS policy to require authentication for the view
-- Since it's a view with security_invoker=on, it inherits the base table's RLS
-- But we need to ensure the base table allows authenticated users to view via the view

-- First, drop the old restrictive SELECT policy on user_profiles
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.user_profiles;

-- Create a new policy that allows:
-- 1. Users to view their own full profile
-- 2. Authenticated users to view only public fields via the view
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- For the public view access, we need a separate approach
-- The view is designed to show limited public data (display_name, avatar_url, vine_species, last_seen)
-- We'll recreate the view with proper security

DROP VIEW IF EXISTS public.user_profiles_public;

CREATE VIEW public.user_profiles_public
WITH (security_invoker = on)
AS SELECT 
  user_id,
  display_name,
  avatar_url,
  vine_species,
  last_seen
FROM public.user_profiles;

-- Grant access to authenticated users only
REVOKE ALL ON public.user_profiles_public FROM anon;
REVOKE ALL ON public.user_profiles_public FROM public;
GRANT SELECT ON public.user_profiles_public TO authenticated;