#!/bin/bash

# Script para configurar domínio personalizado kzstore.ao no Vercel
# Author: KZSTORE Team
# Date: 9 dezembro 2025

echo "🌐 Configuração de Domínio Personalizado - KZSTORE"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não instalado${NC}"
    echo "Instalando..."
    npm install -g vercel
fi

echo -e "${BLUE}📋 Informações do Projeto${NC}"
echo "Projeto: KZSTORE Online Shop"
echo "Domínio Desejado: kzstore.ao"
echo ""

echo -e "${YELLOW}1️⃣ Verificando projeto no Vercel...${NC}"
vercel whoami

echo ""
echo -e "${YELLOW}2️⃣ Lista de domínios atuais:${NC}"
vercel domains ls

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Como adicionar o domínio kzstore.ao:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Opção 1: Via CLI (execute agora)"
echo -e "${YELLOW}vercel domains add kzstore.ao${NC}"
echo ""
echo "Opção 2: Via Dashboard (mais visual)"
echo "1. Acesse: https://vercel.com/dashboard"
echo "2. Selecione o projeto KZSTORE"
echo "3. Settings → Domains"
echo "4. Digite 'kzstore.ao' e clique Add"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}📝 Registros DNS Necessários:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Configure no seu provedor de domínio:"
echo ""
echo "Registro A (para domínio raiz):"
echo "  Tipo: A"
echo "  Nome: @"
echo "  Valor: 76.76.21.21"
echo "  TTL: 3600"
echo ""
echo "Registro CNAME (para www):"
echo "  Tipo: CNAME"
echo "  Nome: www"
echo "  Valor: cname.vercel-dns.com"
echo "  TTL: 3600"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}🔍 Verificar Propagação DNS:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Use estas ferramentas para verificar:"
echo "• https://dnschecker.org/#A/kzstore.ao"
echo "• https://www.whatsmydns.net/#A/kzstore.ao"
echo ""
echo "Ou via terminal:"
echo -e "${YELLOW}dig kzstore.ao${NC}"
echo -e "${YELLOW}nslookup kzstore.ao${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}⚡ Executar Configuração Automaticamente?${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
read -p "Deseja adicionar kzstore.ao ao Vercel agora? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Adicionando domínio kzstore.ao...${NC}"
    vercel domains add kzstore.ao
    
    echo ""
    echo -e "${GREEN}✅ Comando executado!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Configure os registros DNS no seu provedor"
    echo "2. Aguarde propagação (1-48 horas)"
    echo "3. Verifique com: vercel domains ls"
    echo ""
else
    echo ""
    echo -e "${BLUE}ℹ️  OK, você pode adicionar manualmente depois.${NC}"
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}📚 Documentação Completa:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Consulte: CONFIGURAR_DOMINIO_VERCEL.md"
echo "Ou visite: https://vercel.com/docs/concepts/projects/custom-domains"
echo ""

echo -e "${GREEN}✨ Script finalizado!${NC}"
