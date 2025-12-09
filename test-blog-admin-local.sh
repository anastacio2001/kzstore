#!/bin/bash

# Teste de endpoints de admin do blog

BASE_URL="http://localhost:3000"

echo "🔐 Fazendo login como admin..."
TOKEN=$(curl -s "$BASE_URL/api/auth/login" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"email":"l.anastacio001@gmail.com","password":"Mae2019@@@"}' | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Falha no login"
  exit 1
fi

echo "✅ Token obtido"
echo ""

# Testar endpoints
ENDPOINTS=(
  "comments/stats"
  "comments?status=pending"
  "analytics/overview"
  "analytics/top-posts"
  "analytics/categories"
  "analytics/top-searches"
  "analytics/searches-no-results"
  "shares/platforms"
  "shares/top-posts"
  "shares/timeline"
  "newsletter-popups/stats"
  "newsletter-popups/by-post"
  "newsletter-popups/timeline"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Testing: /api/admin/blog/$endpoint"
  STATUS=$(curl -s -o /tmp/response.json -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/blog/$endpoint")
  
  if [ "$STATUS" == "200" ]; then
    echo "✅ OK"
  else
    echo "❌ FAIL - Status: $STATUS"
    echo "Response:" 
    cat /tmp/response.json | jq '.' 2>/dev/null || cat /tmp/response.json
  fi
  echo ""
done
