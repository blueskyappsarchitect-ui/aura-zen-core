-- Fix 1: Update update_last_seen function with rate limiting
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_update timestamp with time zone;
BEGIN
  SELECT last_seen INTO v_last_update
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Only update if more than 25 seconds have passed (rate limiting)
  IF v_last_update IS NULL OR 
     (now() - v_last_update) > interval '25 seconds' THEN
    UPDATE user_profiles
    SET last_seen = now()
    WHERE user_id = auth.uid();
  END IF;
END;
$$;

-- Fix 2: Update tasks INSERT policy with daily limit (100 per day)
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;

CREATE POLICY "Users can create their own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (SELECT COUNT(*) FROM public.tasks 
   WHERE user_id = auth.uid() 
   AND task_date = CURRENT_DATE) < 100
);

-- Fix 3: Update grove_activities INSERT policy with hourly limit (20 per hour)
DROP POLICY IF EXISTS "Users can create their own activities" ON public.grove_activities;

CREATE POLICY "Users can create their own activities"
ON public.grove_activities
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (SELECT COUNT(*) FROM public.grove_activities 
   WHERE user_id = auth.uid() 
   AND created_at > now() - interval '1 hour') < 20
);

-- Fix 4: Add daily limit for sunshine nudges (20 per day per sender)
DROP POLICY IF EXISTS "Users can send sunshine nudges" ON public.sunshine_nudges;

CREATE POLICY "Users can send sunshine nudges"
ON public.sunshine_nudges
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  (SELECT COUNT(*) FROM public.sunshine_nudges 
   WHERE sender_id = auth.uid() 
   AND created_at > now() - interval '1 day') < 20
);