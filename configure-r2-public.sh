#!/bin/bash

# Script para tornar o bucket R2 público via Cloudflare API

echo "🔧 Configurando bucket R2 como público..."
echo ""

# Credenciais
ACCOUNT_ID="2764525461cdfe63446ef25726431505"
BUCKET_NAME="kzstore-images"
API_TOKEN="CunMghnYgO3QR8hR_LELs7TCkjOEQxFR3X9O9xmy"

echo "📦 Bucket: $BUCKET_NAME"
echo "🔑 Account: $ACCOUNT_ID"
echo ""

# Tentar tornar o bucket público
echo "🌐 Ativando acesso público ao bucket..."

# Método 1: Verificar configuração atual
echo ""
echo "1️⃣ Verificando configuração atual..."
curl -s -X GET \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/r2/buckets/$BUCKET_NAME" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANTE:"
echo ""
echo "Para tornar o bucket público, você precisa:"
echo ""
echo "1. Acessar: https://dash.cloudflare.com/"
echo "2. Ir em: R2 → Buckets → kzstore-images"
echo "3. Clicar em: Settings"
echo "4. Em 'Public Access', clicar em: Allow Access"
echo "5. Confirmar: Yes, Allow Public Access"
echo ""
echo "Isso permitirá acesso público às URLs:"
echo "https://pub-2764525461cdfe63446ef25726431505.r2.dev/*"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Após ativar, teste com:"
echo "curl -I https://pub-2764525461cdfe63446ef25726431505.r2.dev/product-xxx.jpg"
echo ""
echo "Deve retornar HTTP 200 em vez de HTTP 401"
echo ""
