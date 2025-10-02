# User Story: Agent Authentication & Dashboard

**Module:** Agent Portal - Authentication & Dashboard  
**Entry Point:** `/` (root) or `/agent/login`  
**Priority:** Critical  
**Complexity:** High  
**Story Name:** `agent-login-dashboard`

---

## Overview

Create a complete agent authentication system with OTP-based registration/login and a dashboard for managing enrollments. This becomes the new entry point for YadmanX.

---

## User Story

**As an** insurance agent  
**I want to** register and login securely to access my dashboard  
**So that** I can manage my client enrollments and start new applications

---

## Acceptance Criteria

### AC1: Agent Registration

- [ ] **AC1.1:** Registration page at `/agent/register` with Auth0-style clean UI
  - Form fields: First Name, Last Name, Email, Phone, Agency Name
  - All fields required with validation
  - Phone format: Morocco (+212) with proper validation
  - Email validation (valid format)
  - Agency dropdown or text input (TBD based on your preference)

- [ ] **AC1.2:** License number auto-generated in background
  - Format: `AG-[YYYY]-[6-digit-random]` (e.g., AG-2025-482917)
  - Unique constraint on license number
  - Not visible to user during registration

- [ ] **AC1.3:** On form submit, create agent record and generate OTP
  - OTP: 6-digit numeric code
  - OTP valid for 10 minutes
  - Display OTP on screen (mock SMS/email for MVP)
  - Show message: "Your verification code is: [123456]. In production, this will be sent to your phone/email."

- [ ] **AC1.4:** OTP verification screen
  - 6-digit input field
  - Resend OTP button (generates new code)
  - On success: create JWT token and redirect to dashboard
  - On failure: show error, allow 3 attempts before requiring new OTP

### AC2: Agent Login

- [ ] **AC2.1:** Login page at `/agent/login` (root redirect to here if not authenticated)
  - Auth0-inspired minimalist design
  - Email or Phone input field
  - "Continue" button

- [ ] **AC2.2:** After email/phone submit, generate and display OTP
  - Same OTP behavior as registration
  - Display OTP on screen with mock message
  - Verify agent exists before generating OTP

- [ ] **AC2.3:** OTP verification
  - Same flow as registration verification
  - On success: create JWT token and redirect to dashboard

- [ ] **AC2.4:** JWT Token implementation
  - Token includes: agent_id, email, license_number, agency_name
  - Token expiration: 24 hours
  - Store in httpOnly cookie or localStorage
  - Middleware to verify token on protected routes

### AC3: Agent Dashboard

- [ ] **AC3.1:** Dashboard at `/agent/dashboard` (protected route)
  - Header: Agent name, agency name, logout button
  - "Start New Application" prominent button (primary CTA)
  - Enrollment list table below

- [ ] **AC3.2:** Enrollment list table
  - Columns: Application ID, Applicant Name, Status, Start Date, Last Updated, Actions
  - Statuses (mocked for now): Draft, Submitted, Underwriting, Approved, Issued, Declined
  - Status badges with color coding:
    - Draft: gray
    - Submitted: blue
    - Underwriting: yellow
    - Approved: green
    - Issued: green (darker)
    - Declined: red
  - Empty state: "No applications yet. Start your first application!"

- [ ] **AC3.3:** Actions per enrollment
  - "View" button for all statuses
  - "Continue" button only for Draft status
  - "View" opens enrollment details (can be simple page showing enrollment data for MVP)

- [ ] **AC3.4:** "Start New Application" button
  - Creates new enrollment record with agent_id
  - Generates enrollment_id (GUID)
  - Sets status to "Draft"
  - Redirects to existing `/enroll/personal-info` flow
  - Enrollment flow captures agent context throughout

### AC4: Database Changes

- [ ] **AC4.1:** Create `agents` table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  agency_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

- [ ] **AC4.2:** Create `agent_otps` table
```sql
CREATE TABLE agent_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  otp_code VARCHAR(6) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **AC4.3:** Update `enrollments` table
```sql
ALTER TABLE enrollments 
ADD COLUMN agent_id UUID REFERENCES agents(id),
ADD COLUMN status VARCHAR(50) DEFAULT 'Draft';

