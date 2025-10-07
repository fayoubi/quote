-- =====================================================
-- Migrate Existing Schema to V2 JSONB Format
-- This adds the JSONB column while preserving existing data
-- =====================================================

-- Step 1: Add the data JSONB column if it doesn't exist
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb NOT NULL;

-- Step 2: Add deleted_at column for soft deletes if it doesn't exist
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE;

-- Step 3: Create GIN index on JSONB data for fast queries
CREATE INDEX IF NOT EXISTS idx_enrollments_data_gin ON enrollments USING gin(data);
CREATE INDEX IF NOT EXISTS idx_enrollments_deleted_at ON enrollments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_data_gin ON customers USING gin(data);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);

-- Step 4: Migrate existing enrollment data to JSONB format
-- This preserves all existing data by moving it into the data column
UPDATE enrollments
SET data = jsonb_build_object(
  'status', COALESCE(status, 'draft'),
  'plan_id', plan_id::text,
  'effective_date', effective_date::text,
  'current_step', current_step,
  'completed_steps', COALESCE(completed_steps, '[]'::jsonb),
  'session_data', COALESCE(session_data, '{}'::jsonb),
  'metadata', COALESCE(metadata, '{}'::jsonb),
  'submitted_at', submitted_at::text,
  'completed_at', completed_at::text,
  'expires_at', expires_at::text
)
WHERE data = '{}'::jsonb OR data IS NULL;

-- Step 5: Make old columns nullable (for backward compatibility)
ALTER TABLE enrollments
  ALTER COLUMN plan_id DROP NOT NULL,
  ALTER COLUMN customer_id DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;

-- Step 5b: Remove foreign key constraints for flexibility
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_agent_id_fkey;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_customer_id_fkey;

-- Step 6: Update triggers for updated_at if they don't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verification
SELECT
  'Migration completed!' as status,
  COUNT(*) as total_enrollments,
  COUNT(*) FILTER (WHERE data != '{}'::jsonb) as migrated_enrollments
FROM enrollments;

COMMENT ON COLUMN enrollments.data IS 'JSONB structure containing all enrollment data - personalInfo, contribution, beneficiaries, etc.';
