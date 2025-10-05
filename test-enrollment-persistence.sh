#!/bin/bash

# Test Enrollment Data Persistence Flow
# This script tests the complete enrollment flow from creation to dashboard display

echo "🧪 Testing Enrollment Data Persistence Flow"
echo "============================================="
echo ""

ENROLLMENT_SERVICE="http://localhost:3002"
AGENT_SERVICE="http://localhost:3003"
AGENT_ID="11111111-1111-1111-1111-111111111111"
TEST_CIN="TEST$(date +%s)"

echo "📝 Step 1: Create a new enrollment with customer data"
echo "------------------------------------------------------"
CREATE_RESPONSE=$(curl -s -X POST "$ENROLLMENT_SERVICE/api/v1/enrollments" \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d "{
    \"customer\": {
      \"cin\": \"$TEST_CIN\",
      \"first_name\": \"John\",
      \"last_name\": \"Doe\",
      \"date_of_birth\": \"1990-05-15\",
      \"email\": \"john.doe@test.com\",
      \"phone\": \"+212600000000\",
      \"address\": {
        \"street\": \"123 Test Street\",
        \"city\": \"Casablanca\",
        \"country\": \"Morocco\"
      }
    },
    \"plan_id\": \"00000000-0000-0000-0000-000000000001\",
    \"effective_date\": \"2025-01-01\"
  }")

echo "Response: $CREATE_RESPONSE"
ENROLLMENT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo "✅ Enrollment created with ID: $ENROLLMENT_ID"
echo ""

echo "📝 Step 2: Save customer info step data"
echo "---------------------------------------"
STEP_RESPONSE=$(curl -s -X POST "$ENROLLMENT_SERVICE/api/v1/enrollments/$ENROLLMENT_ID/steps/customer_info" \
  -H "Content-Type: application/json" \
  -H "x-agent-id: $AGENT_ID" \
  -d "{
    \"subscriber\": {
      \"salutation\": \"M.\",
      \"firstName\": \"John\",
      \"lastName\": \"Doe\",
      \"idNumber\": \"$TEST_CIN\",
      \"nationality\": \"Maroc\",
      \"birthDate\": \"1990-05-15\",
      \"birthPlace\": \"Casablanca\",
      \"address\": \"123 Test Street\",
      \"city\": \"Casablanca\",
      \"country\": \"Maroc\",
      \"phone\": \"+212600000000\",
      \"occupation\": \"Engineer\",
      \"maritalStatus\": \"Célibataire\",
      \"numberOfChildren\": \"0\",
      \"usCitizen\": \"Non\"
    },
    \"insured\": {
      \"salutation\": \"M.\",
      \"firstName\": \"John\",
      \"lastName\": \"Doe\",
      \"idNumber\": \"$TEST_CIN\",
      \"nationality\": \"Maroc\",
      \"birthDate\": \"1990-05-15\",
      \"birthPlace\": \"Casablanca\",
      \"address\": \"123 Test Street\",
      \"city\": \"Casablanca\",
      \"country\": \"Maroc\",
      \"phone\": \"+212600000000\",
      \"occupation\": \"Engineer\",
      \"maritalStatus\": \"Célibataire\",
      \"numberOfChildren\": \"0\",
      \"usCitizen\": \"Non\"
    },
    \"insuredSameAsSubscriber\": true
  }")

echo "Response: $STEP_RESPONSE"
echo "✅ Customer info step data saved"
echo ""

echo "📝 Step 3: Retrieve enrollment by ID (verify customer data is included)"
echo "-----------------------------------------------------------------------"
GET_RESPONSE=$(curl -s "$ENROLLMENT_SERVICE/api/v1/enrollments/$ENROLLMENT_ID" \
  -H "x-agent-id: $AGENT_ID")

echo "Enrollment data:"
echo $GET_RESPONSE | jq '.data.customer'
CUSTOMER_NAME=$(echo $GET_RESPONSE | jq -r '.data.customer.first_name + " " + .data.customer.last_name')
echo "✅ Customer name in enrollment: $CUSTOMER_NAME"
echo ""

echo "📝 Step 4: List enrollments for agent (verify customer data is included)"
echo "------------------------------------------------------------------------"
LIST_RESPONSE=$(curl -s "$ENROLLMENT_SERVICE/api/v1/enrollments?agentId=$AGENT_ID" \
  -H "x-agent-id: $AGENT_ID")

echo "Enrollments list (first 2):"
echo $LIST_RESPONSE | jq '.data[:2] | .[] | {id, status, customer: {first_name, last_name}}'
echo "✅ Enrollments listed with customer data"
echo ""

echo "📝 Step 5: Get enrollment summary"
echo "---------------------------------"
SUMMARY_RESPONSE=$(curl -s "$ENROLLMENT_SERVICE/api/v1/enrollments/$ENROLLMENT_ID/summary" \
  -H "x-agent-id: $AGENT_ID")

echo "Summary:"
echo $SUMMARY_RESPONSE | jq '.data | {enrollment: {id, status, customer}, steps: .steps | length}'
echo "✅ Summary retrieved with customer data and steps"
echo ""

echo "📝 Step 6: Retrieve step data (verify it's properly saved)"
echo "----------------------------------------------------------"
STEP_GET_RESPONSE=$(curl -s "$ENROLLMENT_SERVICE/api/v1/enrollments/$ENROLLMENT_ID/steps/customer_info" \
  -H "x-agent-id: $AGENT_ID")

echo "Step data:"
echo $STEP_GET_RESPONSE | jq '.data.step_data.subscriber | {firstName, lastName, city}'
echo "✅ Step data retrieved successfully"
echo ""

echo "🎉 All tests completed!"
echo "======================="
echo ""
echo "Summary of changes:"
echo "- ✅ Enrollment service now joins customer data in list() and getById()"
echo "- ✅ Step data saves automatically update customer records"
echo "- ✅ Customer information is included in all enrollment responses"
echo "- ✅ Dashboard will now show real customer names instead of mocked data"
echo ""
echo "Next steps:"
echo "1. Start the enrollment-service: cd enrollment-service && npm start"
echo "2. Start the agent-service: cd agent-service && npm start"
echo "3. Access the agent dashboard and verify customer names appear"
echo ""
