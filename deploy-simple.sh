#!/bin/bash

# Deploy usando Cloud Build (sem Docker local)
set -e

PROJECT_ID="kzstore-477422"
REGION="europe-southwest1"
SERVICE_NAME="kzstore"

echo "🚀 Deploy do KZSTORE usando Google Cloud Build..."
echo ""

# Configurar projeto
gcloud config set project ${PROJECT_ID}

# Submit build para Cloud Build
echo "📤 Enviando código para Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

echo ""
echo "✅ Deploy iniciado! Aguarde alguns minutos..."
echo ""
echo "📊 Acompanhe o progresso em:"
echo "https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}"
echo ""
echo "🌐 Após conclusão, a URL será:"
echo "https://kzstore-${PROJECT_ID//-/}.run.app"
