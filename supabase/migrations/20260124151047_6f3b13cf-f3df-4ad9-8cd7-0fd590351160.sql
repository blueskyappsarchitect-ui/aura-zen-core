-- Create a function to sanitize text by stripping HTML tags and limiting length
CREATE OR REPLACE FUNCTION public.sanitize_text(input_text TEXT, max_length INTEGER DEFAULT 500)
RETURNS TEXT AS $$
BEGIN
  -- Strip HTML tags and trim whitespace, then limit length
  RETURN LEFT(TRIM(REGEXP_REPLACE(COALESCE(input_text, ''), '<[^>]*>', '', 'g')), max_length);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Trigger function for tasks table validation
CREATE OR REPLACE FUNCTION public.validate_task_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize and limit title to 200 characters
  NEW.title := sanitize_text(NEW.title, 200);
  
  -- Sanitize category to 50 characters
  NEW.category := sanitize_text(NEW.category, 50);
  
  -- Validate title is not empty after sanitization
  IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
    RAISE EXCEPTION 'Task title cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for tasks table
DROP TRIGGER IF EXISTS validate_task_input_trigger ON public.tasks;
CREATE TRIGGER validate_task_input_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_input();

-- Trigger function for user_profiles table validation
CREATE OR REPLACE FUNCTION public.validate_user_profile_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize display_name to 50 characters
  NEW.display_name := sanitize_text(NEW.display_name, 50);
  
  -- Set default if empty
  IF NEW.display_name IS NULL OR LENGTH(TRIM(NEW.display_name)) = 0 THEN
    NEW.display_name := 'Anonymous Gardener';
  END IF;
  
  -- Sanitize vine_species to 50 characters
  NEW.vine_species := sanitize_text(NEW.vine_species, 50);
  
  -- Set default if empty
  IF NEW.vine_species IS NULL OR LENGTH(TRIM(NEW.vine_species)) = 0 THEN
    NEW.vine_species := 'ivy';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for user_profiles table
DROP TRIGGER IF EXISTS validate_user_profile_input_trigger ON public.user_profiles;
CREATE TRIGGER validate_user_profile_input_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_profile_input();

-- Trigger function for grove_activities table validation
CREATE OR REPLACE FUNCTION public.validate_grove_activity_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize display_name to 50 characters
  NEW.display_name := sanitize_text(NEW.display_name, 50);
  
  -- Set default if empty
  IF NEW.display_name IS NULL OR LENGTH(TRIM(NEW.display_name)) = 0 THEN
    NEW.display_name := 'Anonymous Gardener';
  END IF;
  
  -- Sanitize activity_type to 50 characters
  NEW.activity_type := sanitize_text(NEW.activity_type, 50);
  
  -- Sanitize message in activity_data if present (limit to 500 chars)
  IF NEW.activity_data ? 'message' THEN
    NEW.activity_data := jsonb_set(
      NEW.activity_data,
      '{message}',
      to_jsonb(sanitize_text(NEW.activity_data->>'message', 500))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for grove_activities table
DROP TRIGGER IF EXISTS validate_grove_activity_input_trigger ON public.grove_activities;
CREATE TRIGGER validate_grove_activity_input_trigger
  BEFORE INSERT OR UPDATE ON public.grove_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_grove_activity_input();

-- Trigger function for admin_settings table validation (for broadcast messages)
CREATE OR REPLACE FUNCTION public.validate_admin_settings_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize message in setting_value if present (limit to 500 chars)
  IF NEW.setting_value ? 'message' THEN
    NEW.setting_value := jsonb_set(
      NEW.setting_value,
      '{message}',
      to_jsonb(sanitize_text(NEW.setting_value->>'message', 500))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for admin_settings table
DROP TRIGGER IF EXISTS validate_admin_settings_input_trigger ON public.admin_settings;
CREATE TRIGGER validate_admin_settings_input_trigger
  BEFORE INSERT OR UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_settings_input();