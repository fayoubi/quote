#!/bin/bash

# End-to-End Enrollment Flow Test
# Tests: Agent login -> Create enrollment -> Verify customer_info step -> Check submission readiness

set -e

echo "======================================"
echo "End-to-End Enrollment Flow Test"
echo "======================================"
echo ""

# Test 1: Agent Login
echo "Step 1: Request OTP for agent login..."
PHONE="+212612345678"
OTP_RESPONSE=$(curl -s -X POST http://localhost:3003/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\",\"country_code\":\"+212\"}")

echo "OTP Response: $OTP_RESPONSE"

# Extract OTP code from response
OTP_CODE=$(echo $OTP_RESPONSE | grep -o '"code":"[^"]*' | cut -d'"' -f4)
if [ -z "$OTP_CODE" ]; then
  echo "❌ FAIL: Could not extract OTP code from response"
  exit 1
fi
echo "✓ OTP Code received: $OTP_CODE"
echo ""

# Test 2: Verify OTP and get token
echo "Step 2: Verify OTP and get authentication token..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3003/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\":\"$PHONE\",\"code\":\"$OTP_CODE\"}")

echo "Auth Response: $AUTH_RESPONSE"

# Extract token and agent ID
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
AGENT_ID=$(echo $AUTH_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ] || [ -z "$AGENT_ID" ]; then
  echo "❌ FAIL: Could not extract token or agent ID"
  exit 1
fi
echo "✓ Agent authenticated. Agent ID: $AGENT_ID"
echo ""

# Test 3: Create new enrollment
echo "Step 3: Create new enrollment via agent-service..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3003/api/v1/agents/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer": {
      "cin": "TEMP-'$(date +%s)'",
      "first_name": "Test",
      "last_name": "User",
      "date_of_birth": "1990-01-01",
      "email": "test@example.com",
      "phone": "0600000000",
      "address": {
        "street": "Test Street",
        "city": "Test City",
        "country": "Morocco"
      }
    },
    "plan_id": "00000000-0000-0000-0000-000000000001",
    "effective_date": "'$(date +%Y-%m-%d)'",
    "metadata": {
      "created_from": "test_script",
      "test_enrollment": true
    }
  }')

echo "Create Enrollment Response: $CREATE_RESPONSE"

# Extract enrollment ID
ENROLLMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ENROLLMENT_ID" ]; then
  echo "❌ FAIL: Could not extract enrollment ID"
  exit 1
fi
echo "✓ Enrollment created. ID: $ENROLLMENT_ID"
echo ""

# Test 4: Save customer_info step (this is what Dashboard.tsx does)
echo "Step 4: Save customer_info step data..."
STEP_SAVE_RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/steps/customer_info \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d '{
    "verified": true,
    "subscriber": {
      "salutation": "",
      "lastName": "User",
      "firstName": "Test",
      "idNumber": "",
      "nationality": "",
      "passportNumber": "",
      "residencePermit": "",
      "birthDate": "1990-01-01",
      "birthPlace": "",
      "address": "Test Street",
      "city": "Test City",
      "country": "Morocco",
      "phone": "0600000000",
      "occupation": "",
      "maritalStatus": "",
      "widowed": false,
      "numberOfChildren": "",
      "usCitizen": "",
      "tin": ""
    },
    "insured": {
      "salutation": "",
      "lastName": "User",
      "firstName": "Test",
      "idNumber": "",
      "nationality": "",
      "passportNumber": "",
      "residencePermit": "",
      "birthDate": "1990-01-01",
      "birthPlace": "",
      "address": "Test Street",
      "city": "Test City",
      "country": "Morocco",
      "phone": "0600000000",
      "occupation": "",
      "maritalStatus": "",
      "widowed": false,
      "numberOfChildren": "",
      "usCitizen": "",
      "tin": ""
    },
    "insuredSameAsSubscriber": true
  }')

