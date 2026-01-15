-- Fix security vulnerability: Restrict admin_settings to authenticated users only
DROP POLICY IF EXISTS "Anyone can view admin settings" ON public.admin_settings;

CREATE POLICY "Authenticated users can view admin settings" 
ON public.admin_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security vulnerability: Restrict grove_activities to authenticated users only
DROP POLICY IF EXISTS "Anyone can view grove activities" ON public.grove_activities;

CREATE POLICY "Authenticated users can view grove activities" 
ON public.grove_activities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);