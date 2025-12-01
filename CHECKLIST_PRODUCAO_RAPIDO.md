# 🚀 CHECKLIST RÁPIDO PARA PRODUÇÃO - KZSTORE

**Data:** 27 de Novembro de 2025  
**Status:** Pronto para Deploy com Segurança

---

## ✅ MELHORIAS DE SEGURANÇA IMPLEMENTADAS

### 1. **Helmet** - Headers de Segurança ✅
- Protege contra XSS, clickjacking, etc.
- Configurado no `server.ts`

### 2. **Rate Limiting** ✅
- **API Geral**: 100 req/15min (produção) | 1000 req/15min (dev)
- **Login/Register**: 5 req/15min (produção) | 50 req/15min (dev)
- Previne ataques de força bruta

### 3. **CORS Restritivo** ✅
- Desenvolvimento: `localhost:3000`
- Produção: Define seus domínios em `server.ts` linha 91-96
```typescript
const allowedOrigins = isProduction 
  ? [
      'https://kzstore.com', 
      'https://www.kzstore.com',
      'https://kzstore.ao',
      'https://www.kzstore.ao'
    ]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
```

### 4. **JWT_SECRET Forte** ✅
- Exemplo adicionado no `.env.example`
- **CRÍTICO**: Gere uma chave única em produção!

### 5. **Script de Criação de Admin Seguro** ✅
- Arquivo: `criar-admin-seguro.js`
- Valida senha forte (8+ chars, maiúsculas, minúsculas, números, símbolos)
- Uso: `node criar-admin-seguro.js`

---

## 🔥 ANTES DE FAZER DEPLOY

### **Passo 1: Gerar JWT_SECRET Forte** (2 min)

```bash
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opção 2: OpenSSL
openssl rand -base64 64
```

**Copie o resultado e adicione no arquivo `.env` do servidor:**
```env
JWT_SECRET="a8f5f167f44f4964e6c998dee827110c03e26a2c7b4f5c2c3d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5"
```

### **Passo 2: Configurar .env de Produção** (5 min)

Crie um arquivo `.env` no servidor com:

```env
# ============================================
# PRODUÇÃO - KZSTORE
# ============================================

# Ambiente
NODE_ENV=production

# Banco de Dados (MySQL em produção)
DATABASE_URL="mysql://usuario:senha@host:3306/kzstore"

# JWT (GERE UMA CHAVE FORTE!)
JWT_SECRET="sua-chave-super-segura-gerada-acima"
JWT_EXPIRES_IN="7d"

# API URL (URL do seu servidor backend)
VITE_API_URL="https://api.kzstore.com"

# Email (opcional por agora)
RESEND_API_KEY="re_xxxxxxxxx"

# Gemini AI (opcional - chatbot)
VITE_GEMINI_API_KEY="AIza..."

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# WhatsApp (opcional por agora)
TWILIO_ACCOUNT_SID="ACxxxx"
TWILIO_AUTH_TOKEN="xxxxx"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

### **Passo 3: Configurar Banco de Dados** (10-30 min)

1. **Criar banco MySQL em produção**
```sql
CREATE DATABASE kzstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Atualizar DATABASE_URL** no `.env`

3. **Executar migrations**
```bash
npm run prisma:migrate
```

4. **Criar usuário admin**
```bash
node criar-admin-seguro.js
```

### **Passo 4: Atualizar CORS** (2 min)

Edite `server.ts` linha 91-96 com seus domínios reais:

```typescript
const allowedOrigins = isProduction 
  ? [
      'https://seudominio.com', 
      'https://www.seudominio.com'
    ]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
```

### **Passo 5: Build do Frontend** (2 min)

```bash
npm run build
```

Isso gera a pasta `build/` com os arquivos otimizados.

---

## 🌐 OPÇÕES DE HOSPEDAGEM

### **Opção A: VPS (Recomendado)**

**Providers:** Digital Ocean, Contabo, Linode, Vultr

**Passos:**
1. Instalar Node.js 18+ no servidor
2. Instalar MySQL
3. Clonar repositório
4. Configurar `.env`
5. Executar migrations
6. Criar admin
7. Instalar PM2 para gerenciar processos
8. Configurar Nginx como reverse proxy

