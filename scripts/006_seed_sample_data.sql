-- Insert sample user for testing
INSERT INTO users (email, password_hash, first_name, last_name, organization, organization_type, focus_areas)
VALUES (
  'test@example.com',
  '$2a$10$example_hash_here', -- This would be a real bcrypt hash
  'Test',
  'User',
  'Test Organization',
  'nonprofit',
  ARRAY['education', 'technology', 'community development']
) ON CONFLICT (email) DO NOTHING;

-- Insert sample grants
INSERT INTO grants (opp_number, title, agency, description, eligibility, funding_amount, deadline, categories)
VALUES 
  (
    'ED-GRANTS-2024-001',
    'Education Innovation Grant',
    'Department of Education',
    'Funding for innovative educational technology programs that improve student outcomes.',
    'Public and private educational institutions, nonprofits',
    '$50,000 - $500,000',
    '2024-12-31',
    ARRAY['education', 'technology', 'innovation']
  ),
  (
    'NSF-STEM-2024-002',
    'STEM Community Outreach Program',
    'National Science Foundation',
    'Support for community-based STEM education and outreach initiatives.',
    'Nonprofits, educational institutions, community organizations',
    '$25,000 - $250,000',
    '2024-11-15',
    ARRAY['stem', 'education', 'community', 'outreach']
  ),
  (
    'EPA-ENV-2024-003',
    'Environmental Justice Initiative',
    'Environmental Protection Agency',
    'Grants to address environmental justice issues in underserved communities.',
    'Nonprofits, community organizations, tribal governments',
    '$100,000 - $1,000,000',
    '2024-10-30',
    ARRAY['environment', 'justice', 'community', 'health']
  )
ON CONFLICT (opp_number) DO NOTHING;
