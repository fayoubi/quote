# Agent Service Tests

## Running Integration Tests

The agent-service includes comprehensive integration tests for all authentication and enrollment endpoints.

### Prerequisites

1. **Agent Service Database Running**:
   ```bash
   cd /Users/fahdayoubi/dev/yadmanx/agent-service
   docker-compose up -d agent-db
   ```

2. **Enrollment Service Running** (for enrollment-related tests):
   ```bash
   cd /Users/fahdayoubi/dev/yadmanx/enrollment-service
   docker-compose up -d
   ```

3. **Environment Variables**:
   The tests use the following default configuration:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5435/agent
   JWT_SECRET=test-jwt-secret-key
   ENROLLMENT_SERVICE_URL=http://localhost:3002
   PORT=3003
   ```

### Running Tests

#### Option 1: Manual Test Runner (Recommended)
```bash
cd /Users/fahdayoubi/dev/yadmanx/agent-service
node src/__tests__/run-tests.js
```

This runner works seamlessly with ES modules and provides clear output.

#### Option 2: Jest (ES Module Mode)
```bash
cd /Users/fahdayoubi/dev/yadmanx/agent-service
npm test
```

**Note**: Jest with ES modules is experimental and may have issues. Use the manual runner for reliable results.

### Test Coverage

The test suite includes:

**Authentication Flow**:
- ✓ Agent registration with license auto-generation
- ✓ Duplicate phone number validation
- ✓ OTP generation and verification
- ✓ JWT token creation
- ✓ Login with existing agent
- ✓ Invalid OTP handling

**Profile Management**:
- ✓ Get agent profile (authenticated)
- ✓ Update agent profile
- ✓ Authentication required checks

**Enrollment Integration**:
- ✓ Get agent's enrollments
- ✓ Filter enrollments by agent_id
- ✓ Authentication required checks
- ✓ Integration with enrollment-service

**Health Checks**:
- ✓ Service health endpoint

### Test Output Example

```
🧪 Running Agent Service Integration Tests

==================================================

Authentication Flow
  ✓ should register a new agent
  ✓ should fail to register with duplicate phone
  ✓ should verify OTP and return token
  ✓ should fail to verify with wrong OTP
  ✓ should request OTP for existing agent

Agent Profile Management
  ✓ should get agent profile
  ✓ should fail without token
  ✓ should update agent profile

Agent Enrollments
  ✓ should get enrollments for agent
  ✓ should fail without auth

Health Check
  ✓ should return healthy status

==================================================

📊 Test Results:
  ✓ Passed: 11
  ✗ Failed: 0
  Total: 11

==================================================
```

### Troubleshooting

**Database Connection Issues**:
```bash
# Check if database is running
docker ps | grep agent-db

# View database logs
docker logs agent-service-agent-db-1

# Restart database
docker-compose restart agent-db
```

**Port Conflicts**:
```bash
# Check what's using port 5435
lsof -i :5435

# Kill process if needed
kill -9 <PID>
```

**Clean Database Before Tests**:
```bash
# Reset database
docker-compose down -v
docker-compose up -d agent-db

# Run migrations
npm run db:migrate
```

### Continuous Integration

For CI/CD pipelines, ensure:
1. Database service is started before tests
2. Enrollment service is mocked or running
3. Environment variables are properly configured
4. Tests run in isolated containers

Example CI config:
```yaml
services:
  agent-db:
    image: postgres:15
    environment:
      POSTGRES_DB: agent
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"

test:
  script:
    - npm run db:migrate
    - node src/__tests__/run-tests.js
```

### Writing New Tests

To add new tests, edit `src/__tests__/run-tests.js`:

```javascript
await test('should do something', async () => {
  const response = await request(app)
    .get('/api/v1/some-endpoint')
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

### Test Data Cleanup

Tests automatically clean up after themselves by:
1. Deleting test agents from database
2. Removing OTP records
3. Clearing sessions
4. Closing database connections

If tests are interrupted, manual cleanup may be needed:
```sql
-- Connect to database
psql postgresql://postgres:postgres@localhost:5435/agent

-- Clean test data (be careful!)
DELETE FROM agent_otps WHERE phone LIKE '%999%';
DELETE FROM sessions WHERE agent_id IN (SELECT id FROM agents WHERE phone_number LIKE '%999%');
DELETE FROM agents WHERE phone_number LIKE '%999%';
```
