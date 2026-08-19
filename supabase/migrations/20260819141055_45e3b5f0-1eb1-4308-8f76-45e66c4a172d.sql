
-- 1. admin_settings: admin-only read + delete
DROP POLICY IF EXISTS "Authenticated users can view admin settings" ON public.admin_settings;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_settings' AND policyname='Admins can view settings') THEN
    CREATE POLICY "Admins can view settings" ON public.admin_settings
      FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_settings' AND policyname='Admins can delete settings') THEN
    CREATE POLICY "Admins can delete settings" ON public.admin_settings
      FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
  END IF;
END $$;

REVOKE ALL ON public.admin_settings FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;

-- 2. Remove admin_settings from realtime publication
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='admin_settings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_settings';
  END IF;
END $$;

-- 3. Safe read-only accessor for non-sensitive public app settings
CREATE OR REPLACE FUNCTION public.get_public_app_settings()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    jsonb_object_agg(setting_key, setting_value),
    '{}'::jsonb
  )
  FROM public.admin_settings
  WHERE setting_key IN ('maintenance_mode', 'global_broadcast');
$$;

-- 4. Lock down function execution
REVOKE ALL ON FUNCTION public.get_public_app_settings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_app_settings() TO authenticated, service_role;

-- Trigger-only functions: nobody should call these directly
REVOKE ALL ON FUNCTION public.grant_founder_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_admin_settings_input() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_grove_activity_input() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_task_input() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_user_profile_input() FROM PUBLIC, anon, authenticated;

-- App RPCs: authenticated (and service_role) only, never anon
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_watered_today() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_watered_today() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.increment_global_oxygen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_global_oxygen() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_last_seen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_last_seen() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_active_gardeners_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_gardeners_count() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_online_founders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_online_founders() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.sanitize_text(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sanitize_text(text, integer) TO authenticated, service_role;
