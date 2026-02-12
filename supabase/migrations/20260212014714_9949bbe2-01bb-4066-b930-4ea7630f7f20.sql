
-- Add new profile fields for enhanced signup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS graduation_year text;
