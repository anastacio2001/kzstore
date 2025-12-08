# 🚀 Migração Backend: Cloud Run → Render.com

**Data:** 8 de dezembro de 2025
**Objetivo:** Eliminar custos do Cloud Run ($5-15/mês → GRÁTIS)

---

## 📊 CONFIGURAÇÃO ATUAL

✅ **Concluído:**
- Frontend: Vercel (GRÁTIS) ✅
- Storage: Cloudflare R2 (GRÁTIS) ✅
- Database: Neon PostgreSQL ($19/mês) ✅

⏳ **Em migração:**
- Backend: Cloud Run ($5-15/mês) → **Render.com (GRÁTIS)**

---

## 🎯 PASSO A PASSO

### **1. Criar Conta no Render** (2 minutos)

1. Acesse: https://render.com/
2. Clique em **"Get Started for Free"**
3. Faça login com **GitHub** (recomendado)
4. Autorize o Render a acessar seus repositórios

---

### **2. Criar Web Service** (5 minutos)

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório: **anastacio2001/kzstore**
4. Configure:

```
Name: kzstore-backend
Region: Frankfurt (Europe)
Branch: main
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm start
Plan: Free
```

---

### **3. Configurar Variáveis de Ambiente** (5 minutos)

No painel de **Environment Variables**, adicione:

#### **Database**
```bash
DATABASE_URL=<seu_database_url_do_neon>
# Copie da variável DATABASE_URL do arquivo .env
```

#### **Authentication**
```bash
JWT_SECRET=<seu_jwt_secret>
# Copie da variável JWT_SECRET do arquivo .env
JWT_EXPIRES_IN=7d
```

#### **Cloudflare R2 Storage**
```bash
R2_ACCOUNT_ID=<seu_r2_account_id>
R2_ACCESS_KEY_ID=<seu_r2_access_key_id>
R2_SECRET_ACCESS_KEY=<seu_r2_secret_access_key>
R2_BUCKET_NAME=kzstore-images
R2_ENDPOINT=<seu_r2_endpoint>
R2_PUBLIC_URL=<seu_r2_public_url>
# Copie as variáveis R2_* do arquivo .env
```

#### **Email (Resend)**
```bash
RESEND_API_KEY=<seu_resend_api_key>
# Copie da variável RESEND_API_KEY do arquivo .env
RESEND_FROM_EMAIL=noreply@kzstore.ao
RESEND_FROM_NAME=KZSTORE Angola
```

#### **OAuth (Google & Facebook)**
```bash
GOOGLE_CLIENT_ID=<seu_google_client_id>
GOOGLE_CLIENT_SECRET=<seu_google_client_secret>
FACEBOOK_APP_ID=<seu_facebook_app_id>
FACEBOOK_APP_SECRET=<seu_facebook_app_secret>
# Copie as variáveis GOOGLE_* e FACEBOOK_* do arquivo .env
```

#### **WhatsApp (Twilio)**
```bash
TWILIO_ACCOUNT_SID=<seu_twilio_account_sid>
TWILIO_AUTH_TOKEN=<seu_twilio_auth_token>
TWILIO_WHATSAPP_FROM=<seu_numero_whatsapp>
# Copie as variáveis TWILIO_* do arquivo .env
```

#### **AI Chatbot (Gemini)**
```bash
VITE_GEMINI_API_KEY=<seu_gemini_api_key>
# Copie da variável VITE_GEMINI_API_KEY do arquivo .env
```

#### **Admin**
```bash
ADMIN_EMAIL=admin@kzstore.ao
NODE_ENV=production
```

---

### **4. Fazer Deploy** (automático)

1. Clique em **"Create Web Service"**
2. O Render vai automaticamente:
   - Clonar o repositório
   - Instalar dependências
   - Executar `npx prisma generate`
   - Iniciar o servidor com `npm start`
3. Aguarde 2-3 minutos para o build completar

---

### **5. Obter URL da API**

Após o deploy, você receberá uma URL como:
```
https://kzstore-backend.onrender.com
```

Copie esta URL, vamos usá-la no próximo passo.

