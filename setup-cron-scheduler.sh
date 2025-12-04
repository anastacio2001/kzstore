#!/bin/bash

SERVICE_URL="https://kzstore-341392738431.us-central1.run.app"
LOCATION="us-central1"
TIMEZONE="Africa/Luanda"

echo "🚀 Configurando Cloud Scheduler para KZSTORE..."
echo ""

# Habilitar Cloud Scheduler API
echo "📡 Habilitando Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com

echo ""
echo "🔧 Criando jobs de automação..."
echo ""

# Job 1: Low Stock Alerts (Cada 30 minutos)
echo "📦 [1/6] Criando job: Low Stock Alerts (cada 30 min)..."
gcloud scheduler jobs create http low-stock-alerts \
  --schedule="*/30 * * * *" \
  --uri="$SERVICE_URL/api/cron/low-stock-alerts" \
  --http-method=POST \
  --location=$LOCATION \
  --description="Verifica produtos com estoque baixo" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

# Job 2: Abandoned Carts (A cada hora)
echo "🛒 [2/6] Criando job: Abandoned Carts (a cada hora)..."
gcloud scheduler jobs create http abandoned-carts \
  --schedule="0 * * * *" \
  --uri="$SERVICE_URL/api/cron/abandoned-carts" \
  --http-method=POST \
  --location=$LOCATION \
  --description="Processa carrinhos abandonados" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

# Job 3: Daily Metrics (Diário às 23:59)
echo "📊 [3/6] Criando job: Daily Metrics (diário 23:59)..."
gcloud scheduler jobs create http daily-metrics \
  --schedule="59 23 * * *" \
  --uri="$SERVICE_URL/api/cron/daily-metrics" \
  --http-method=POST \
  --location=$LOCATION \
  --time-zone=$TIMEZONE \
  --description="Calcula métricas diárias" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

# Job 4: Cleanup Carts (Diário às 02:00)
echo "🧹 [4/6] Criando job: Cleanup Carts (diário 02:00)..."
gcloud scheduler jobs create http cleanup-carts \
  --schedule="0 2 * * *" \
  --uri="$SERVICE_URL/api/cron/cleanup-carts" \
  --http-method=POST \
  --location=$LOCATION \
  --time-zone=$TIMEZONE \
  --description="Remove carrinhos antigos" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

# Job 5: Update Featured (Semanal - Domingo 00:00)
echo "⭐ [5/6] Criando job: Update Featured (semanal domingo 00:00)..."
gcloud scheduler jobs create http update-featured \
  --schedule="0 0 * * 0" \
  --uri="$SERVICE_URL/api/cron/update-featured" \
  --http-method=POST \
  --location=$LOCATION \
  --time-zone=$TIMEZONE \
  --description="Atualiza produtos em destaque" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

# Job 6: Weekly Report (Semanal - Segunda 09:00)
echo "📧 [6/6] Criando job: Weekly Report (semanal segunda 09:00)..."
gcloud scheduler jobs create http weekly-report \
  --schedule="0 9 * * 1" \
  --uri="$SERVICE_URL/api/cron/weekly-report" \
  --http-method=POST \
  --location=$LOCATION \
  --time-zone=$TIMEZONE \
  --description="Envia relatório semanal" \
  --quiet 2>/dev/null || echo "   ⚠️  Job já existe, pulando..."

echo ""
echo "✅ Configuração completa!"
echo ""
echo "📋 Jobs criados:"
gcloud scheduler jobs list --location=$LOCATION

echo ""
echo "🧪 Para testar um job manualmente:"
echo "   gcloud scheduler jobs run low-stock-alerts --location=$LOCATION"
echo ""
echo "⏸️  Para pausar um job:"
echo "   gcloud scheduler jobs pause low-stock-alerts --location=$LOCATION"
echo ""
echo "▶️  Para resumir um job:"
echo "   gcloud scheduler jobs resume low-stock-alerts --location=$LOCATION"
echo ""
