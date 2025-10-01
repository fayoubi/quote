#!/bin/bash

  BASE_URL="http://localhost:3003/api/v1"

  echo "1. Health Check"
  curl -s -X GET "$BASE_URL/health" | jq .

  echo -e "\n2. Request OTP"
  OTP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/request-otp" \
    -H 'Content-Type: application/json' \
    -d '{"phone_number": "+212612345678"}')
  echo $OTP_RESPONSE | jq .

  # Extract OTP code
  OTP_CODE=$(echo $OTP_RESPONSE | jq -r '.code')
  echo "OTP Code: $OTP_CODE"

  echo -e "\n3. Verify OTP"
  TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
    -H 'Content-Type: application/json' \
    -d "{\"phone_number\": \"+212612345678\", \"code\": \"$OTP_CODE\"}")
  echo $TOKEN_RESPONSE | jq .

  # Extract token
  TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')
  echo "Token: $TOKEN"

  echo -e "\n4. Get Agent Profile"
  curl -s -X GET "$BASE_URL/agents/me" \
    -H "Authorization: Bearer $TOKEN" | jq .

  echo -e "\n5. Validate Token"
  curl -s -X POST "$BASE_URL/auth/validate" \
    -H 'Content-Type: application/json' \
    -d "{\"token\": \"$TOKEN\"}" | jq .

  Run it:
  chmod +x test-agent-service.sh
  ./test-agent-service.sh

  ---
  🔍 Available Test Agents

  | Name             | Phone         | Country      | Email                       | License |
  |------------------|---------------|--------------|-----------------------------|---------|
  | Ahmed Bennani    | +212612345678 | 🇲🇦 Morocco | ahmed.bennani@yadmanx.com   | 100001  |
  | Fatima El Amrani | +212623456789 | 🇲🇦 Morocco | fatima.elamrani@yadmanx.com | 100002  |
  | Jean Dupont      | +33612345678  | 🇫🇷 France  | jean.dupont@yadmanx.fr      | 100003  |
  | Mohammed Alaoui  | +212634567890 | 🇲🇦 Morocco | mohammed.alaoui@yadmanx.com | 100004  |
  | Marie Martin     | +33623456789  | 🇫🇷 France  | marie.martin@yadmanx.fr     | 100005  |

  Happy testing! 🚀
