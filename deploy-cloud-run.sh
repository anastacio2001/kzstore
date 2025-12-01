#!/bin/bash

# KZSTORE - Deploy para Google Cloud Run
# Este script faz o build e deploy da aplicação

set -e

PROJECT_ID="kzstore-477422"
REGION="europe-southwest1"
SERVICE_NAME="kzstore"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🚀 Iniciando deploy do KZSTORE para Google Cloud Run..."
echo ""

# 1. Configurar projeto
echo "📋 Configurando projeto: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# 2. Habilitar APIs necessárias
echo "🔧 Habilitando APIs necessárias..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Build da imagem Docker
echo "🏗️  Construindo imagem Docker..."
docker build -t ${IMAGE_NAME} .

# 4. Push para Container Registry
echo "📤 Enviando imagem para Google Container Registry..."
docker push ${IMAGE_NAME}

# 5. Deploy para Cloud Run
echo "🚢 Fazendo deploy para Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,CLOUD_SQL_CONNECTION_NAME=${PROJECT_ID}:${REGION}:kzstore-01" \
  --add-cloudsql-instances "${PROJECT_ID}:${REGION}:kzstore-01" \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --port 8080

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 URL do serviço:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
echo ""
echo "📊 Para ver logs:"
echo "gcloud run logs tail ${SERVICE_NAME} --region ${REGION}"
echo ""
echo "🔧 Para configurar variáveis de ambiente:"
echo "gcloud run services update ${SERVICE_NAME} --region ${REGION} --update-env-vars KEY=VALUE"
