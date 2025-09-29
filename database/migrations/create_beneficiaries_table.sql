-- Migration: Create beneficiaries table for life insurance enrollment
-- This table manages beneficiaries during enrollment and post-policy issuance

-- Create enrollments table if it doesn't exist (referenced by beneficiaries)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id VARCHAR(50) UNIQUE,
  applicant_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create policies table if it doesn't exist (referenced by beneficiaries)
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE RESTRICT,
  policy_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create beneficiaries table
CREATE TABLE beneficiaries (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,

  -- Beneficiary Information
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  cin VARCHAR(50) NULL, -- Optional: National ID
  date_of_birth DATE NOT NULL,
  place_of_birth VARCHAR(100) NOT NULL, -- City of birth
  address TEXT NOT NULL, -- Current address

  -- Percentage Allocation
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),

  -- Ordering
  order_index INTEGER DEFAULT 0, -- For maintaining beneficiary order

  -- Audit Fields (consistent across all tables)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NULL, -- Soft delete

  -- Constraints
  CONSTRAINT chk_enrollment_or_policy CHECK (
    (enrollment_id IS NOT NULL AND policy_id IS NULL) OR
    (enrollment_id IS NULL AND policy_id IS NOT NULL) OR
    (enrollment_id IS NOT NULL AND policy_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_beneficiaries_enrollment_id ON beneficiaries(enrollment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_beneficiaries_policy_id ON beneficiaries(policy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_beneficiaries_deleted_at ON beneficiaries(deleted_at);
CREATE INDEX idx_beneficiaries_created_at ON beneficiaries(created_at);
CREATE INDEX idx_beneficiaries_order_index ON beneficiaries(order_index);

-- Indexes for parent tables
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON enrollments(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_policies_enrollment_id ON policies(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);

-- Create or update the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will be used for development and testing purposes

-- Sample enrollment
INSERT INTO enrollments (id, quote_id, applicant_data, status)
VALUES (
  'e1234567-89ab-cdef-0123-456789abcdef',
  'QUOTE_123',
  '{"name": "John Doe", "age": 35, "coverage": 500000}',
  'in_progress'
) ON CONFLICT (id) DO NOTHING;

-- Sample beneficiaries for the enrollment (totaling 100%)
INSERT INTO beneficiaries (
  enrollment_id,
  last_name,
  first_name,
  cin,
  date_of_birth,
  place_of_birth,
  address,
  percentage,
  order_index
) VALUES
(
  'e1234567-89ab-cdef-0123-456789abcdef',
  'Doe',
  'Jane',
  'AB123456',
  '1990-05-15',
  'Casablanca',
  '123 Rue Mohammed V, Casablanca',
  60.00,
  1
),
(
  'e1234567-89ab-cdef-0123-456789abcdef',
  'Doe',
  'Michael',
  NULL, -- CIN is optional
  '2010-03-20',
  'Rabat',
  '456 Avenue Hassan II, Rabat',
  40.00,
  2
) ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE beneficiaries IS 'Stores beneficiary information for life insurance policies during enrollment and post-issuance';
COMMENT ON COLUMN beneficiaries.enrollment_id IS 'Reference to enrollment during application process';
COMMENT ON COLUMN beneficiaries.policy_id IS 'Reference to issued policy (populated after policy creation)';
COMMENT ON COLUMN beneficiaries.cin IS 'Carte d''Identité Nationale - optional during enrollment';
COMMENT ON COLUMN beneficiaries.percentage IS 'Benefit percentage allocation (must total 100% per enrollment/policy)';
COMMENT ON COLUMN beneficiaries.deleted_at IS 'Soft delete timestamp - NEVER physically delete beneficiaries';
COMMENT ON COLUMN beneficiaries.order_index IS 'Display order for beneficiaries (1-based)';