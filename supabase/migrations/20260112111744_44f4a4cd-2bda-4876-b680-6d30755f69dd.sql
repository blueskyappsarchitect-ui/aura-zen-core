-- First create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  );
$$;

-- Policy for admin_users
CREATE POLICY "Only admins can view admin users"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Now create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (for maintenance mode check)
CREATE POLICY "Anyone can view admin settings"
ON public.admin_settings
FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES 
  ('maintenance_mode', '{"enabled": false, "message": ""}'),
  ('global_broadcast', '{"active": false, "message": "", "expires_at": null}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for admin_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;