-- =====================================================
-- Remove Legacy Columns from Enrollments Table
-- These columns are replaced by the JSONB 'data' column
-- =====================================================

-- Optional: Drop legacy columns that are now stored in JSONB
-- Uncomment if you want to fully migrate to JSONB-only storage

-- Remove foreign key constraint on customer_id (already done but ensuring)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_customer_id_fkey;

-- Drop legacy columns (keeping them for now for backward compatibility)
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS plan_id;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS status;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS effective_date;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS current_step;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS completed_steps;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS session_data;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS metadata;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS submitted_at;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS completed_at;
-- ALTER TABLE enrollments DROP COLUMN IF EXISTS expires_at;

-- For now, we'll keep the legacy columns but they're nullable
-- and the V2 service only uses the 'data' JSONB column

-- Verify the schema
\d enrollments

SELECT 'Legacy columns kept for backward compatibility. V2 service uses only the data JSONB column.' as status;
