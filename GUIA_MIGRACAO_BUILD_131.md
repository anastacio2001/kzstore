# 🚀 GUIA RÁPIDO: Aplicar Migração Build 131

## Opção 1: Via Cloud Shell (RECOMENDADO)

```bash
# 1. Conectar ao Cloud SQL
gcloud sql connect kzstore-01 --user=root --quiet

# 2. Quando pedir password, digite: Kzstore2025!

# 3. Selecionar database
USE kzstore_prod;

# 4. Copiar e colar TODO o conteúdo de migration_build_131_safe.sql
# (ou usar source se fizer upload do arquivo)
```

## Opção 2: Upload do arquivo e executar

```bash
# 1. No Cloud Shell, criar arquivo
cat > migration.sql << 'EOF'
# (colar conteúdo do migration_build_131_safe.sql)
EOF

# 2. Conectar e executar
gcloud sql connect kzstore-01 --user=root --quiet < migration.sql
```

## Opção 3: Via Console Web (Cloud SQL)

1. Acesse: https://console.cloud.google.com/sql/instances/kzstore-01/query?project=kzstore-477422
2. Cole o conteúdo de `migration_build_131_safe.sql`
3. Clique em "Run"

---

## ✅ Verificar se funcionou

```sql
-- Ver tabelas criadas
SHOW TABLES LIKE '%Shipping%';
SHOW TABLES LIKE '%Newsletter%';
SHOW TABLES LIKE '%Cart%';

-- Ver zonas de envio
SELECT * FROM ShippingZone;

-- Deve mostrar 18 províncias de Angola
```

---

## 🔧 Resolver conexão local (macOS)

O erro `ETIMEDOUT` acontece porque seu IP não está na whitelist do Cloud SQL.

**Solução permanente:**

```bash
# 1. Instalar Cloud SQL Proxy
brew install cloud-sql-proxy

# 2. Iniciar proxy em terminal separado
cloud-sql-proxy kzstore-477422:europe-west1:kzstore-01 \
  --port 3307

# 3. Em outro terminal, conectar via localhost
mysql -h 127.0.0.1 -P 3307 -u kzstore_app -p'Kzstore2024!' kzstore_prod

# 4. Executar migração
mysql -h 127.0.0.1 -P 3307 -u kzstore_app -p'Kzstore2024!' kzstore_prod < migration_build_131_safe.sql
```

**Alternativa rápida (temporário 5min):**

```bash
# Google Cloud libera seu IP por 5 minutos automaticamente ao usar gcloud sql connect
# Aproveite essa janela para rodar o script TypeScript:

# Terminal 1: Manter conexão aberta
gcloud sql connect kzstore-01 --user=root --quiet

# Terminal 2: Rodar script (enquanto terminal 1 está conectado)
npx tsx apply-migration-131.ts
```

---

## 📊 Tabelas criadas no Build 131

1. **ShippingZone** - 18 províncias Angola com custos
2. **NewsletterSubscriber** - Assinantes newsletter
3. **EmailCampaign** - Campanhas de email marketing
4. **Cart** - Carrinho na nuvem (sync multi-device)
5. **PushSubscription** - Assinaturas push notifications
6. **WebhookEvent** - Log eventos ERP/webhooks

**Colunas adicionadas:**
- `Product.requires_special_shipping`
- `Product.shipping_class`

---

## 🎯 Próximos passos após migração

```bash
# 1. Testar API de shipping
curl https://kzstore-00126-jst.europe-west1.run.app/api/shipping-zones

# 2. Testar cálculo de frete
curl "https://kzstore-00126-jst.europe-west1.run.app/api/shipping-zones/calculate?province=Luanda"

# 3. Verificar tracking público
curl "https://kzstore-00126-jst.europe-west1.run.app/api/orders/track?order_number=KZ12345&email=test@test.com"
```
