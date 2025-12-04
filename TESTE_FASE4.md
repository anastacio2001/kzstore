# GUIA DE TESTES - FASE 4

## 🧪 TESTES DOS CRON JOBS EM PRODUÇÃO

### Pré-requisitos
- Deploy da Fase 4 completado ✅
- Service URL: https://kzstore-341392738431.us-central1.run.app

---

## TESTE 1: Low Stock Alerts

**Endpoint:** POST `/api/cron/low-stock-alerts`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/low-stock-alerts \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "alerts_sent": 0,
    "products_checked": 7,
    "low_stock_products": [...]
  },
  "timestamp": "2025-12-04T22:00:00.000Z"
}
```

**Validação:**
- ✅ Status 200 OK
- ✅ Campo `products_checked` > 0
- ✅ Lista de produtos retornada

---

## TESTE 2: Abandoned Carts

**Endpoint:** POST `/api/cron/abandoned-carts`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/abandoned-carts \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "carts_processed": 0,
    "emails_sent": 0,
    "abandoned_carts": []
  }
}
```

**Validação:**
- ✅ Status 200 OK
- ✅ Retorna estatísticas de carrinhos

---

## TESTE 3: Daily Metrics

**Endpoint:** POST `/api/cron/daily-metrics`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/daily-metrics \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "metrics_calculated": ["CLV", "Conversion Rate", "Revenue"],
    "date": "2025-12-04T23:59:00.000Z"
  }
}
```

**Nota:** Requer tabelas `analytics_metrics` e `abandoned_carts` (opcional)

---

## TESTE 4: Cleanup Carts

**Endpoint:** POST `/api/cron/cleanup-carts`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/cleanup-carts \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "deleted_carts": 0
  }
}
```

---

## TESTE 5: Update Featured Products

**Endpoint:** POST `/api/cron/update-featured`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/update-featured \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "featured_updated": 10,
    "top_products": [...]
  }
}
```

---

## TESTE 6: Weekly Report

**Endpoint:** POST `/api/cron/weekly-report`

**Comando:**
```bash
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/weekly-report \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "report_sent": true,
    "emails_sent": 1
  }
}
```

---

## TESTE 7: Run All (Admin)

**Endpoint:** POST `/api/cron/run-all`
**Requer autenticação Admin**

**Obter Token:**
```bash
# Fazer login como admin
curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kzstore.ao","password":"senha-admin"}'
```

**Executar todos os jobs:**
```bash
TOKEN="seu-token-aqui"

curl -X POST \
  https://kzstore-341392738431.us-central1.run.app/api/cron/run-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": [
    {
      "job": "Low Stock Alerts",
      "status": "fulfilled",
      "data": {...},
      "error": null
    },
    ...
  ]
}
```

---

## 📱 TESTE PWA

### 1. Verificar Manifest

```bash
curl https://kzstore-341392738431.us-central1.run.app/manifest.json
```

**Validação:**
- ✅ Retorna JSON válido
- ✅ Campo `name` presente
- ✅ Campo `icons` com múltiplos tamanhos

### 2. Verificar Service Worker

```bash
curl https://kzstore-341392738431.us-central1.run.app/service-worker.js
```

**Validação:**
- ✅ Retorna código JavaScript
- ✅ Contém `addEventListener('install')`
- ✅ Contém `addEventListener('fetch')`

### 3. Teste no Browser

1. Abrir: https://kzstore-341392738431.us-central1.run.app
2. Abrir DevTools (F12)
3. Ir para **Application** > **Service Workers**
4. Verificar:
   - ✅ Service Worker registrado
   - ✅ Status: Activated
   - ✅ Scope: /

5. Ir para **Application** > **Manifest**
   - ✅ Manifest carregado
   - ✅ Ícones exibidos
   - ✅ "Add to Home Screen" disponível

### 4. Lighthouse Audit

1. Abrir DevTools > **Lighthouse**
2. Selecionar categoria **PWA**
3. Executar audit
4. Verificar pontuação > 80

---

## ⚙️ CONFIGURAR CLOUD SCHEDULER

### Habilitar API

```bash
gcloud services enable cloudscheduler.googleapis.com
```

### Executar Script de Setup

```bash
chmod +x setup-cron-scheduler.sh
./setup-cron-scheduler.sh
```

### Listar Jobs Criados

```bash
gcloud scheduler jobs list --location=us-central1
```

**Resultado Esperado:**
```
NAME                 LOCATION      SCHEDULE        TARGET_TYPE
low-stock-alerts     us-central1   */30 * * * *    HTTP
abandoned-carts      us-central1   0 * * * *       HTTP
daily-metrics        us-central1   59 23 * * *     HTTP
cleanup-carts        us-central1   0 2 * * *       HTTP
update-featured      us-central1   0 0 * * 0       HTTP
weekly-report        us-central1   0 9 * * 1       HTTP
```

### Testar Job Manualmente

```bash
gcloud scheduler jobs run low-stock-alerts --location=us-central1
```

**Verificar logs:**
```bash
gcloud run services logs read kzstore \
  --region=us-central1 \
  --limit=20 \
  | grep "\[CRON\]"
