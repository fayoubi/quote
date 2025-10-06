#!/bin/bash

# Test script for Enrollment API V2 (JSONB-based, No Status)
# This script tests the simplified enrollment flow

BASE_URL="http://localhost:3002/api/v1"
AGENT_SERVICE_URL="http://localhost:3003/api/v1"
PHONE="+212063737347"

echo "========================================="
echo "Testing Enrollment API V2"
echo "========================================="
echo ""

# Step 1: Get OTP for agent
echo "1. Requesting OTP for agent ${PHONE}..."
OTP_RESPONSE=$(curl -s -X POST "${AGENT_SERVICE_URL}/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"${PHONE}\"}")

echo "OTP Response: ${OTP_RESPONSE}"
echo ""

# Extract OTP from console logs (for testing)
echo "Please check the agent-service logs for the OTP code."
echo "Press Enter to continue after noting the OTP..."
read

echo "Enter the OTP code: "
read OTP_CODE

# Step 2: Verify OTP and get token
echo "2. Verifying OTP..."
AUTH_RESPONSE=$(curl -s -X POST "${AGENT_SERVICE_URL}/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"${PHONE}\",\"otp\":\"${OTP_CODE}\"}")

echo "Auth Response: ${AUTH_RESPONSE}"
echo ""

# Extract token
TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got authentication token"
echo ""

# Step 3: Create new enrollment
echo "3. Creating new enrollment..."
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/enrollments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Create Response:"
echo $CREATE_RESPONSE | jq '.'
echo ""

ENROLLMENT_ID=$(echo $CREATE_RESPONSE | jq -r '.enrollment.id')

if [ "$ENROLLMENT_ID" == "null" ] || [ -z "$ENROLLMENT_ID" ]; then
  echo "❌ Failed to create enrollment"
  exit 1
fi

echo "✅ Created enrollment with ID: ${ENROLLMENT_ID}"
echo ""

# Step 4: Update with personal info
echo "4. Updating with personal information..."
PERSONAL_INFO_DATA='{
  "personalInfo": {
    "subscriber": {
      "firstName": "Ahmed",
      "lastName": "Benali",
      "cin": "AB123456",
      "dateOfBirth": "1985-03-15",
      "placeOfBirth": "Casablanca",
      "address": "123 Rue Mohammed V",
      "city": "Casablanca",
      "phone": "+212612345678",
      "email": "ahmed.benali@example.com"
    },
    "insured": {
      "sameAsSubscriber": true
    }
  }
}'

UPDATE_PERSONAL_RESPONSE=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "${PERSONAL_INFO_DATA}")

echo "Update Personal Info Response:"
echo $UPDATE_PERSONAL_RESPONSE | jq '.'
echo ""

# Step 5: Update with contribution info
echo "5. Updating with contribution information..."
CONTRIBUTION_DATA='{
  "contribution": {
    "amount": 100,
    "amountText": "Cent Dirhams",
    "originOfFunds": {
      "savings": false,
      "propertySale": false,
      "securitiesSale": false,
      "inheritance": true,
      "other": ""
    },
    "paymentMode": {
      "type": "bank_transfer",
      "bank": "CIH",
      "agency": "Test",
      "rib": "013 780 1000000000088747 34"
    }
  }
}'

UPDATE_CONTRIBUTION_RESPONSE=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "${CONTRIBUTION_DATA}")

echo "Update Contribution Response:"
echo $UPDATE_CONTRIBUTION_RESPONSE | jq '.'
echo ""

# Step 6: Update with beneficiaries
echo "6. Updating with beneficiaries..."
BENEFICIARIES_DATA='{
  "beneficiaries": [
    {
      "lastName": "Benali",
      "firstName": "Fatima",
      "cin": "CD789012",
      "dateOfBirth": "1960-05-20",
      "placeOfBirth": "Rabat",
      "address": "456 Avenue Hassan II, Rabat",
      "percentage": 50
    },
    {
      "lastName": "Benali",
      "firstName": "Youssef",
      "cin": "",
      "dateOfBirth": "1987-12-10",
      "placeOfBirth": "Casablanca",
      "address": "789 Boulevard Zerktouni, Casablanca",
      "percentage": 50
    }
  ]
}'

UPDATE_BENEFICIARIES_RESPONSE=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "${BENEFICIARIES_DATA}")

echo "Update Beneficiaries Response:"
echo $UPDATE_BENEFICIARIES_RESPONSE | jq '.'
echo ""

# Step 7: Get enrollment to verify all data
echo "7. Retrieving enrollment to verify data..."
GET_RESPONSE=$(curl -s -X GET "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

echo "Get Enrollment Response:"
echo $GET_RESPONSE | jq '.'
echo ""

# Step 8: List all enrollments for agent
echo "8. Listing all enrollments for agent..."
LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}/enrollments" \
  -H "Authorization: Bearer ${TOKEN}")

echo "List Enrollments Response:"
echo $LIST_RESPONSE | jq '.'
echo ""

echo "========================================="
echo "✅ Test Complete!"
echo "========================================="
echo ""
echo "Enrollment ID: ${ENROLLMENT_ID}"
echo ""
echo "Verify in database with:"
echo "docker exec -it enrollment-service-enrollment-db-1 psql -U postgres -d enrollment -c \"SELECT id, agent_id, customer_id, jsonb_pretty(data) FROM enrollments WHERE id = '${ENROLLMENT_ID}';\""
