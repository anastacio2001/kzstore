#!/bin/bash

# Script para migrar imagens do Google Cloud Storage para Cloudflare R2
# Data: 8 de dezembro de 2025

set -e

echo "🚀 MIGRAÇÃO: Google Cloud Storage → Cloudflare R2"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI não está instalado${NC}"
    echo "Instale com: brew install awscli"
    exit 1
fi

# Verificar se gsutil está instalado
if ! command -v gsutil &> /dev/null; then
    echo -e "${RED}❌ gsutil não está instalado${NC}"
    echo "Instale com: brew install google-cloud-sdk"
    exit 1
fi

# Configurações
GCS_BUCKET="gs://kzstore-images"
LOCAL_BACKUP_DIR="$HOME/kzstore-images-backup"
R2_BUCKET="kzstore-images"
R2_PROFILE="r2"

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "  GCS Bucket: $GCS_BUCKET"
echo "  Backup Local: $LOCAL_BACKUP_DIR"
echo "  R2 Bucket: $R2_BUCKET"
echo ""

# Passo 1: Exportar do Google Cloud Storage
echo -e "${YELLOW}📦 Passo 1: Exportando imagens do Google Cloud Storage...${NC}"

if [ -d "$LOCAL_BACKUP_DIR" ]; then
    echo -e "${YELLOW}⚠️  Diretório de backup já existe. Deseja sobrescrever? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Usando backup existente..."
    else
        rm -rf "$LOCAL_BACKUP_DIR"
        mkdir -p "$LOCAL_BACKUP_DIR"
        gsutil -m rsync -r "$GCS_BUCKET" "$LOCAL_BACKUP_DIR"
    fi
else
    mkdir -p "$LOCAL_BACKUP_DIR"
    gsutil -m rsync -r "$GCS_BUCKET" "$LOCAL_BACKUP_DIR"
fi

# Contar arquivos
TOTAL_FILES=$(find "$LOCAL_BACKUP_DIR" -type f | wc -l | xargs)
TOTAL_SIZE=$(du -sh "$LOCAL_BACKUP_DIR" | cut -f1)

echo -e "${GREEN}✅ Exportação concluída:${NC}"
echo "  Total de arquivos: $TOTAL_FILES"
echo "  Tamanho total: $TOTAL_SIZE"
echo ""

# Passo 2: Configurar AWS CLI para R2
echo -e "${YELLOW}🔧 Passo 2: Configurando AWS CLI para Cloudflare R2...${NC}"

# Verificar se perfil R2 existe
if aws configure list --profile $R2_PROFILE &> /dev/null; then
    echo -e "${GREEN}✅ Perfil R2 já configurado${NC}"
else
    echo -e "${YELLOW}⚙️  Configure as credenciais R2:${NC}"
    aws configure --profile $R2_PROFILE
fi

# Obter endpoint R2
echo -e "${YELLOW}🔗 Digite o Account ID do Cloudflare R2:${NC}"
read -r R2_ACCOUNT_ID
R2_ENDPOINT="https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com"

echo ""

# Passo 3: Upload para Cloudflare R2
echo -e "${YELLOW}☁️  Passo 3: Fazendo upload para Cloudflare R2...${NC}"
echo "Endpoint: $R2_ENDPOINT"
echo ""

# Fazer upload com progress
aws s3 sync "$LOCAL_BACKUP_DIR" "s3://$R2_BUCKET" \
  --endpoint-url="$R2_ENDPOINT" \
  --profile=$R2_PROFILE \
  --acl public-read \
  --no-progress

echo -e "${GREEN}✅ Upload concluído${NC}"
echo ""

# Passo 4: Verificar upload
echo -e "${YELLOW}🔍 Passo 4: Verificando upload...${NC}"

R2_FILES=$(aws s3 ls "s3://$R2_BUCKET" --recursive --endpoint-url="$R2_ENDPOINT" --profile=$R2_PROFILE | wc -l | xargs)

echo -e "${GREEN}✅ Arquivos no R2: $R2_FILES${NC}"

if [ "$R2_FILES" -eq "$TOTAL_FILES" ]; then
    echo -e "${GREEN}🎉 Migração concluída com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Resumo:${NC}"
    echo "  Arquivos migrados: $TOTAL_FILES"
    echo "  Tamanho total: $TOTAL_SIZE"
    echo "  Origem: Google Cloud Storage"
    echo "  Destino: Cloudflare R2 ($R2_BUCKET)"
    echo ""
    echo -e "${YELLOW}🔧 Próximos passos:${NC}"
    echo "  1. Configurar domínio customizado no Cloudflare"
    echo "  2. Atualizar R2_PUBLIC_URL no .env"
    echo "  3. Testar carregamento de imagens"
    echo "  4. Deletar bucket do Cloud Storage"
else
    echo -e "${RED}⚠️  Aviso: Contagem de arquivos não coincide${NC}"
    echo "  Local: $TOTAL_FILES"
    echo "  R2: $R2_FILES"
    echo "  Verifique manualmente antes de deletar o bucket original"
fi

echo ""
echo -e "${GREEN}✅ Script concluído${NC}"
