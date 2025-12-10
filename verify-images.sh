#!/bin/bash

# Script para verificar quais imagens retornam 404

echo "🔍 Verificando imagens do site..."
echo ""

# Buscar produtos da API
PRODUCTS=$(curl -s "https://kzstore-backend.fly.dev/api/products?limit=100")

# Contar total
TOTAL=$(echo "$PRODUCTS" | jq -r '.data | length')
echo "📦 Total de produtos: $TOTAL"
echo ""

# Verificar cada imagem
echo "🖼️  Verificando status das imagens..."
echo ""

BROKEN=0
WORKING=0

while IFS= read -r url; do
  if [[ -z "$url" || "$url" == "null" ]]; then
    continue
  fi
  
  # Fazer requisição HEAD para verificar se existe
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  
  if [[ "$STATUS" == "200" ]]; then
    ((WORKING++))
    echo "✅ [$STATUS] $url"
  else
    ((BROKEN++))
    echo "❌ [$STATUS] $url"
  fi
  
done < <(echo "$PRODUCTS" | jq -r '.data[].imagem_url')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resultado:"
echo "   ✅ Funcionando: $WORKING"
echo "   ❌ Quebradas: $BROKEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
