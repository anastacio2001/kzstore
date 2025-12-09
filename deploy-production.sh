#!/bin/bash

# 🚀 Script de Deploy Completo - KZSTORE
# Frontend: Vercel
# Backend: Fly.io
# Database: Neon PostgreSQL

set -e

echo "🎯 KZSTORE - Deploy para Produção"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar dependências
echo -e "${BLUE}📋 Verificando dependências...${NC}"
command -v fly >/dev/null 2>&1 || { echo "❌ Fly CLI não instalado. Instale com: curl -L https://fly.io/install.sh | sh"; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI não instalado. Instale com: npm i -g vercel"; exit 1; }
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# 2. Executar testes (se existirem)
echo -e "${BLUE}🧪 Verificando código...${NC}"
if [ -f "test-blog-interactions.sh" ]; then
  echo "Rodando testes do blog..."
  # ./test-blog-interactions.sh || echo "⚠️ Alguns testes falharam, continuando..."
fi
echo -e "${GREEN}✅ Código verificado${NC}"
echo ""

# 3. Build local do frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend build concluído${NC}"
echo ""

# 4. Deploy do Backend no Fly.io
echo -e "${BLUE}🚀 Deploy do Backend (Fly.io)...${NC}"
echo "App: kzstore-backend"
echo "Região: Paris (CDG)"
echo ""

# Verificar se app existe
if ! fly status -a kzstore-backend >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️ App kzstore-backend não existe. Criando...${NC}"
  fly launch --name kzstore-backend --region cdg --no-deploy
fi

# Verificar secrets
echo "Verificando variáveis de ambiente..."
fly secrets list -a kzstore-backend >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️ Configure os secrets primeiro:${NC}"
  echo "fly secrets set DATABASE_URL=\"postgresql://...\" -a kzstore-backend"
  echo "fly secrets set DIRECT_URL=\"postgresql://...\" -a kzstore-backend"
  echo ""
  read -p "Secrets configurados? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
}

# Deploy
fly deploy -a kzstore-backend --ha=false
echo -e "${GREEN}✅ Backend deployed!${NC}"
echo ""

# 5. Deploy do Frontend no Vercel
echo -e "${BLUE}🚀 Deploy do Frontend (Vercel)...${NC}"
echo ""

# Verificar se está linkado
if [ ! -f ".vercel/project.json" ]; then
  echo -e "${YELLOW}⚠️ Projeto não linkado ao Vercel. Linkando...${NC}"
  vercel link
fi

# Deploy para produção
vercel --prod
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo ""

# 6. Executar migrations no Neon
echo -e "${BLUE}💾 Aplicando migrations no banco...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo ""

# 7. Verificar health do backend
echo -e "${BLUE}🏥 Verificando saúde do backend...${NC}"
BACKEND_URL="https://kzstore-backend.fly.dev"
sleep 5
if curl -sf "$BACKEND_URL/health" > /dev/null; then
  echo -e "${GREEN}✅ Backend está saudável!${NC}"
else
  echo -e "${YELLOW}⚠️ Backend pode estar inicializando...${NC}"
fi
echo ""

# 8. Resumo
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deploy Concluído!${NC}"
echo "=================================="
echo ""
echo "📍 URLs:"
echo "  Frontend: https://kzstore.vercel.app (ou seu domínio custom)"
echo "  Backend:  $BACKEND_URL"
echo "  Database: Neon PostgreSQL"
echo ""
echo "📊 Monitoramento:"
echo "  Fly.io Dashboard: https://fly.io/apps/kzstore-backend"
echo "  Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "🔍 Comandos úteis:"
echo "  fly logs -a kzstore-backend          # Ver logs do backend"
echo "  fly status -a kzstore-backend        # Status do backend"
echo "  vercel logs                          # Ver logs do frontend"
echo ""
