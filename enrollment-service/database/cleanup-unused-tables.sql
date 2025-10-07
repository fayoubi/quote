-- =====================================================
-- Cleanup Unused Tables for V2 JSONB Architecture
-- This removes tables that are not used by enrollment.service.v2.js
-- =====================================================

-- Drop unused tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS enrollment_audit_log CASCADE;
DROP TABLE IF EXISTS enrollment_step_data CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS billing_data CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Verify remaining tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show table structure of remaining tables
\d enrollments
\d customers
