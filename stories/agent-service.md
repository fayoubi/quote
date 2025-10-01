Story 1: Agent Service - Core Authentication & Agent Management
Priority: CRITICAL - Foundation
Estimated Complexity: LargeGoal
Create agent-service (port 3003) with agent registration, phone/email OTP authentication, JWT session management, and agent profile management.Scope
Backend (agent-service/):

New Express service on port 3003
PostgreSQL database agent_db
Agent registration (phone number with Morocco/France country codes)
OTP generation and validation (mocked SMS, displayed on screen)
Email OTP as backup (mocked)
JWT token generation and validation
Session management (24-hour tokens)
Rate limiting (5 OTP attempts, then lockout)
Middleware for JWT validation (to be used by other services)
Database Tables:
sql-- agents
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) NOT NULL, -- +212, +33
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  license_number VARCHAR(6) UNIQUE NOT NULL, -- Random 6 digits
  agency_id UUID, -- Future use
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- otp_codes
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  delivery_method VARCHAR(10), -- 'sms' or 'email'
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP
);

-- sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  last_activity_at TIMESTAMP
);

-- otp_lockouts
CREATE TABLE otp_lockouts (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  locked_until TIMESTAMP NOT NULL,
  attempt_count INTEGER,
  created_at TIMESTAMP
);API Endpoints:

POST /api/v1/auth/register - Register new agent with phone
POST /api/v1/auth/request-otp - Request OTP (SMS or email)
POST /api/v1/auth/verify-otp - Verify OTP and return JWT
POST /api/v1/auth/refresh - Refresh JWT token
POST /api/v1/auth/logout - Invalidate session
POST /api/v1/auth/validate - Validate JWT (for other services)
GET /api/v1/agents/me - Get current agent profile
PATCH /api/v1/agents/me - Update agent profile
Testing:

Unit tests for OTP generation/validation
Unit tests for JWT token management
Integration tests for all auth endpoints
Test lockout mechanism
Test token expiration
Docker:

Dockerfile for agent-service
Add to root docker-compose.yml
Agent database service (port 5434)
Documentation:

API docs at http://localhost:3003/api/docs/
Follow pricing-service format
Seed Data:

3-5 sample agents with valid credentials
Include Moroccan and French phone numbers
Acceptance Criteria:
✅ Agent can register with phone number (Morocco/France only)
✅ OTP sent via SMS (mocked, displayed on screen)
✅ Email OTP as backup option
✅ OTP expires after 5 minutes
✅ Lockout after 5 failed attempts
✅ JWT token issued on successful verification
✅ Token valid for 24 hours
✅ Other services can validate JWT via /auth/validate
✅ All tests passing
✅ API documented
