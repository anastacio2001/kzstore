# 🚀 GUIA COMPLETO: Migração Google Cloud → Vercel + Cloudflare R2

**Data:** 8 de dezembro de 2025
**Objetivo:** Eliminar 100% da dependência do Google Cloud
**Economia:** ~$40-70/mês (100,000-175,000 Kz/ano)

---

## 📊 ESTADO ATUAL

✅ **JÁ MIGRADO:**
- ✅ Base de Dados: Cloud SQL MySQL → Neon PostgreSQL
- ✅ ShippingZones: Tabela MySQL → Arquivo de configuração TypeScript
- ✅ 316 registros migrados (produtos, usuários, pedidos, etc.)

⚠️  **AINDA NO GOOGLE:**
- Cloud Run (hosting) - $5-15/mês
- Cloud Storage (imagens) - $1-3/mês  
- Cloud Build (CI/CD) - $2-5/mês

---

## 🎯 PLANO DE MIGRAÇÃO

### **FASE 1: Preparação (30 minutos)**
1. Criar conta Vercel
2. Criar conta Cloudflare R2
3. Exportar imagens do Cloud Storage
4. Configurar variáveis de ambiente

### **FASE 2: Migração Storage (1-2 horas)**
1. Criar bucket no Cloudflare R2
2. Migrar imagens do Cloud Storage para R2
3. Atualizar URLs no código
4. Testar uploads

### **FASE 3: Deploy Vercel (30 minutos)**
1. Conectar repositório GitHub ao Vercel
2. Configurar build settings
3. Adicionar variáveis de ambiente
4. Deploy inicial

### **FASE 4: Validação e Testes (30 minutos)**
1. Testar funcionalidades críticas
2. Verificar imagens carregando
3. Validar checkout e pagamentos
4. Monitorar logs

### **FASE 5: Desligar Google Cloud (15 minutos)**
1. Fazer backup final
2. Deletar Cloud SQL MySQL
3. Deletar Cloud Storage buckets
4. Cancelar Cloud Run

---

## 📦 FASE 1: PREPARAÇÃO

### **1.1 Criar Conta Vercel**

```bash
# 1. Ir para https://vercel.com/signup
# 2. Fazer login com GitHub
# 3. Importar repositório kzstore
```

### **1.2 Criar Conta Cloudflare R2**

```bash
# 1. Ir para https://dash.cloudflare.com/
# 2. R2 Object Storage → Create bucket
# 3. Nome: kzstore-images
# 4. Localização: Western Europe (WEUR)
```

### **1.3 Obter Credenciais R2**

```bash
# No painel Cloudflare R2:
# 1. Manage R2 API Tokens
# 2. Create API Token
# 3. Permissions: Object Read & Write
# 4. Copiar:
#    - Account ID
#    - Access Key ID  
#    - Secret Access Key
#    - Endpoint (ex: https://xxx.r2.cloudflarestorage.com)
```

---

## 🗄️ FASE 2: MIGRAÇÃO STORAGE

### **2.1 Instalar AWS CLI (para migrar imagens)**

```bash
brew install awscli
```

### **2.2 Configurar AWS CLI para R2**

```bash
# Criar perfil R2
aws configure --profile r2

# Quando solicitar:
# AWS Access Key ID: <seu R2 Access Key ID>
# AWS Secret Access Key: <seu R2 Secret Access Key>
# Default region: auto
# Default output format: json
```

### **2.3 Exportar Imagens do Cloud Storage**

```bash
# Listar buckets atuais
gsutil ls

# Sincronizar para pasta local
mkdir -p ~/kzstore-images-backup
gsutil -m rsync -r gs://kzstore-images ~/kzstore-images-backup

# Ver quantas imagens
find ~/kzstore-images-backup -type f | wc -l
```

### **2.4 Fazer Upload para Cloudflare R2**

```bash
# Endpoint do R2 (pegar no dashboard)
R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"

# Upload completo
aws s3 sync ~/kzstore-images-backup s3://kzstore-images \
  --endpoint-url=$R2_ENDPOINT \
  --profile=r2 \
  --acl public-read

# Verificar upload
aws s3 ls s3://kzstore-images --endpoint-url=$R2_ENDPOINT --profile=r2
```

### **2.5 Configurar Domínio Customizado para R2 (Opcional)**

```bash
# No Cloudflare R2:
# 1. Settings → Custom Domains
# 2. Adicionar: images.kzstore.ao
# 3. Criar CNAME record no DNS:
#    images.kzstore.ao → kzstore-images.xxx.r2.cloudflarestorage.com
```

---

## 🚀 FASE 3: DEPLOY VERCEL

### **3.1 Instalar Vercel CLI**

```bash
npm i -g vercel
vercel login
```

### **3.2 Configurar Projeto**

```bash
cd "/Users/UTENTE1/Desktop/KZSTORE Online Shop-2"

# Deploy inicial
vercel

# Quando solicitar:
# Set up and deploy? Yes
# Which scope? <sua conta>
# Link to existing project? No
# Project name? kzstore
# In which directory? ./
# Override settings? No
```

