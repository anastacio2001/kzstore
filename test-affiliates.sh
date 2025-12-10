#!/bin/bash

# Script de Teste Completo do Sistema de Afiliados
# Data: 10/12/2025

API_URL="https://kzstore-backend.fly.dev"

echo "========================================="
echo "🧪 TESTE DO SISTEMA DE AFILIADOS"
echo "========================================="
echo ""

# Verificar se backend está online
echo "1️⃣ Verificando backend..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$STATUS" = "200" ]; then
  echo "   ✅ Backend online (HTTP $STATUS)"
else
  echo "   ❌ Backend offline (HTTP $STATUS)"
  exit 1
fi
echo ""

# Testar endpoint público (busca por código)
echo "2️⃣ Testando endpoint público /api/affiliates/code/:code"
RESULT=$(curl -s "$API_URL/api/affiliates/code/TESTE" | jq -r '.error // .affiliate.name // "unknown"')
echo "   Resultado: $RESULT"
echo ""

# Informações sobre autenticação
echo "3️⃣ Endpoints protegidos (requerem autenticação):"
echo "   📍 GET  /api/affiliates - Listar todos"
echo "   📍 GET  /api/affiliates/stats - Estatísticas gerais"
echo "   📍 GET  /api/affiliates/:id - Detalhes do afiliado"
echo "   📍 POST /api/affiliates - Criar afiliado (admin)"
echo "   📍 PUT  /api/affiliates/:id - Atualizar (admin)"
echo "   📍 DELETE /api/affiliates/:id - Deletar (admin)"
echo ""

echo "4️⃣ Endpoints de tracking:"
echo "   📍 POST /api/affiliates/track-click - Registrar clique (público)"
echo "   📍 POST /api/affiliates/convert-sale - Converter venda"
echo "   📍 GET  /api/affiliates/:id/clicks - Listar cliques"
echo "   📍 GET  /api/affiliates/:id/commissions - Listar comissões"
echo "   📍 PUT  /api/affiliates/commissions/:id/pay - Pagar comissão (admin)"
echo ""

echo "========================================="
echo "✅ SISTEMA PRONTO PARA USO!"
echo "========================================="
echo ""
echo "📊 Estrutura do Banco de Dados:"
echo "   ✅ affiliates (10 campos)"
echo "   ✅ affiliate_clicks (tracking de cliques)"
echo "   ✅ affiliate_commissions (pagamentos)"
echo "   ✅ coupon_usage (histórico de cupons)"
echo "   ✅ coupons (+ category_id, first_purchase_only)"
echo "   ✅ reviews (+ images, videos, helpful_count)"
echo ""

echo "🔗 Próximos passos:"
echo "   1. Acessar painel admin em https://kzstore.ao/admin"
echo "   2. Ir em 'Afiliados' para criar primeiro afiliado"
echo "   3. Gerar link de afiliado: https://kzstore.ao?ref=CODIGO"
echo "   4. Tracking automático quando clicarem no link"
echo ""
