-- Create saved_grants table for user's interested grants
CREATE TABLE IF NOT EXISTS saved_grants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  grant_id INTEGER REFERENCES grants(id) ON DELETE CASCADE,
  opp_number VARCHAR(100) NOT NULL,
  interest_level VARCHAR(50) DEFAULT 'interested', -- interested, applying, not_interested
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, grant_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_grants_user_id ON saved_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_grants_interest ON saved_grants(interest_level);
