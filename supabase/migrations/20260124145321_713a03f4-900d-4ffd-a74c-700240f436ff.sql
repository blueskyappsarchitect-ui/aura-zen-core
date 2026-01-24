-- Add INSERT policy for user_watering_log table
-- This allows users to create their own watering log entries
-- Note: This table is primarily managed by the increment_global_oxygen RPC function,
-- but having the policy ensures consistency and allows direct inserts if needed

CREATE POLICY "Users can insert their own watering log"
ON public.user_watering_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);