-- Add watering and streak freeze tracking to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN last_watered_date date DEFAULT NULL,
ADD COLUMN streak_frozen boolean DEFAULT false;