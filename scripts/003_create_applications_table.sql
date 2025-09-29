-- Create applications table for tracking user grant applications
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  grant_id INTEGER REFERENCES grants(id) ON DELETE CASCADE,
  opp_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  project_title VARCHAR(500),
  project_summary TEXT,
  project_narrative TEXT,
  uploaded_files JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_grant_id ON applications(grant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