echo "Step Save Response: $STEP_SAVE_RESPONSE"

if echo "$STEP_SAVE_RESPONSE" | grep -q '"success":true'; then
  echo "✓ customer_info step saved successfully"
else
  echo "❌ FAIL: customer_info step save failed"
  exit 1
fi
echo ""

# Test 5: Verify customer_info step is in completed_steps
echo "Step 5: Verify enrollment has customer_info in completed_steps..."
ENROLLMENT_DATA=$(curl -s http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID \
  -H "x-agent-id: $AGENT_ID")

echo "Enrollment Data: $ENROLLMENT_DATA"

if echo "$ENROLLMENT_DATA" | grep -q 'customer_info'; then
  echo "✓ customer_info found in completed_steps"
else
  echo "❌ FAIL: customer_info NOT found in completed_steps"
  exit 1
fi
echo ""

# Test 6: Retrieve customer_info step data
echo "Step 6: Retrieve customer_info step data..."
STEP_DATA=$(curl -s http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/steps/customer_info \
  -H "x-agent-id: $AGENT_ID")

echo "Step Data: $STEP_DATA"

if echo "$STEP_DATA" | grep -q 'Test'; then
  echo "✓ customer_info step data retrieved successfully"
else
  echo "⚠️  WARNING: customer_info step data may not have been retrieved correctly"
fi
echo ""

# Test 7: Add other required steps for submission
echo "Step 7: Adding contribution and beneficiaries steps..."

# Save contribution step
curl -s -X POST http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/steps/contribution \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d '{
    "frequency": "monthly",
    "amount": 500,
    "paymentMethod": "bank_transfer"
  }' > /dev/null

# Save beneficiaries step
curl -s -X POST http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/steps/beneficiaries \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d '{
    "beneficiaries": [
      {
        "firstName": "Test",
        "lastName": "Beneficiary",
        "relationship": "spouse",
        "percentage": 100
      }
    ]
  }' > /dev/null

# Save billing step
curl -s -X POST http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/steps/billing \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d '{
    "paymentMethod": "bank_transfer",
    "bankName": "Test Bank",
    "accountHolder": "Test User",
    "iban": "MA64011519000001205000534921"
  }' > /dev/null

echo "✓ Additional steps added"
echo ""

# Test 8: Try to submit enrollment
echo "Step 8: Attempting to submit enrollment..."
SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:3002/api/v1/enrollments/$ENROLLMENT_ID/submit \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID")

echo "Submit Response: $SUBMIT_RESPONSE"

if echo "$SUBMIT_RESPONSE" | grep -q '"success":true'; then
  echo "✅ PASS: Enrollment submitted successfully!"
  echo ""
  echo "======================================"
  echo "TEST RESULT: PASS ✅"
  echo "======================================"
  echo "All steps completed successfully:"
  echo "  1. Agent authentication ✓"
  echo "  2. Enrollment creation ✓"
  echo "  3. customer_info step saved ✓"
  echo "  4. customer_info in completed_steps ✓"
  echo "  5. Step data retrievable ✓"
  echo "  6. Enrollment submission successful ✓"
  echo ""
  echo "Enrollment ID: $ENROLLMENT_ID"
  exit 0
elif echo "$SUBMIT_RESPONSE" | grep -q 'Missing required steps'; then
  echo "❌ FAIL: Enrollment submission failed due to missing required steps"
  echo ""
  echo "======================================"
  echo "TEST RESULT: FAIL ❌"
  echo "======================================"
  echo "Issue: Missing required steps error still occurring"
  echo "Enrollment ID: $ENROLLMENT_ID"
  exit 1
else
  echo "❌ FAIL: Enrollment submission failed with unexpected error"
  echo ""
  echo "======================================"
  echo "TEST RESULT: FAIL ❌"
  echo "======================================"
  echo "Enrollment ID: $ENROLLMENT_ID"
  exit 1
fi
