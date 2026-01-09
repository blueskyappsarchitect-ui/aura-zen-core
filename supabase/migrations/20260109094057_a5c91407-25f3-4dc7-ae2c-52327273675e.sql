-- Create grove_activities table for public activity feed
CREATE TABLE public.grove_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous Gardener',
  activity_type TEXT NOT NULL, -- 'level_up', 'watered', 'species_change', 'badge_unlocked'
  activity_data JSONB DEFAULT '{}'::jsonb,
  vine_species TEXT DEFAULT 'ivy',
  is_withered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sunshine_nudges table to track nudges between users
CREATE TABLE public.sunshine_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global_oxygen table to track daily community watering
CREATE TABLE public.global_oxygen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  water_count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL DEFAULT 100,
  bonus_active_until TIMESTAMP WITH TIME ZONE
);

-- Add sunshine_nudges_sent counter to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN sunshine_nudges_sent INTEGER NOT NULL DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.grove_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sunshine_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_oxygen ENABLE ROW LEVEL SECURITY;

-- Grove activities: Users can view all, but only create their own
CREATE POLICY "Anyone can view grove activities"
ON public.grove_activities
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own activities"
ON public.grove_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Sunshine nudges: Users can view and create their own sent nudges
CREATE POLICY "Users can view their sent nudges"
ON public.sunshine_nudges
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send sunshine nudges"
ON public.sunshine_nudges
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Global oxygen: Everyone can view, authenticated users can update
CREATE POLICY "Anyone can view global oxygen"
ON public.global_oxygen
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert global oxygen"
ON public.global_oxygen
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update global oxygen"
ON public.global_oxygen
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Enable realtime for grove_activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.grove_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_oxygen;