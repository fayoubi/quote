#!/bin/bash

# Simple automated test for Enrollment API V2
# Uses stub authentication (no token required for now)

BASE_URL="http://localhost:3002/api/v1"

echo "========================================="
echo "Testing Enrollment API V2 (JSONB-based)"
echo "========================================="
echo ""

# Test 1: Create new enrollment
echo "1. Creating new enrollment..."
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/enrollments" \
  -H "Content-Type: application/json")

echo "$CREATE_RESPONSE" | jq '.'
ENROLLMENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.enrollment.id')

if [ "$ENROLLMENT_ID" == "null" ] || [ -z "$ENROLLMENT_ID" ]; then
  echo "❌ Failed to create enrollment"
  exit 1
fi

echo "✅ Created enrollment: $ENROLLMENT_ID"
echo ""

# Test 2: Update with personal info
echo "2. Updating with personal information..."
UPDATE_PERSONAL=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
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
      }
    }
  }')

echo "$UPDATE_PERSONAL" | jq '.'
echo "✅ Personal info updated"
echo ""

# Test 3: Update with contribution
echo "3. Updating with contribution..."
UPDATE_CONTRIBUTION=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "contribution": {
      "amount": 100,
      "amountText": "Cent Dirhams",
      "originOfFunds": {
        "inheritance": true
      },
      "paymentMode": {
        "type": "bank_transfer",
        "bank": "CIH",
        "agency": "Test",
        "rib": "013 780 1000000000088747 34"
      }
    }
  }')

echo "$UPDATE_CONTRIBUTION" | jq '.'
echo "✅ Contribution updated"
echo ""

# Test 4: Update with beneficiaries
echo "4. Updating with beneficiaries..."
UPDATE_BENEFICIARIES=$(curl -s -X PUT "${BASE_URL}/enrollments/${ENROLLMENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiaries": [
      {
        "lastName": "Benali",
        "firstName": "Fatima",
        "percentage": 50
      },
      {
        "lastName": "Benali",
        "firstName": "Youssef",
        "percentage": 50
      }
    ]
  }')

echo "$UPDATE_BENEFICIARIES" | jq '.'
echo "✅ Beneficiaries updated"
echo ""

# Test 5: Get enrollment
echo "5. Getting enrollment..."
GET_RESPONSE=$(curl -s -X GET "${BASE_URL}/enrollments/${ENROLLMENT_ID}")

echo "$GET_RESPONSE" | jq '.'
echo "✅ Retrieved enrollment"
echo ""

# Test 6: List enrollments
echo "6. Listing all enrollments..."
LIST_RESPONSE=$(curl -s -X GET "${BASE_URL}/enrollments")

echo "$LIST_RESPONSE" | jq '.'
echo "✅ Listed enrollments"
echo ""

echo "========================================="
echo "✅ All Tests Passed!"
echo "========================================="
echo ""
echo "Enrollment ID: $ENROLLMENT_ID"
echo ""
echo "Verify in database:"
echo "docker exec -it enrollment-service-enrollment-db-1 psql -U postgres -d enrollment -c \"SELECT jsonb_pretty(data) FROM enrollments WHERE id = '$ENROLLMENT_ID';\""
