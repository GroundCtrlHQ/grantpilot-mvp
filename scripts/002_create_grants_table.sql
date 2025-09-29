-- Create grants table for storing grant opportunities
CREATE TABLE IF NOT EXISTS grants (
  id SERIAL PRIMARY KEY,
  opp_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  agency VARCHAR(255),
  description TEXT,
  eligibility TEXT,
  funding_amount VARCHAR(100),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'open',
  categories TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_grants_opp_number ON grants(opp_number);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline);
CREATE INDEX IF NOT EXISTS idx_grants_categories ON grants USING GIN(categories);
