# Database Access Guide

Quick reference for connecting to YadmanX service databases using `psql`.

## Prerequisites

```bash
# Install PostgreSQL client (if not already installed)
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

## Connection Commands

### Pricing Service Database

```bash
psql -h localhost -p 5432 -U postgres -d pricing
```

**Password:** `postgres`

### Enrollment Service Database

```bash
psql -h localhost -p 5433 -U postgres -d enrollment
```

**Password:** `postgres`

### Agent Service Database

```bash
psql -h localhost -p 5434 -U postgres -d agent
```

**Password:** `postgres`

## Quick Commands

### List all tables
```sql
\dt
```

### Describe table structure
```sql
\d table_name
```

### View table data
```sql
SELECT * FROM table_name LIMIT 10;
```

### Exit psql
```sql
\q
```

## One-Line Connection (Skip Password Prompt)

Set password environment variable:

```bash
export PGPASSWORD=postgres

# Then connect without password prompt
psql -h localhost -p 5432 -U postgres -d pricing
psql -h localhost -p 5433 -U postgres -d enrollment
psql -h localhost -p 5434 -U postgres -d agent
```

## Execute SQL from Command Line

```bash
# Pricing DB
psql -h localhost -p 5432 -U postgres -d pricing -c "SELECT * FROM products;"

# Enrollment DB
psql -h localhost -p 5433 -U postgres -d enrollment -c "SELECT * FROM enrollments LIMIT 5;"

# Agent DB
psql -h localhost -p 5434 -U postgres -d agent -c "SELECT * FROM agents;"
```

## Database Summary

| Service    | Port | Database   | User     | Password |
|------------|------|------------|----------|----------|
| Pricing    | 5432 | pricing    | postgres | postgres |
| Enrollment | 5433 | enrollment | postgres | postgres |
| Agent      | 5434 | agent      | postgres | postgres |

## Common SQL Queries

### Pricing Service
```sql
-- View all products
SELECT * FROM products;

-- View rate tables
SELECT * FROM rate_tables;

-- View quotes (if not ephemeral)
SELECT * FROM quotes ORDER BY created_at DESC LIMIT 10;
```

### Enrollment Service
```sql
-- View all enrollments
SELECT * FROM enrollments ORDER BY created_at DESC;

-- View enrollment by agent
SELECT * FROM enrollments WHERE agent_id = 'agent-uuid-here';

-- View enrollment details
SELECT e.*, c.first_name, c.last_name
FROM enrollments e
LEFT JOIN customers c ON e.customer_id = c.id;
```

### Agent Service
```sql
-- View all agents
SELECT id, first_name, last_name, email, phone_number, license_number, is_active
FROM agents;

-- View OTP sessions
SELECT * FROM otp_sessions WHERE phone_number = '612345678';

-- View agent sessions
SELECT * FROM sessions WHERE agent_id = 'agent-uuid-here';
```
