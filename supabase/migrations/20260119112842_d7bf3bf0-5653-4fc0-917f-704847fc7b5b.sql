-- Add last_seen and avatar_url columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS display_name text DEFAULT 'Anonymous Gardener';

-- Create an index for efficient last_seen queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen ON public.user_profiles (last_seen);

-- Create a function to get active gardeners count (users seen in last 10 minutes)
CREATE OR REPLACE FUNCTION public.get_active_gardeners_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.user_profiles
  WHERE last_seen > (now() - interval '10 minutes');
$$;

-- Create a view for public profile data (only safe fields)
CREATE OR REPLACE VIEW public.user_profiles_public
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    display_name,
    avatar_url,
    vine_species,
    last_seen
  FROM public.user_profiles;

-- Allow authenticated users to view public profile data
CREATE POLICY "Authenticated users can view public profiles"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create function to get online founders (active in last 10 mins, limit 5)
CREATE OR REPLACE FUNCTION public.get_online_founders()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  vine_species text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.user_id,
    COALESCE(up.display_name, 'Gardener #' || LEFT(up.user_id::text, 4)) as display_name,
    up.avatar_url,
    up.vine_species
  FROM public.user_profiles up
  WHERE up.last_seen > (now() - interval '10 minutes')
  ORDER BY up.last_seen DESC
  LIMIT 5;
$$;

-- Create function to update last_seen timestamp
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_seen = now()
  WHERE user_id = auth.uid();
END;
$$;