#!/bin/bash

# Script para Limpar Recursos do Google Cloud Platform
# KZSTORE - Migração completa para Fly.io + Neon + Vercel
# Data: 9 Dezembro 2025

echo "🧹 Limpeza de Recursos Google Cloud Platform"
echo "=============================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI não instalado${NC}"
    echo "Este script não é necessário se você não tem Google Cloud ativo."
    echo "A migração está completa! Você pode deletar este script."
    exit 0
fi

echo -e "${BLUE}📋 Informação:${NC}"
echo "Este script vai listar e ajudar a limpar recursos do Google Cloud."
echo "A aplicação KZSTORE já está 100% migrada para:"
echo "  - Frontend: Vercel (kzstore.ao)"
echo "  - Backend: Fly.io (kzstore-backend.fly.dev)"
echo "  - Database: Neon PostgreSQL"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "NÃO vamos deletar:"
echo "  ✅ Google OAuth (login social)"
echo "  ✅ Google Gemini API (chatbot AI)"
echo ""

read -p "Deseja continuar com a verificação? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo -e "${BLUE}1️⃣ Listando projetos Google Cloud...${NC}"
gcloud projects list --format="table(projectId,name,createTime)"

echo ""
read -p "Digite o PROJECT_ID que deseja limpar (ou Enter para pular): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⏭️  Pulando limpeza de projeto${NC}"
else
    echo ""
    echo -e "${BLUE}2️⃣ Configurando projeto: $PROJECT_ID${NC}"
    gcloud config set project "$PROJECT_ID"
    
    echo ""
    echo -e "${BLUE}3️⃣ Listando serviços Cloud Run...${NC}"
    gcloud run services list --format="table(metadata.name,status.url,metadata.annotations.region)"
    
    echo ""
    read -p "Deseja deletar todos os serviços Cloud Run? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "Deletando serviços Cloud Run..."
        for service in $(gcloud run services list --format="value(metadata.name)"); do
            for region in $(gcloud run services describe "$service" --format="value(metadata.annotations.region)" 2>/dev/null || echo "us-central1"); do
                echo "  🗑️  Deletando: $service (região: $region)"
                gcloud run services delete "$service" --region="$region" --quiet
            done
        done
        echo -e "${GREEN}✅ Serviços Cloud Run deletados${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}4️⃣ Listando instâncias Cloud SQL...${NC}"
    gcloud sql instances list --format="table(name,region,databaseVersion,state)"
    
    echo ""
    read -p "Deseja deletar todas as instâncias Cloud SQL? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "Deletando instâncias Cloud SQL..."
        for instance in $(gcloud sql instances list --format="value(name)"); do
            echo "  🗑️  Deletando: $instance"
            gcloud sql instances delete "$instance" --quiet
        done
        echo -e "${GREEN}✅ Instâncias Cloud SQL deletadas${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}5️⃣ Listando imagens no Container Registry...${NC}"
    gcloud container images list --format="table(name)"
    
    echo ""
    read -p "Deseja deletar todas as imagens do Container Registry? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "Deletando imagens do Container Registry..."
        for image in $(gcloud container images list --format="value(name)"); do
            echo "  🗑️  Deletando: $image"
            gcloud container images delete "$image" --quiet --force-delete-tags
        done
        echo -e "${GREEN}✅ Imagens deletadas${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}6️⃣ Listando Load Balancers...${NC}"
    gcloud compute forwarding-rules list --format="table(name,region,IPAddress)"
    
    echo ""
    read -p "Deseja deletar Load Balancers? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "Deletando Load Balancers..."
        for lb in $(gcloud compute forwarding-rules list --format="value(name)"); do
            region=$(gcloud compute forwarding-rules describe "$lb" --format="value(region)" 2>/dev/null)
            if [ -n "$region" ]; then
                echo "  🗑️  Deletando: $lb (região: $region)"
                gcloud compute forwarding-rules delete "$lb" --region="$region" --quiet
            else
                echo "  🗑️  Deletando: $lb (global)"
                gcloud compute forwarding-rules delete "$lb" --global --quiet
            fi
        done
        echo -e "${GREEN}✅ Load Balancers deletados${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}7️⃣ Verificando faturamento atual...${NC}"
    gcloud billing projects describe "$PROJECT_ID" --format="table(billingAccountName,billingEnabled)"
    
    echo ""
    echo -e "${YELLOW}⚠️  ATENÇÃO FINAL:${NC}"
    echo "Se você deseja deletar o projeto inteiro:"
    echo ""
    echo -e "${RED}gcloud projects delete $PROJECT_ID${NC}"
    echo ""
    read -p "Deseja deletar o projeto INTEIRO agora? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo ""
        echo -e "${RED}⚠️  ÚLTIMA CONFIRMAÇÃO!${NC}"
        echo "Isso vai deletar TUDO do projeto: $PROJECT_ID"
        echo "Esta ação é IRREVERSÍVEL!"
        echo ""
        read -p "Digite 'DELETE' para confirmar: " CONFIRM
        if [ "$CONFIRM" = "DELETE" ]; then
            echo "Deletando projeto..."
            gcloud projects delete "$PROJECT_ID" --quiet
            echo -e "${GREEN}✅ Projeto deletado${NC}"
        else
            echo "Cancelado (confirmação incorreta)."
        fi
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Limpeza concluída!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo "📊 Status da Infraestrutura KZSTORE:"
echo "  ✅ Frontend: https://kzstore.ao (Vercel)"
echo "  ✅ Backend: https://kzstore-backend.fly.dev (Fly.io)"
echo "  ✅ Database: Neon PostgreSQL"
echo "  ✅ Google OAuth: Ativo (login social)"
echo "  ✅ Google Gemini: Ativo (chatbot AI)"
echo ""
echo "💰 Economia mensal estimada: $83-163"
echo ""
echo -e "${GREEN}🎉 Migração 100% completa!${NC}"