---

### **6. Atualizar Frontend (Vercel)**

Vá para o dashboard do Vercel e adicione a variável:

```bash
VITE_API_URL=https://kzstore-backend.onrender.com
```

Depois, faça um novo deploy do frontend:
```bash
vercel --prod
```

---

### **7. Testar API**

```bash
# Testar health check
curl https://kzstore-backend.onrender.com/health

# Testar produtos
curl https://kzstore-backend.onrender.com/api/products?limit=5

# Testar categorias
curl https://kzstore-backend.onrender.com/api/categories
```

---

## ⚠️ IMPORTANTE: Plano Gratuito

O plano gratuito do Render tem algumas limitações:

### **Sleep Mode**
- Após **15 minutos de inatividade**, o serviço entra em "sleep"
- Primeira requisição após sleep demora **~30 segundos** para acordar
- Requisições seguintes são normais

### **Soluções:**

**Opção 1: Manter Grátis**
- Aceitar o delay de 30s na primeira visita após inatividade
- Maioria dos usuários não notará (cache do navegador)

**Opção 2: Upgrade para Starter ($7/mês)**
- Sem sleep mode
- Sempre ativo e rápido
- 512MB RAM
- **Ainda economiza $3-13/mês vs Cloud Run**

**Opção 3: Ping Automático (Hack Grátis)**
- Usar cron job externo para fazer ping a cada 14 minutos
- Serviços como cron-job.org (grátis)
- Mantém o serviço sempre acordado

---

## 📊 ECONOMIA FINAL

### **Antes:**
```
Cloud Run:     $5-15/mês
Cloud SQL:     $31-68/mês
Cloud Storage: $1-3/mês
Cloud Build:   $2-5/mês
─────────────────────────
TOTAL:         $39-91/mês
```

### **Depois (Render Grátis):**
```
Vercel:        $0/mês
Render:        $0/mês (grátis)
Cloudflare R2: $0/mês (grátis)
Neon DB:       $19/mês
─────────────────────────
TOTAL:         $19/mês
```

### **💰 ECONOMIA: $20-72/mês (~50,000-180,000 Kz/ano)**

### **Depois (Render Starter $7/mês):**
```
Vercel:        $0/mês
Render:        $7/mês (sem sleep)
Cloudflare R2: $0/mês (grátis)
Neon DB:       $19/mês
─────────────────────────
TOTAL:         $26/mês
```

### **💰 ECONOMIA: $13-65/mês (~32,500-162,500 Kz/ano)**

---

## 🔧 TROUBLESHOOTING

### **Problema: Build falha**
```bash
# Verificar logs no dashboard do Render
# Causa comum: falta de dependências no package.json
```

### **Problema: Prisma não conecta ao Neon**
```bash
# Verificar se DATABASE_URL está correta nas env vars
# Formato: postgresql://user:password@host/database?sslmode=require
```

### **Problema: Upload de imagens falha**
```bash
# Verificar credenciais R2 nas env vars
# Testar conexão R2 localmente primeiro
```

### **Problema: CORS errors no frontend**
```bash
# Adicionar domínio do Vercel no CORS do server.ts
# Linha ~52: origin: ['https://kzstore.vercel.app', ...]
```

---

## ✅ CHECKLIST FINAL

- [ ] Conta Render criada
- [ ] Repositório GitHub conectado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Health check retorna 200
- [ ] API de produtos retorna dados
- [ ] Frontend Vercel atualizado com nova API_URL
- [ ] Site funcionando end-to-end
- [ ] Cloud Run desligado (após validação)

---

## 🎯 PRÓXIMOS PASSOS

1. **Testar por 24-48 horas** no Render gratuito
2. **Decidir se precisa do plano $7/mês** (sem sleep)
3. **Configurar ping automático** se ficar no gratuito
4. **Desligar Cloud Run** após confirmação
5. **Economizar $20-72/mês!** 🎉

---

**Status:** ✅ Pronto para deploy
**Tempo Estimado:** 15-20 minutos
**Risco:** BAIXO (fácil reverter se necessário)
