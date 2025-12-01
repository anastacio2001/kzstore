#!/bin/bash

# Script de deploy para produção - Sistema de Autenticação de Equipe
# Executar após build concluído

echo "🚀 Deploy KZSTORE com Sistema de Autenticação"
echo ""

# 1. Fazer deploy da nova imagem
echo "📦 Fazendo deploy no Cloud Run..."
gcloud run deploy kzstore \
  --image europe-docker.pkg.dev/kzstore-477422/kzstore/kzstore:latest \
  --region europe-southwest1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10 \
  --port 8080 \
  --add-cloudsql-instances kzstore-477422:europe-southwest1:kzstore-01 \
  --set-secrets DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,RESEND_API_KEY=resend-api-key:latest,RESEND_FROM_EMAIL=resend-from-email:latest,RESEND_FROM_NAME=resend-from-name:latest,TWILIO_ACCOUNT_SID=twilio-account-sid:latest,TWILIO_AUTH_TOKEN=twilio-auth-token:latest,TWILIO_WHATSAPP_FROM=twilio-whatsapp-from:latest

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 URL: https://kzstore.ao"
echo "🔐 Admin: l.anastacio001@gmail.com / Mae2019@@@"
echo ""
echo "📚 Ver documentação: SISTEMA_AUTENTICACAO_EQUIPE.md"
echo ""
