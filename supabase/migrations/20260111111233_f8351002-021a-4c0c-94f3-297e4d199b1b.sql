-- Create a table to track user watering actions (to prevent abuse)
CREATE TABLE IF NOT EXISTS public.user_watering_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  watered_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, watered_date)
);

-- Enable RLS on the watering log
ALTER TABLE public.user_watering_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own watering log
CREATE POLICY "Users can view their own watering log"
ON public.user_watering_log
FOR SELECT
USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE/DELETE - only via secure function

-- Drop the existing permissive policies on global_oxygen
DROP POLICY IF EXISTS "Authenticated users can insert global oxygen" ON public.global_oxygen;
DROP POLICY IF EXISTS "Authenticated users can update global oxygen" ON public.global_oxygen;

-- Create secure function to increment global oxygen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_global_oxygen()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_today date;
  v_existing_record record;
  v_result jsonb;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  v_today := CURRENT_DATE;

  -- Check if user already watered today
  IF EXISTS (
    SELECT 1 FROM public.user_watering_log 
    WHERE user_id = v_user_id AND watered_date = v_today
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Already watered today',
      'already_watered', true
    );
  END IF;

  -- Record the user's watering action
  INSERT INTO public.user_watering_log (user_id, watered_date)
  VALUES (v_user_id, v_today);

  -- Get or create today's global oxygen record
  SELECT * INTO v_existing_record 
  FROM public.global_oxygen 
  WHERE date = v_today;

  IF v_existing_record IS NULL THEN
    -- Create new record for today
    INSERT INTO public.global_oxygen (date, water_count, target_count)
    VALUES (v_today, 1, 100)
    RETURNING * INTO v_existing_record;
  ELSE
    -- Update existing record (increment water_count)
    UPDATE public.global_oxygen
    SET water_count = water_count + 1,
        -- Activate bonus when reaching target (1 hour duration)
        bonus_active_until = CASE 
          WHEN water_count + 1 >= target_count AND bonus_active_until IS NULL 
          THEN now() + interval '1 hour'
          ELSE bonus_active_until
        END
    WHERE id = v_existing_record.id
    RETURNING * INTO v_existing_record;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'water_count', v_existing_record.water_count,
    'target_count', v_existing_record.target_count,
    'bonus_active_until', v_existing_record.bonus_active_until,
    'already_watered', false
  );
END;
$$;

-- Create function to check if user has watered today
CREATE OR REPLACE FUNCTION public.has_watered_today()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_watering_log 
    WHERE user_id = auth.uid() AND watered_date = CURRENT_DATE
  );
$$;