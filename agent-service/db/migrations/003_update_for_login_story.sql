-- Migration: Update agent schema for agent login story requirements
-- This migration adds agency_name, is_active, last_login_at, deleted_at to agents table
-- Changes license_number from VARCHAR(6) to VARCHAR(20)
-- Creates agent_otps table for OTP verification tracking

-- Update agents table with new columns
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Change license_number from VARCHAR(6) to VARCHAR(20) to support AG-YYYY-XXXXXX format
ALTER TABLE agents
ALTER COLUMN license_number TYPE VARCHAR(20);

-- Create agent_otps table for OTP verification tracking
CREATE TABLE IF NOT EXISTS agent_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for agent_otps table
CREATE INDEX IF NOT EXISTS idx_agent_otps_agent_id ON agent_otps(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_otps_expires_at ON agent_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_agent_otps_verified_at ON agent_otps(verified_at);
CREATE INDEX IF NOT EXISTS idx_agent_otps_email ON agent_otps(email);
CREATE INDEX IF NOT EXISTS idx_agent_otps_phone ON agent_otps(phone);

-- Create index for deleted_at for soft delete queries
CREATE INDEX IF NOT EXISTS idx_agents_deleted_at ON agents(deleted_at);

-- Create index for is_active for active agent queries
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

-- Create index for last_login_at for login tracking
CREATE INDEX IF NOT EXISTS idx_agents_last_login_at ON agents(last_login_at);

-- Migrate existing agents to have is_active = true and populate agency_name if null
UPDATE agents
SET is_active = true
WHERE is_active IS NULL;

-- Note: existing otp_codes table is kept for backward compatibility
