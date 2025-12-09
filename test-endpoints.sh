#!/bin/bash

# Script para testar todos os endpoints do blog
# Uso: ./test-endpoints.sh

BASE_URL="https://kzstore-341392738431.europe-southwest1.run.app"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Testando endpoints do Blog..."
echo "================================"

# 1. Testar GET /api/blog
echo -e "\n1️⃣ GET /api/blog - Listar posts"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/blog")
if [ "$STATUS" == "200" ]; then
  echo -e "${GREEN}✅ OK - Status: $STATUS${NC}"
else
  echo -e "${RED}❌ FAIL - Status: $STATUS${NC}"
fi

# 2. Testar POST /api/blog/:postId/comments (sem body)
echo -e "\n2️⃣ POST /api/blog/test-post/comments (sem body - deve dar 400)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/blog/test-post/comments" -H "Content-Type: application/json")
if [ "$STATUS" == "400" ]; then
  echo -e "${GREEN}✅ OK - Status: $STATUS (esperado 400)${NC}"
else
  echo -e "${RED}❌ FAIL - Status: $STATUS (esperado 400)${NC}"
fi

# 3. Testar GET /api/flash-sales
echo -e "\n3️⃣ GET /api/flash-sales"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/flash-sales")
if [ "$STATUS" == "200" ]; then
  echo -e "${GREEN}✅ OK - Status: $STATUS${NC}"
  # Ver quantos flash sales ativos
  SALES=$(curl -s "$BASE_URL/api/flash-sales" | jq '.flashSales | length')
  echo "   📊 Flash Sales ativos: $SALES"
else
  echo -e "${RED}❌ FAIL - Status: $STATUS${NC}"
fi

echo -e "\n================================"
echo "🏁 Testes concluídos"