```

**Logs esperados:**
```
📦 [CRON] Verificando alertas de estoque baixo...
📊 [CRON] 7 produtos com estoque baixo
```

---

## 📊 MONITORAMENTO

### Ver logs em tempo real

```bash
gcloud run services logs tail kzstore --region=us-central1
```

### Filtrar por cron jobs

```bash
gcloud run services logs read kzstore \
  --region=us-central1 \
  --limit=100 \
  | grep "\[CRON\]"
```

### Ver status dos jobs

```bash
gcloud scheduler jobs describe low-stock-alerts --location=us-central1
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Endpoints Cron
- [ ] `/api/cron/low-stock-alerts` - Retorna 200 OK
- [ ] `/api/cron/abandoned-carts` - Retorna 200 OK
- [ ] `/api/cron/daily-metrics` - Retorna 200 OK
- [ ] `/api/cron/cleanup-carts` - Retorna 200 OK
- [ ] `/api/cron/update-featured` - Retorna 200 OK
- [ ] `/api/cron/weekly-report` - Retorna 200 OK
- [ ] `/api/cron/run-all` - Retorna 200 OK (com auth)

### PWA
- [ ] Manifest.json acessível
- [ ] Service Worker registrado
- [ ] Ícones carregados
- [ ] "Add to Home Screen" funciona
- [ ] Lighthouse PWA score > 80

### Cloud Scheduler
- [ ] API habilitada
- [ ] 6 jobs criados
- [ ] Jobs aparecem na lista
- [ ] Teste manual funciona
- [ ] Logs aparecem no Cloud Run

### Emails
- [ ] Low Stock Alert enviado
- [ ] Abandoned Cart email enviado
- [ ] Weekly Report enviado

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot POST /api/cron/..."

**Causa:** Deploy não contém novos endpoints

**Solução:**
```bash
gcloud run deploy kzstore --source . --region us-central1 \
  --allow-unauthenticated --env-vars-file .env.yaml
```

### Erro: "Table analytics_metrics does not exist"

**Causa:** Tabelas opcionais da Fase 3 não criadas

**Solução:**
- Normal, não afeta outros cron jobs
- Ou criar tabelas: Ver PHASE3_COMPLETE.md

### Service Worker não registra

**Causa:** CORS ou path incorreto

**Solução:**
1. Verificar console do browser (F12)
2. Verificar que `/service-worker.js` é acessível
3. Limpar cache do browser (Ctrl+Shift+R)

### Cloud Scheduler retorna 404

**Causa:** Job criado antes do deploy

**Solução:**
1. Aguardar deploy completar
2. Testar manualmente:
   ```bash
   curl -X POST https://kzstore-341392738431.us-central1.run.app/api/cron/low-stock-alerts
   ```
3. Re-executar job no scheduler

---

## 📝 SCRIPT DE TESTE COMPLETO

```bash
#!/bin/bash

URL="https://kzstore-341392738431.us-central1.run.app"

echo "🧪 Testando todos os cron jobs..."
echo ""

echo "1️⃣  Low Stock Alerts..."
curl -s -X POST $URL/api/cron/low-stock-alerts | jq '.success'

echo "2️⃣  Abandoned Carts..."
curl -s -X POST $URL/api/cron/abandoned-carts | jq '.success'

echo "3️⃣  Daily Metrics..."
curl -s -X POST $URL/api/cron/daily-metrics | jq '.success'

echo "4️⃣  Cleanup Carts..."
curl -s -X POST $URL/api/cron/cleanup-carts | jq '.success'

echo "5️⃣  Update Featured..."
curl -s -X POST $URL/api/cron/update-featured | jq '.success'

echo "6️⃣  Weekly Report..."
curl -s -X POST $URL/api/cron/weekly-report | jq '.success'

echo ""
echo "✅ Todos os testes concluídos!"
```

**Salvar como:** `test-all-crons.sh`

**Executar:**
```bash
chmod +x test-all-crons.sh
./test-all-crons.sh
```

---

**Desenvolvido pela equipe KZSTORE**
**Tech & Electronics | Angola**
