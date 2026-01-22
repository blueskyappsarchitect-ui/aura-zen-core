-- Fix 1: Restrict user_profiles SELECT to own row only
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.user_profiles;

CREATE POLICY "Users can only view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 2: Restrict grove_activities SELECT to own activities only
DROP POLICY IF EXISTS "Authenticated users can view grove activities" ON public.grove_activities;

CREATE POLICY "Users can only view their own activities"
ON public.grove_activities
FOR SELECT
USING (auth.uid() = user_id);