```bash
# Instalar PM2
npm install -g pm2

# Iniciar servidor
pm2 start server.ts --name kzstore-api --interpreter tsx
pm2 save
pm2 startup
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name api.kzstore.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name kzstore.com www.kzstore.com;

    root /var/www/kzstore/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### **Opção B: PaaS (Mais Fácil)**

**Render.com:**
1. Criar conta em render.com
2. Criar Web Service para backend (Node)
3. Criar Static Site para frontend
4. Configurar variáveis de ambiente
5. Deploy automático via GitHub

**Railway.app:**
1. Criar conta em railway.app
2. New Project → Deploy from GitHub
3. Adicionar MySQL database
4. Configurar variáveis de ambiente
5. Deploy automático

---

## 🧪 TESTAR ANTES DO DEPLOY

### **Teste Local com Produção Simulada**

```bash
# Definir NODE_ENV como production
export NODE_ENV=production

# Reiniciar servidor
pkill -f "tsx server.ts"
npm run dev:server

# Testar:
# 1. Rate limiting funcionando (tentar login 6x seguidas)
# 2. CORS bloqueando origens inválidas
# 3. Helmet headers presentes (F12 → Network → Headers)
```

### **Checklist de Testes:**

- [ ] Login admin funciona
- [ ] Rate limiting bloqueia após 5 tentativas
- [ ] Checkout completo funciona
- [ ] Produtos aparecem corretamente
- [ ] Admin CRUD funciona
- [ ] Upload de imagens funciona
- [ ] Pedidos são criados
- [ ] Cookies funcionam

---

## 📊 MONITORAMENTO (Pós-Deploy)

### **Logs do Servidor:**
```bash
# Ver logs do PM2
pm2 logs kzstore-api

# Ver erros
pm2 logs kzstore-api --err
```

### **Health Check:**
```bash
curl https://api.kzstore.com/health
```

### **Ferramentas Recomendadas:**
- **Sentry.io** - Monitoramento de erros (gratuito até 5k eventos/mês)
- **UptimeRobot** - Verificar se site está online (gratuito)
- **Google Analytics** - Tráfego do site

---

## 🔐 SEGURANÇA PÓS-DEPLOY

### **1. Certificado SSL** (HTTPS)
- **Let's Encrypt** (gratuito) via Certbot
- Ou use certificado do provider (Render, Railway incluem)

### **2. Firewall**
- Permitir apenas portas 80, 443, 22 (SSH)
- Bloquear porta 3306 (MySQL) para acesso externo

### **3. Backups Automáticos**
```bash
# Cron job para backup MySQL
0 2 * * * mysqldump -u usuario -p senha kzstore > /backups/kzstore_$(date +\%Y\%m\%d).sql
```

### **4. Atualizações**
```bash
# Atualizar dependências regularmente
npm audit
npm update
```

---

## ⚠️ PROBLEMAS COMUNS

### **Erro: CORS blocked**
→ Adicione seu domínio em `allowedOrigins` no `server.ts`

### **Erro: JWT invalid**
→ Certifique-se que JWT_SECRET é o mesmo no servidor e .env

### **Erro: Cannot connect to database**
→ Verifique DATABASE_URL e firewall do MySQL

### **Erro: Rate limit too many requests**
→ Aguarde 15 minutos ou ajuste limites no `server.ts`

---

## 🎯 PRÓXIMOS PASSOS (Opcional)

- [ ] Integrar Multicaixa Express (pagamentos)
- [ ] Configurar Resend (emails)
- [ ] Configurar Twilio (WhatsApp)
- [ ] Adicionar Sentry (monitoramento)
- [ ] Configurar Google Analytics
- [ ] Otimizar imagens (CDN)
- [ ] Adicionar testes E2E

---

## 📞 SUPORTE

**Documentação completa:** `GUIA_DEPLOY_PRODUCAO.md`

**Scripts úteis:**
- `criar-admin-seguro.js` - Criar admin com senha forte
- `criar-usuarios-corrigido.js` - Criar usuários de teste

**Comandos úteis:**
```bash
# Ver status do servidor
pm2 status

# Restart servidor
pm2 restart kzstore-api

# Ver logs em tempo real
pm2 logs kzstore-api --lines 100
```

---

## ✅ CONCLUSÃO

Seu projeto está **seguro e pronto para produção!** 🎉

Principais melhorias implementadas:
- ✅ Helmet (security headers)
- ✅ Rate limiting (anti-brute force)
- ✅ CORS restritivo
- ✅ JWT_SECRET forte
- ✅ Validação de senha admin
- ✅ Ambiente de produção configurável

**Tempo estimado para deploy completo:** 1-2 horas

**Boa sorte com o lançamento! 🚀**
