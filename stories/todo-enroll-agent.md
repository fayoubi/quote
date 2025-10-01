Story 2: Update Enrollment Service - Agent Authentication Integration
Priority: HIGH - Prerequisite for Portal
Estimated Complexity: Medium
Goal
Update enrollment-service to validate agents via agent-service and remove stubbed authentication.
Scope
Changes to enrollment-service/:

Remove stubbed auth middleware
Create new middleware that calls agent-service to validate JWT
Update all endpoints to require valid agent authentication
Migrate agents table data to agent-service database
Remove agents table from enrollment database
Update foreign keys to use agent_id (still UUID, but validated externally)
Update seed data to reference agents from agent-service

New Middleware:
javascript// middleware/auth.middleware.js
const authenticateAgent = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Call agent-service to validate
  const response = await fetch('http://agent-service:3003/api/v1/auth/validate', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!response.ok) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { agent } = await response.json();
  req.agentId = agent.id;
  req.agent = agent;
  next();
};
Database Migration:

Drop agents table from enrollment database
Update seed data to use agent IDs from agent-service

Testing:

Update integration tests to use real JWT tokens
Test unauthorized access returns 401
Test valid token allows access

Docker:

Update docker-compose.yml to ensure agent-service starts before enrollment-service
Add depends_on: agent-service

Acceptance Criteria:
✅ Enrollment endpoints require valid JWT
✅ Stubbed auth removed
✅ Agent validation calls agent-service
✅ Agents table migrated successfully
✅ All enrollment tests passing with auth
✅ Docker services start in correct order
