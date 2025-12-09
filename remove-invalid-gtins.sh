#!/bin/bash
# Script para remover GTINs inválidos dos produtos

echo "🔧 Removendo GTINs inválidos dos produtos..."
echo ""

# IDs dos produtos com GTIN inválido
PRODUCT_IDS=(
  "3185c02b-54e4-47ea-8001-2d635beca0cb"
  "a9e14339-3c52-4b3a-88d9-ae454acb4acf"
  "4f170c70-2e9a-469d-8ba4-596f99ba726a"
  "b26c6797-6d3b-463d-96db-616acc99d6e6"
  "375b5f48-a03a-4979-bccf-52d566247426"
  "97d1845b-6c19-41e8-8f98-a25a389b57c9"
  "1adc475e-6549-4073-a4c6-06afcaa3bcaa"
  "a474a07b-e4dd-4f19-a27c-0900e9846031"
  "e760c420-191e-4bb6-82c3-f2eff5317485"
  "c92ed87a-06c7-47ab-b565-18fffe1e0175"
  "be171dee-de76-4be5-8f49-7c6bacb07dcd"
)

# Conectar ao banco via API Cloud SQL
for ID in "${PRODUCT_IDS[@]}"; do
  echo "Removendo GTIN do produto: $ID"
  
  mysql -h 127.0.0.1 -P 3307 -u root -p'KZStore@2024!Secure' kzstore_prod <<EOF
UPDATE products SET codigo_barras = NULL WHERE id = '$ID';
EOF
  
  if [ $? -eq 0 ]; then
    echo "✅ GTIN removido com sucesso"
  else
    echo "❌ Erro ao remover GTIN"
  fi
  echo ""
done

echo "✅ Todos os GTINs inválidos foram removidos!"
echo ""
echo "📌 PRÓXIMOS PASSOS:"
echo "1. Aguarde 24-48h para o Google processar as mudanças"
echo "2. Acesse Google Merchant Center → Products"
echo "3. Verifique se os erros 'Reserved GTIN' sumiram"
