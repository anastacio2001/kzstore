#!/bin/bash

echo "🧪 Testando Sistema de Blog Interactions"
echo "========================================"
echo ""

# Configuração
API_URL="http://localhost:8080/api"
POST_ID="4465a42a-5b03-4fba-a213-35c8c40efa90"  # Primeiro post do blog

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${YELLOW}📍 Testando: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Sucesso (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Erro (HTTP $http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# 1. Testar listagem de posts
test_endpoint "Listar Posts do Blog" "GET" "/blog"

# 2. Testar visualização de post
test_endpoint "Registrar Visualização" "POST" "/blog/$POST_ID/view" '{}'

# 3. Testar curtida
test_endpoint "Curtir Post" "POST" "/blog/$POST_ID/like" '{
    "userEmail": "teste@kzstore.ao"
}'

# 4. Obter likes
test_endpoint "Obter Likes do Post" "GET" "/blog/$POST_ID/likes"

# 5. Adicionar comentário
test_endpoint "Adicionar Comentário" "POST" "/blog/$POST_ID/comments" '{
    "content": "Excelente artigo! Muito informativo sobre RAMs de servidor.",
    "author_name": "João Silva",
    "author_email": "joao@example.com"
}'

# 6. Listar comentários
test_endpoint "Listar Comentários Aprovados" "GET" "/blog/$POST_ID/comments"

# 7. Registrar compartilhamento
test_endpoint "Registrar Compartilhamento" "POST" "/blog/$POST_ID/share" '{
    "platform": "whatsapp"
}'

# 8. Obter estatísticas (admin)
test_endpoint "Obter Analytics do Post" "GET" "/blog/$POST_ID/analytics"

echo ""
echo -e "${GREEN}✅ Testes Completos!${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Verificar comentários pendentes no painel admin"
echo "  2. Testar moderação de comentários"
echo "  3. Visualizar analytics no dashboard"
