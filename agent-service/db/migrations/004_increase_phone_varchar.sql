-- Migration 004: Increase phone_number column sizes
-- This migration increases phone_number columns in otp_codes and otp_lockouts tables
-- to handle longer phone number formats

-- Increase phone_number in otp_codes table
ALTER TABLE otp_codes
ALTER COLUMN phone_number TYPE VARCHAR(50);

-- Increase phone_number in otp_lockouts table
ALTER TABLE otp_lockouts
ALTER COLUMN phone_number TYPE VARCHAR(50);

-- Increase delivery_method in otp_codes table (in case we need longer delivery method names)
ALTER TABLE otp_codes
ALTER COLUMN delivery_method TYPE VARCHAR(20);
