# Agent Service

The Agent Service handles agent authentication and management for yadmanx, including OTP-based authentication, JWT session management, agent registration, and profile management.

## Features

- ✅ Agent registration with phone number validation
- ✅ OTP authentication (SMS and email delivery)
- ✅ JWT token generation and validation
- ✅ 24-hour session management
- ✅ Rate limiting and lockout mechanism
- ✅ Agent profile management
- ✅ PostgreSQL database with raw SQL
- ✅ RESTful API with 8 endpoints
- ✅ Comprehensive test coverage
- ✅ Docker support

## Technology Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **Authentication:** JWT, bcrypt
- **Testing:** Jest + Supertest
- **Security:** Helmet, CORS, rate limiting

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
NODE_ENV=development
PORT=3003
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/agent
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=24h
OTP_EXPIRES_IN=5
MAX_OTP_ATTEMPTS=5
LOCKOUT_DURATION=30
LOG_LEVEL=debug
```

### 3. Setup Database

Create the database:

```bash
createdb agent
```

Run migrations:

```bash
psql -d agent -f db/migrations/001_initial_schema.sql
```

Seed sample data:

```bash
psql -d agent -f db/seeds/001_sample_data.sql
```

### 4. Start the Service

```bash
npm run dev
```

The service will be available at `http://localhost:3003`

## Running with Docker

### Start all services:

```bash
docker-compose up
```

This will start:
- Agent service on port 3003
- PostgreSQL database on port 5434

### Stop services:

```bash
docker-compose down
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## API Documentation

Once the service is running, access the API documentation at:

**http://localhost:3003/api/docs/**

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new agent with phone number
- `POST /api/v1/auth/request-otp` - Request OTP (SMS or email)
- `POST /api/v1/auth/verify-otp` - Verify OTP and return JWT token
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Invalidate session
- `POST /api/v1/auth/validate` - Validate JWT token (for other services)

### Agent Profile
- `GET /api/v1/agents/me` - Get current agent profile
- `PATCH /api/v1/agents/me` - Update agent profile

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Service port | 3003 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | 24h |
| `OTP_EXPIRES_IN` | OTP expiration time (minutes) | 5 |
| `MAX_OTP_ATTEMPTS` | Maximum OTP verification attempts | 5 |
| `LOCKOUT_DURATION` | Lockout duration (minutes) | 30 |
| `LOG_LEVEL` | Logging level | debug |
| `CORS_ORIGIN` | CORS allowed origins | * |

## Database Schema

The service uses the following tables:

- **agents** - Agent registration and profile information
- **otp_codes** - OTP codes for authentication
- **sessions** - Active JWT sessions
- **otp_lockouts** - Rate limiting and lockout tracking

## Known Limitations

### Mocked OTP Delivery
Currently, OTP codes are displayed on screen instead of being sent via SMS or email. This is for development and testing purposes only.

```javascript
// Current implementation (DO NOT use in production)
console.log(`[MOCKED SMS] OTP Code: ${otpCode} sent to ${phoneNumber}`);
```

**TODO:** Integrate with SMS provider (e.g., Twilio, AWS SNS) and email service (e.g., SendGrid, AWS SES) for production.

### Phone Number Validation
Currently supporting Morocco (+212) and France (+33) country codes only. Additional country codes can be added as needed.

## Project Structure

```
agent-service/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── docs/            # API documentation
│   └── app.js           # Express app setup
├── db/
│   ├── migrations/      # Database migrations
│   └── seeds/           # Sample data
├── tests/
│   ├── integration/     # Integration tests
│   └── unit/            # Unit tests
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Health Check

Check service health:

```bash
curl http://localhost:3003/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T10:00:00.000Z",
  "database": "connected"
}
```

## Contributing

1. Follow the established patterns from pricing-service
2. Write tests for new features
3. Update API documentation
4. Ensure all tests pass before committing

## License

ISC