### **3.3 Configurar Build Settings no Dashboard**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 20.x
```

### **3.4 Adicionar Variáveis de Ambiente**

No dashboard Vercel (Settings → Environment Variables):

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_SQ7slkhE8HrG@ep-patient-bonus-aghbwx76-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Cloudflare R2 Storage
R2_ACCOUNT_ID=<seu account id>
R2_ACCESS_KEY_ID=<seu access key>
R2_SECRET_ACCESS_KEY=<seu secret key>
R2_BUCKET_NAME=kzstore-images
R2_PUBLIC_URL=https://images.kzstore.ao  # ou URL do R2

# APIs Externas
RESEND_API_KEY=<seu resend key>
GOOGLE_CLIENT_ID=<seu google client id>
GOOGLE_CLIENT_SECRET=<seu google secret>
TWILIO_ACCOUNT_SID=<seu twilio sid>
TWILIO_AUTH_TOKEN=<seu twilio token>
TWILIO_WHATSAPP_FROM=<seu número>

# JWT
JWT_SECRET=<seu jwt secret>
```

### **3.5 Atualizar Código para usar R2**

Criar arquivo `src/lib/r2-storage.ts`:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  file: File,
  key: string
): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

### **3.6 Deploy para Produção**

```bash
# Deploy production
vercel --prod

# Ver logs
vercel logs <deployment-url>
```

---

## ✅ FASE 4: VALIDAÇÃO

### **4.1 Testes Críticos**

```bash
# 1. Homepage carrega?
curl -I https://kzstore.vercel.app

# 2. API funciona?
curl https://kzstore.vercel.app/api/products?limit=5

# 3. Imagens carregam?
# Abrir site e verificar visualmente

# 4. Checkout funciona?
# Fazer pedido teste
```

### **4.2 Configurar Domínio Customizado**

```bash
# No Vercel Dashboard:
# 1. Settings → Domains
# 2. Add Domain: kzstore.ao
# 3. Adicionar DNS records:
#    A record: @ → 76.76.21.21
#    CNAME: www → cname.vercel-dns.com
```

### **4.3 Monitoramento**

```bash
# Ver logs em tempo real
vercel logs --follow

# Analytics no Vercel Dashboard
# Ir para Analytics → Overview
```

---

## 🗑️ FASE 5: DESLIGAR GOOGLE CLOUD

### **5.1 Backup Final**

```bash
# Backup Cloud SQL MySQL (já feito, mas confirmar)
gcloud sql export sql kzstore-01 \
  gs://kzstore-backups-202512/backup-final-$(date +%Y%m%d).sql \
  --database=kzstore_prod

# Backup Cloud Storage (já feito)
gsutil -m rsync -r gs://kzstore-images ~/kzstore-images-final-backup
```

### **5.2 Deletar Recursos**

```bash
# 1. Deletar Cloud SQL MySQL
gcloud sql instances delete kzstore-01 --quiet
# Economia: $31-68/mês

# 2. Deletar Cloud Storage bucket
gsutil rm -r gs://kzstore-images
# Economia: $1-3/mês

# 3. Deletar Cloud Run service
gcloud run services delete kzstore --region=europe-southwest1 --quiet
# Economia: $5-15/mês

# 4. Desabilitar Cloud Build (opcional)
gcloud services disable cloudbuild.googleapis.com
# Economia: $2-5/mês
```

### **5.3 Verificar Billing**

```bash
# Ver custos atuais
gcloud billing accounts list
gcloud billing projects describe kzstore-477422

# Esperar 24-48h e verificar que custos caíram para ~$0
```

---

## 📊 ECONOMIA FINAL

### **Antes (Google Cloud):**
```
Cloud SQL MySQL:  $31-68/mês
Cloud Run:        $5-15/mês
Cloud Storage:    $1-3/mês
Cloud Build:      $2-5/mês
─────────────────────────────
TOTAL:            $39-91/mês (~97,500-227,500 Kz)
```

### **Depois (Vercel + R2 + Neon):**
```
Vercel (Hobby):   $0/mês (grátis)
Cloudflare R2:    $0/mês (10GB grátis)
Neon PostgreSQL:  $19/mês
─────────────────────────────
TOTAL:            $19/mês (~47,500 Kz)
```

### **💰 ECONOMIA:**
```
Mensal:  $20-72/mês
Anual:   $240-864/ano (~600,000-2,160,000 Kz)
```

---

## 🔧 TROUBLESHOOTING

### **Problema: Build falha no Vercel**
```bash
# Ver logs detalhados
vercel logs <deployment-url>

# Verificar se todas as dependências estão no package.json
npm install
npm run build  # Testar localmente
```

### **Problema: Imagens não carregam do R2**
```bash
# Verificar CORS no R2
# Dashboard → Settings → CORS Policy:
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]
```

### **Problema: Variáveis de ambiente não funcionam**
```bash
# Verificar no Vercel Dashboard
# Settings → Environment Variables

# Re-deploy após adicionar variáveis
vercel --prod
```

---

## ✅ CHECKLIST FINAL

- [ ] Conta Vercel criada
- [ ] Conta Cloudflare R2 criada
- [ ] Imagens migradas para R2 (verificar quantidade)
- [ ] Código atualizado para usar R2
- [ ] Deploy Vercel funcionando
- [ ] Domínio customizado configurado
- [ ] Testes de funcionalidade OK
- [ ] Backup final do Google Cloud feito
- [ ] Cloud SQL deletado
- [ ] Cloud Storage deletado
- [ ] Cloud Run deletado
- [ ] Billing verificado ($0-5/mês)

---

## 🎯 PRÓXIMOS PASSOS

1. **Executar este guia passo a passo**
2. **Validar que tudo funciona no Vercel**
3. **Monitorar por 7 dias**
4. **Deletar recursos Google Cloud**
5. **Comemorar economia de $240-864/ano! 🎉**

---

**Status:** ✅ PRONTO PARA EXECUTAR
**Duração Estimada:** 2-3 horas
**Risco:** BAIXO (temos backups completos)
