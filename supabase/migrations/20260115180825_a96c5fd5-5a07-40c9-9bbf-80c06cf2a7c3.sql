-- Add has_completed_onboarding column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;