-- Global oxygen: signed-in only
DROP POLICY IF EXISTS "Anyone can view global oxygen" ON public.global_oxygen;
REVOKE SELECT ON public.global_oxygen FROM anon;
GRANT SELECT ON public.global_oxygen TO authenticated;
CREATE POLICY "Signed-in users can view global oxygen" ON public.global_oxygen
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Award log for server-decided points
CREATE TABLE public.aura_award_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  awarded_on date NOT NULL DEFAULT CURRENT_DATE,
  points integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aura_award_log TO authenticated;
GRANT ALL ON public.aura_award_log TO service_role;
ALTER TABLE public.aura_award_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own awards" ON public.aura_award_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX ON public.aura_award_log (user_id, action, awarded_on);

-- Block direct score changes from clients
CREATE OR REPLACE FUNCTION public.protect_aura_score()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(current_setting('app.aura_award', true), '') = 'on'
     OR coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.aura_score := 0;
  ELSIF NEW.aura_score IS DISTINCT FROM OLD.aura_score THEN
    NEW.aura_score := OLD.aura_score;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER protect_aura_score_trigger
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_aura_score();

CREATE OR REPLACE FUNCTION public.award_aura_points(_action text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_base integer;
  v_cap integer;
  v_count integer;
  v_streak integer;
  v_points integer;
  v_score integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _action = 'water' THEN v_base := 25; v_cap := 1;
  ELSIF _action = 'task_complete' THEN v_base := 10; v_cap := 100;
  ELSE RAISE EXCEPTION 'Unknown action'; END IF;

  SELECT count(*) INTO v_count FROM aura_award_log
   WHERE user_id = v_uid AND action = _action AND awarded_on = CURRENT_DATE;
  SELECT daily_streak, aura_score INTO v_streak, v_score FROM user_profiles WHERE user_id = v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF v_count >= v_cap THEN RETURN v_score; END IF;

  v_points := CASE WHEN coalesce(v_streak,0) >= 3 THEN round(v_base * 1.2)::int ELSE v_base END;
  INSERT INTO aura_award_log (user_id, action, points) VALUES (v_uid, _action, v_points);
  PERFORM set_config('app.aura_award', 'on', true);
  UPDATE user_profiles SET aura_score = aura_score + v_points
   WHERE user_id = v_uid RETURNING aura_score INTO v_score;
  PERFORM set_config('app.aura_award', 'off', true);
  RETURN v_score;
END; $$;
REVOKE EXECUTE ON FUNCTION public.award_aura_points(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_aura_points(text) TO authenticated;