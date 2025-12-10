#!/bin/bash

# Script para Corrigir URLs de Imagens dos Produtos
# Atualiza produtos com URLs relativas para usar placeholder ou R2

echo "🖼️  Corrigindo URLs de Imagens dos Produtos"
echo "==========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_URL="https://kzstore-backend.fly.dev/api"
PLACEHOLDER_IMAGE="https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE"

echo -e "${BLUE}📊 Verificando produtos com imagens quebradas...${NC}"
echo ""

# Buscar produtos
RESPONSE=$(curl -s "$BACKEND_URL/products?limit=1000")

# Contar produtos com URLs relativas (começam com / ou não têm http)
TOTAL=$(echo "$RESPONSE" | jq '.data | length')
echo "Total de produtos: $TOTAL"
echo ""

echo -e "${YELLOW}Produtos com URLs quebradas:${NC}"
echo "$RESPONSE" | jq -r '.data[] | select(.imagem_url | startswith("http") | not) | "\(.id) - \(.nome) - \(.imagem_url)"' | head -20

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Opções de Correção:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo "1. Substituir por imagem placeholder (https://via.placeholder.com)"
echo "2. Ver lista completa de URLs quebradas"
echo "3. Exportar lista para CSV"
echo "4. Cancelar"
echo ""

read -p "Escolha uma opção (1-4): " OPTION

case $OPTION in
  1)
    echo ""
    echo -e "${YELLOW}🔄 Atualizando produtos com imagem placeholder...${NC}"
    echo ""
    
    # Buscar IDs dos produtos com URLs quebradas
    PRODUCT_IDS=$(echo "$RESPONSE" | jq -r '.data[] | select(.imagem_url | startswith("http") | not) | .id')
    
    COUNT=0
    for ID in $PRODUCT_IDS; do
      echo "  Atualizando produto: $ID"
      
      # Atualizar produto
      curl -s -X PUT "$BACKEND_URL/products/$ID" \
        -H "Content-Type: application/json" \
        -d "{\"imagem_url\": \"$PLACEHOLDER_IMAGE\"}" > /dev/null
      
      COUNT=$((COUNT + 1))
    done
    
    echo ""
    echo -e "${GREEN}✅ $COUNT produtos atualizados!${NC}"
    ;;
    
  2)
    echo ""
    echo -e "${BLUE}Lista completa de URLs quebradas:${NC}"
    echo ""
    echo "$RESPONSE" | jq -r '.data[] | select(.imagem_url | startswith("http") | not) | "ID: \(.id)\nNome: \(.nome)\nURL: \(.imagem_url)\n---"'
    ;;
    
  3)
    echo ""
    FILENAME="produtos-imagens-quebradas-$(date +%Y%m%d-%H%M%S).csv"
    echo "ID,Nome,URL Atual" > "$FILENAME"
    echo "$RESPONSE" | jq -r '.data[] | select(.imagem_url | startswith("http") | not) | "\(.id),\"\(.nome)\",\(.imagem_url)"' >> "$FILENAME"
    echo -e "${GREEN}✅ Exportado para: $FILENAME${NC}"
    ;;
    
  4)
    echo "Cancelado."
    exit 0
    ;;
    
  *)
    echo -e "${RED}Opção inválida.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✨ Concluído!${NC}"
