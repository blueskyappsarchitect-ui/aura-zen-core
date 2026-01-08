-- Add vine species and glimmer columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS vine_species text NOT NULL DEFAULT 'ivy',
ADD COLUMN IF NOT EXISTS glimmer_until timestamp with time zone DEFAULT NULL;