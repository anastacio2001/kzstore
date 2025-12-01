#!/bin/bash

PROJECT_ID="kzstore-477422"
REGION="europe-southwest1"
SERVICE_NAME="kzstore"
IMAGE="gcr.io/$PROJECT_ID/kzstore:latest"

echo "🚀 Deploy KZSTORE para Cloud Run"
echo "=================================="
echo ""

# Build da imagem
echo "📦 Building Docker image..."
docker build -t $IMAGE .

if [ $? -ne 0 ]; then
  echo "❌ Erro ao fazer build da imagem"
  exit 1
fi

echo "✅ Build concluído"
echo ""

# Push da imagem
echo "📤 Pushing image to Container Registry..."
docker push $IMAGE

if [ $? -ne 0 ]; then
  echo "❌ Erro ao fazer push da imagem"
  exit 1
fi

echo "✅ Push concluído"
echo ""

# Deploy para Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,CLOUD_SQL_CONNECTION_NAME=kzstore-477422:europe-southwest1:kzstore-01,JWT_EXPIRES_IN=7d,VITE_APP_URL=https://kzstore.ao,VITE_API_URL=https://kzstore.ao/api,CORS_ORIGIN=https://kzstore.ao,RESEND_FROM_EMAIL=noreply@kzstore.ao,RESEND_FROM_NAME=KZSTORE Angola,TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886,GOOGLE_CLIENT_ID=341392738431-cql0059qvscfe2r61uiepar5hst18pod.apps.googleusercontent.com" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID:latest,TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN:latest,VITE_GEMINI_API_KEY=VITE_GEMINI_API_KEY:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest" \
  --add-cloudsql-instances=kzstore-477422:europe-southwest1:kzstore-01 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=600 \
  --min-instances=1 \
  --cpu-boost

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deploy concluído com sucesso!"
  echo ""
  echo "🌐 URL do serviço:"
  gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'
else
  echo ""
  echo "❌ Erro no deploy"
  exit 1
fi
