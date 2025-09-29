-- Create checklists table for AI-generated document requirements
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  requirements JSONB NOT NULL, -- Array of requirement objects with text, completed status, etc.
  ai_analysis JSONB, -- Store AI analysis results and metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster application lookups
CREATE INDEX IF NOT EXISTS idx_checklists_application_id ON checklists(application_id);
