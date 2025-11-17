-- Add last_active column to profiles for tracking user activity
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS last_active timestamptz;

-- Optional: index for efficient recent-activity queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles (last_active DESC);
