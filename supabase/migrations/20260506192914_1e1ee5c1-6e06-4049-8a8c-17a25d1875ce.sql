
-- Allow users to delete their own game sessions (privacy / right to deletion)
CREATE POLICY "Users can delete their own sessions"
  ON public.game_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to delete their own feedback
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Restrict profile visibility: prevent anonymous scraping of usernames/emails.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_public_profile = true OR auth.uid() = user_id);
