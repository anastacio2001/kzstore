#!/bin/bash

URL="https://kzstore-341392738431.us-central1.run.app"

echo "🧪 TESTANDO TODOS OS CRON JOBS DA FASE 4"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local name=$1
  local endpoint=$2

  echo -n "Testing $name... "

  response=$(curl -s -w "\n%{http_code}" -X POST "$URL$endpoint" -H "Content-Type: application/json")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    success=$(echo "$body" | grep -o '"success":true' | head -1)
    if [ -n "$success" ]; then
      echo -e "${GREEN}✅ OK${NC}"
      echo "   Response: $(echo "$body" | head -c 100)..."
    else
      echo -e "${RED}❌ FAILED${NC}"
      echo "   Response: $body"
    fi
  else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "   Response: $(echo "$body" | head -c 200)"
  fi

  echo ""
}

echo "📦 [1/6] Low Stock Alerts (Verificação de Estoque)"
test_endpoint "Low Stock Alerts" "/api/cron/low-stock-alerts"

echo "🛒 [2/6] Abandoned Carts (Carrinhos Abandonados)"
test_endpoint "Abandoned Carts" "/api/cron/abandoned-carts"

echo "📊 [3/6] Daily Metrics (Métricas Diárias)"
test_endpoint "Daily Metrics" "/api/cron/daily-metrics"

echo "🧹 [4/6] Cleanup Carts (Limpeza de Carrinhos)"
test_endpoint "Cleanup Carts" "/api/cron/cleanup-carts"

echo "⭐ [5/6] Update Featured (Produtos em Destaque)"
test_endpoint "Update Featured" "/api/cron/update-featured"

echo "📧 [6/6] Weekly Report (Relatório Semanal)"
test_endpoint "Weekly Report" "/api/cron/weekly-report"

echo "=========================================="
echo "✅ Testes concluídos!"
echo ""
echo "📝 Para mais detalhes, ver: TESTE_FASE4.md"
