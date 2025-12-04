#!/bin/bash

# Criar tabela NewsletterSubscriber executando script no Cloud Run

echo "🔄 Criando tabela NewsletterSubscriber via Cloud Run..."

# Fazer deploy do script de migração
gcloud run jobs create newsletter-migration \
  --image gcr.io/kzstore-477422/kzstore:latest \
  --region europe-southwest1 \
  --execute-now \
  --command npx \
  --args tsx,criar-newsletter-table-prod.ts \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --add-cloudsql-instances kzstore-477422:europe-southwest1:kzstore-01 \
  --max-retries 0 2>/dev/null

# Se o job já existe, executá-lo
if [ $? -ne 0 ]; then
  echo "Job já existe, executando..."
  gcloud run jobs execute newsletter-migration --region europe-southwest1
fi

echo "✅ Verificar logs em: https://console.cloud.google.com/run/jobs"
