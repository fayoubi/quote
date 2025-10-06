-- =====================================================
-- Yadmanx Enrollment Simplification - Database Schema V2
-- Option B: JSONB-based, No Status, No Step Data
-- =====================================================
-- This script creates the simplified schema for enrollments and customers
-- Execute this in your PostgreSQL enrollment database

-- Drop existing tables if they exist (clean slate for migration)
DROP TABLE IF EXISTS enrollment_step_data CASCADE;
DROP TABLE IF EXISTS enrollment_audit_log CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS billing_data CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- =====================================================
-- 1. AGENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  agency_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_agents_phone ON agents(phone);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_deleted_at ON agents(deleted_at);

-- Insert test agent for +212063737347
INSERT INTO agents (first_name, last_name, email, phone, license_number, agency_name)
VALUES (
  'Test',
  'Agent',
  'test.agent@yadmanx.com',
  '+212063737347',
  'AG-2025-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  'Yadmanx Test Agency'
) ON CONFLICT (phone) DO NOTHING;

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  cin VARCHAR(50),

  -- Contact Info
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),

  -- Additional data stored as JSONB for flexibility
  data JSONB DEFAULT '{}'::jsonb,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_email ON customers(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_phone ON customers(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_cin ON customers(cin) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);

-- =====================================================
-- 3. ENROLLMENTS TABLE (NO STATUS FIELD)
-- =====================================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  agent_id UUID REFERENCES agents(id) NOT NULL,
  customer_id UUID REFERENCES customers(id),

  -- All enrollment data stored as JSONB
  -- Structure:
  -- {
  --   "personalInfo": {
  --     "subscriber": {
  --       "firstName": "...",
  --       "lastName": "...",
  --       "cin": "...",
  --       "dateOfBirth": "...",
  --       "placeOfBirth": "...",
  --       "address": "...",
  --       "city": "...",
  --       "phone": "...",
  --       "email": "..."
  --     },
  --     "insured": { ... } // if different from subscriber
  --   },
  --   "contribution": {
  --     "amount": 100,
  --     "amountText": "Cent Dirhams",
  --     "originOfFunds": {
  --       "savings": false,
  --       "propertySale": false,
  --       "securitiesSale": false,
  --       "inheritance": true,
  --       "other": ""
  --     },
  --     "paymentMode": {
  --       "type": "bank_transfer", // or "check"
  --       "bank": "CIH",
  --       "agency": "Test",
  --       "rib": "013 780 1000000000088747 34",
  --       "checkNumber": ""
  --     }
  --   },
  --   "beneficiaries": [
  --     {
  --       "lastName": "...",
  --       "firstName": "...",
  --       "cin": "...",
  --       "dateOfBirth": "...",
  --       "placeOfBirth": "...",
  --       "address": "...",
  --       "percentage": 50
  --     }
  --   ]
  -- }
  data JSONB DEFAULT '{}'::jsonb NOT NULL,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_enrollments_agent_id ON enrollments(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_enrollments_customer_id ON enrollments(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_enrollments_deleted_at ON enrollments(deleted_at);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at);

-- JSONB indexes for faster queries
CREATE INDEX idx_enrollments_data_gin ON enrollments USING gin(data);

-- =====================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to agents table
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to customers table
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to enrollments table
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get customer display name from enrollment
CREATE OR REPLACE FUNCTION get_enrollment_customer_name(enrollment_data JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    enrollment_data->'personalInfo'->'subscriber'->>'firstName',
    ''
  ) || ' ' || COALESCE(
    enrollment_data->'personalInfo'->'subscriber'->>'lastName',
    ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Verify schema is created correctly
SELECT
  'agents' as table_name,
  COUNT(*) as record_count
FROM agents
UNION ALL
SELECT
  'customers' as table_name,
  COUNT(*) as record_count
FROM customers
UNION ALL
SELECT
  'enrollments' as table_name,
  COUNT(*) as record_count
FROM enrollments;

-- Show test agent
SELECT
  id,
  first_name,
  last_name,
  phone,
  license_number,
  agency_name
FROM agents
WHERE phone = '+212063737347';

COMMENT ON TABLE customers IS 'Stores customer information - can be subscriber, insured, or both';
COMMENT ON TABLE enrollments IS 'Stores all enrollment data in JSONB format - no status tracking, data always editable';
COMMENT ON COLUMN enrollments.data IS 'JSONB structure containing personalInfo, contribution, and beneficiaries';

-- Schema creation complete!
SELECT 'Database schema migration V2 completed successfully! (No status, No step_data)' as status;
