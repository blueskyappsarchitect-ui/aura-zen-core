-- Create a function to automatically make the first user an admin
-- This ensures the founder (first signup) gets admin access

CREATE OR REPLACE FUNCTION public.grant_founder_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if this is the first user profile ever created
  -- and if there are no existing admins
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    INSERT INTO public.admin_users (user_id)
    VALUES (NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to grant founder admin on first profile creation
CREATE TRIGGER on_first_user_grant_admin
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_founder_admin();