CREATE INDEX idx_enrollments_agent_id ON enrollments(agent_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

### AC5: Backend Services

- [ ] **AC5.1:** Agent Service microservice
  - Endpoints:
    - `POST /api/v1/agents/register` - Register new agent
    - `POST /api/v1/agents/verify-otp` - Verify OTP
    - `POST /api/v1/agents/login` - Initiate login
    - `POST /api/v1/agents/resend-otp` - Resend OTP
    - `GET /api/v1/agents/me` - Get current agent info
    - `GET /api/v1/agents/enrollments` - Get agent's enrollments

- [ ] **AC5.2:** OTP generation and validation logic
  - Generate 6-digit random code
  - Hash OTP before storing
  - Validate expiration (10 minutes)
  - Rate limiting: Max 5 OTP requests per hour per email/phone
  - Track attempts, lock after 3 failed attempts

- [ ] **AC5.3:** JWT middleware
  - Verify token on protected routes
  - Refresh token mechanism
  - Handle expired tokens gracefully

### AC6: UI/UX Updates

- [ ] **AC6.1:** Auth0-style authentication screens
  - Clean, centered card layout
  - Minimal branding
  - White background with subtle shadow
  - Blue primary buttons
  - Clear error messaging
  - Responsive design

- [ ] **AC6.2:** Navigation updates
  - Remove public "Get Quote, About, Contact" from agent portal
  - Agent portal has separate nav: Dashboard, Profile (future), Logout
  - Public site (if needed) stays separate

- [ ] **AC6.3:** Protected route handling
  - Redirect unauthenticated users to `/agent/login`
  - Show loading state while verifying token
  - Handle token expiration with redirect to login

### AC7: Integration with Existing Enrollment Flow

- [ ] **AC7.1:** Update enrollment flow to capture agent_id
  - All enrollment pages check for agent context
  - Store agent_id in enrollment record on creation
  - Pass agent_id through all enrollment steps

- [ ] **AC7.2:** Return to dashboard after enrollment completion
  - Success message on enrollment completion
  - "Return to Dashboard" button
  - Update enrollment status to "Submitted"

---

## Technical Specifications

### Frontend Components

```
/src/components/agent/
├── auth/
│   ├── RegisterForm.jsx
│   ├── LoginForm.jsx
│   ├── OTPVerification.jsx
│   └── AuthLayout.jsx
├── dashboard/
│   ├── Dashboard.jsx
│   ├── EnrollmentTable.jsx
│   ├── EnrollmentRow.jsx
│   ├── StatusBadge.jsx
│   └── EmptyState.jsx
└── common/
    ├── ProtectedRoute.jsx
    └── AgentHeader.jsx
```

### Backend Services

```
/services/agent-service/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── agentController.js
│   │   └── otpController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimitMiddleware.js
│   ├── models/
│   │   ├── Agent.js
│   │   └── AgentOTP.js
│   ├── services/
│   │   ├── otpService.js
│   │   ├── jwtService.js
│   │   └── agentService.js
│   └── routes/
│       └── agentRoutes.js
└── Dockerfile
```

### API Endpoints

**Agent Registration**
```
POST /api/v1/agents/register
Body: {
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  agencyName: string
}
Response: {
  agentId: uuid,
  otp: string (for MVP display),
  expiresAt: timestamp
}
```

**Verify OTP**
```
POST /api/v1/agents/verify-otp
Body: {
  agentId: uuid,
  otpCode: string
}
Response: {
  token: string,
  agent: {
    id: uuid,
    firstName: string,
    lastName: string,
    email: string,
    licenseNumber: string,
    agencyName: string
  }
}
```

**Agent Login**
```
POST /api/v1/agents/login
Body: {
  emailOrPhone: string
}
Response: {
  agentId: uuid,
  otp: string (for MVP display),
  expiresAt: timestamp
}
```

**Get Agent Enrollments**
```
GET /api/v1/agents/enrollments
Headers: Authorization: Bearer {token}
Response: {
  enrollments: [
    {
      id: uuid,
      applicantName: string,
      status: string,
      startDate: timestamp,
      lastUpdated: timestamp
    }
  ]
}
```

---

## Design Notes

### Auth0-Style UI Reference

- **Layout:** Centered card (max-width: 450px) on light background
- **Typography:** Clean sans-serif (Inter, SF Pro, or system fonts)
- **Colors:** 
  - Primary: #0066FF (blue)
  - Success: #10B981 (green)
  - Error: #EF4444 (red)
  - Text: #1F2937 (dark gray)
  - Border: #E5E7EB (light gray)
- **Spacing:** Generous padding (24px), clear visual hierarchy
- **Buttons:** Full-width primary buttons, 44px height
- **Inputs:** Clear labels, 44px height, focus states with blue border

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| First Name | Required, min 2 chars | "First name is required" |
| Last Name | Required, min 2 chars | "Last name is required" |
| Email | Required, valid email format | "Valid email is required" |
| Phone | Required, Morocco format (+212...) | "Valid phone number is required" |
| Agency Name | Required, min 2 chars | "Agency name is required" |
| OTP | Required, exactly 6 digits | "Enter 6-digit code" |

---

## Testing Checklist

### Registration Flow
- [ ] Register new agent with valid data
- [ ] Validate all form fields (required, format)
- [ ] OTP displayed on screen correctly
- [ ] Verify OTP with correct code (success)
- [ ] Verify OTP with incorrect code (3 attempts)
- [ ] OTP expiration after 10 minutes
- [ ] Resend OTP generates new code
- [ ] License number auto-generated and unique
- [ ] JWT token created on successful verification
- [ ] Redirect to dashboard after verification

### Login Flow
- [ ] Login with registered email
- [ ] Login with registered phone
- [ ] Login with non-existent account (error)
- [ ] OTP flow same as registration
- [ ] Token refresh on expired token
- [ ] Logout clears token

### Dashboard
- [ ] Dashboard shows agent info in header
- [ ] Empty state when no enrollments
- [ ] Enrollment list displays all agent's applications
- [ ] Status badges display correct colors
- [ ] "Start New Application" creates enrollment with agent_id
- [ ] "View" button works for all statuses
- [ ] "Continue" button only on Draft status
- [ ] Protected route redirects if not authenticated

### Integration
- [ ] New enrollment links to agent_id
- [ ] Enrollment flow maintains agent context
- [ ] Return to dashboard after enrollment completion
- [ ] Status updates reflect in dashboard

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Frontend components created with Auth0-style UI
- [ ] Agent service microservice deployed in Docker
- [ ] Database tables created with proper indexes
- [ ] JWT authentication implemented
- [ ] OTP generation and validation working
- [ ] Dashboard displays enrollments correctly
- [ ] Integration with existing enrollment flow complete
- [ ] All API endpoints documented (OpenAPI/Swagger)
- [ ] Unit tests written for backend services
- [ ] Integration tests for auth flow
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Error handling for all edge cases
- [ ] Rate limiting implemented
- [ ] Code reviewed and merged
- [ ] Deployment verified in staging

---

## Future Enhancements (Out of Scope)

- Actual SMS/Email OTP delivery
- Password-based authentication option
- Agent profile management
- Admin portal for agent management
- Agent performance analytics
- Multi-factor authentication
- Agent roles and permissions
- Forgot password flow
- Agency hierarchy management

---

## Dependencies

- Existing enrollment flow at `/enroll/*`
- PostgreSQL database
- Docker for microservices
- React frontend
- JWT library (jsonwebtoken)
- Bcrypt for OTP hashing

---

## Notes for claude-code

1. **UI Inspiration:** Reference Auth0's login screen for clean, minimal design
2. **OTP Display:** For MVP, show OTP directly on screen with clear messaging that it will be sent via SMS/email in production
3. **License Number:** Generate in format `AG-[YEAR]-[RANDOM_6_DIGITS]`
4. **Status Colors:** Use standard conventions (gray/blue/yellow/green/red)
5. **Token Storage:** Use httpOnly cookies for better security
6. **API Documentation:** Generate OpenAPI spec for all new endpoints
7. **Error Handling:** Provide clear, user-friendly error messages
8. **Loading States:** Show spinners/skeletons during async operations