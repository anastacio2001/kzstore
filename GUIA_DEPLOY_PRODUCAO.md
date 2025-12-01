# 🚀 Guia Completo de Deploy - KZSTORE

## 📋 **CHECKLIST PRÉ-DEPLOY**

Antes de fazer o deploy em produção, é essencial completar todos os itens abaixo.

---

## ✅ **1. SEGURANÇA**

### **1.1 Variáveis de Ambiente**
- [ ] **Criar `.env.production`** com credenciais de produção
- [ ] **Alterar JWT_SECRET** para chave forte e única
- [ ] **Configurar DATABASE_URL** com credenciais do servidor de produção
- [ ] **Adicionar VITE_GEMINI_API_KEY** (Gemini AI)
- [ ] **Nunca commitar** arquivos `.env` no Git

```env
# .env.production (EXEMPLO)
NODE_ENV=production
DATABASE_URL="mysql://usuario:senha@servidor.com:3306/kzstore"
JWT_SECRET="sua-chave-super-segura-minimo-32-caracteres-aleatorios"
JWT_EXPIRES_IN="7d"
VITE_GEMINI_API_KEY="AIzaSyB..."
VITE_API_URL="https://api.kzstore.com"
```

### **1.2 Senhas e Autenticação**
- [ ] **Validação de senha forte** no frontend e backend
- [ ] **Rate limiting** nas rotas de autenticação (prevenir brute force)
- [ ] **HTTPS obrigatório** (certificado SSL/TLS)
- [ ] **CORS configurado** apenas para domínios autorizados
- [ ] **Criar usuário admin** no banco de dados

```sql
-- Criar usuário admin
INSERT INTO customer_profiles (id, email, nome, telefone, password, role, is_admin, is_active)
VALUES (
  UUID(),
  'admin@kzstore.com',
  'Administrador KZSTORE',
  '931054015',
  '$2a$10$HASH_GERADO_COM_BCRYPT',
  'admin',
  1,
  1
);
```

### **1.3 Backend - Express Security**
- [ ] **Instalar helmet** para headers de segurança
- [ ] **Instalar express-rate-limit** para limitar requisições
- [ ] **Validar inputs** em todas as rotas (sanitização)
- [ ] **Configurar CORS** restritivo

```bash
npm install helmet express-rate-limit express-validator
```

```typescript
// server.ts - Adicionar
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});

app.use('/api/', limiter);
```

### **1.4 Banco de Dados**
- [ ] **Backup automático** configurado
- [ ] **Usuário MySQL** com permissões mínimas necessárias
- [ ] **Firewall** permitindo apenas IPs autorizados
- [ ] **Índices** criados em campos frequentemente consultados

```sql
-- Criar índices importantes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_user_email ON orders(user_email);
CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_customer_email ON customer_profiles(email);
```

---

## 🌐 **2. INFRAESTRUTURA E HOSPEDAGEM**

### **2.1 Opções de Hospedagem (Recomendadas para Angola)**

#### **Opção A: VPS (Mais Controle)**
✅ **Recomendado:** Digital Ocean, Linode, Vultr, Contabo

**Vantagens:**
- Controle total
- Mais barato a longo prazo
- Escalável

**Especificações mínimas:**
- 2 vCPUs
- 2GB RAM
- 50GB SSD
- Ubuntu 22.04 LTS

**Custo:** ~$12-15/mês

#### **Opção B: PaaS (Mais Fácil)**
✅ **Recomendado:** Railway, Render, Fly.io

**Vantagens:**
- Deploy automático
- SSL gratuito
- Fácil escalonamento

**Custo:** ~$20-30/mês

#### **Opção C: Hospedagem Local Angola**
- Angola Cables
- Infralink
- Angola Telecom

### **2.2 Configuração do Servidor (VPS)**

```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 4. Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# 5. Instalar Nginx (proxy reverso)
sudo apt install nginx -y

# 6. Instalar Certbot (SSL gratuito)
sudo apt install certbot python3-certbot-nginx -y
```

---

## 🗄️ **3. BANCO DE DADOS**

### **3.1 Migração de Dados**
- [ ] **Exportar dados** do ambiente de desenvolvimento
- [ ] **Criar banco** no servidor de produção
- [ ] **Executar migrations** do Prisma
- [ ] **Importar dados** (se necessário)

```bash
# Exportar dados (desenvolvimento)
mysqldump -u root kzstore > kzstore_backup.sql

# No servidor de produção
mysql -u usuario -p kzstore_prod < kzstore_backup.sql

# Executar migrations
npx prisma migrate deploy
```

### **3.2 Configuração MySQL Produção**

```sql
-- Criar banco de dados
CREATE DATABASE kzstore_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário específico
CREATE USER 'kzstore_user'@'localhost' IDENTIFIED BY 'senha_super_segura';

-- Dar permissões apenas necessárias
GRANT SELECT, INSERT, UPDATE, DELETE ON kzstore_prod.* TO 'kzstore_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📦 **4. BUILD E DEPLOY**

### **4.1 Preparar Aplicação**

```bash
# 1. Instalar dependências de produção
npm ci --production

# 2. Build do frontend
npm run build

# 3. Gerar Prisma Client
npx prisma generate
```

### **4.2 Configurar PM2**

```bash
# Criar arquivo ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'kzstore-backend',
      script: './dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true
    }
  ]
};
```

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
```

### **4.3 Configurar Nginx**

```nginx
# /etc/nginx/sites-available/kzstore
server {
    listen 80;
    server_name kzstore.com www.kzstore.com;

    # Frontend (arquivos estáticos)
    location / {
        root /var/www/kzstore/dist;
        try_files $uri $uri/ /index.html;

        # Cache de assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/kzstore/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/kzstore /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### **4.4 Configurar SSL (HTTPS)**

```bash
# Obter certificado SSL gratuito
sudo certbot --nginx -d kzstore.com -d www.kzstore.com

# Renovação automática
sudo certbot renew --dry-run
```

---

## 🔧 **5. OTIMIZAÇÕES**

### **5.1 Frontend**
- [ ] **Code splitting** implementado
- [ ] **Lazy loading** de componentes
- [ ] **Otimização de imagens** (WebP, compressão)
- [ ] **Minificação** de CSS e JS
- [ ] **Service Worker** para cache (opcional)

```bash
# Otimizar imagens
npm install sharp
```

### **5.2 Backend**
- [ ] **Compressão gzip** habilitada
- [ ] **Cache de queries** frequentes
- [ ] **Connection pooling** do Prisma
- [ ] **Logs estruturados** (Winston, Pino)

```typescript
// Compressão
import compression from 'compression';
app.use(compression());
```

### **5.3 Banco de Dados**
- [ ] **Query optimization** (EXPLAIN)
- [ ] **Índices** em campos de busca
- [ ] **Limpeza** de dados antigos (logs, sessões)

---

## 📊 **6. MONITORAMENTO**

### **6.1 Ferramentas Essenciais**
- [ ] **PM2 Monitoring** (grátis)
- [ ] **UptimeRobot** (verificar uptime)
- [ ] **Google Analytics** (tráfego)
- [ ] **Sentry** (erros) (opcional)

```bash
# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **6.2 Logs**
- [ ] **Rotação de logs** configurada
- [ ] **Alertas** para erros críticos
- [ ] **Backup** de logs importantes

---

## 💳 **7. PAGAMENTOS E INTEGRAÇÕES**

### **7.1 Gateway de Pagamento Angola**
- [ ] **Multicaixa Express** integrado
- [ ] **Referência de pagamento** automática
- [ ] **Webhooks** configurados
- [ ] **Testes em sandbox**

### **7.2 Outros Serviços**
- [ ] **Email** (SendGrid, Mailgun) - confirmações e notificações
- [ ] **SMS** (Twilio) - notificações de pedido (opcional)
- [ ] **WhatsApp Business API** (opcional)

---

## 📱 **8. SEO E PERFORMANCE**

### **8.1 SEO Básico**
- [ ] **Meta tags** configuradas
- [ ] **Sitemap.xml** gerado
- [ ] **Robots.txt** configurado
- [ ] **Google Search Console** configurado
- [ ] **Schema.org** para produtos

### **8.2 Performance**
- [ ] **Lighthouse score** > 90
- [ ] **Core Web Vitals** otimizados
- [ ] **CDN** para assets estáticos (Cloudflare grátis)
- [ ] **Lazy loading** de imagens

---

## 🧪 **9. TESTES PRÉ-LANÇAMENTO**

### **9.1 Checklist de Testes**
- [ ] **Fluxo de compra completo** (carrinho → checkout → pagamento)
- [ ] **Autenticação** (login, logout, registro)
- [ ] **Painel admin** (adicionar/editar produtos)
- [ ] **Responsividade** (mobile, tablet, desktop)
- [ ] **Cross-browser** (Chrome, Safari, Firefox)
- [ ] **Velocidade** (< 3s tempo de carregamento)
- [ ] **Formulários** (validação, envio)
- [ ] **Chatbot IA** funcionando

### **9.2 Testes de Carga**
```bash
# Instalar Artillery
npm install -g artillery

# Teste básico
artillery quick --count 10 --num 100 https://kzstore.com
```

---

## 📋 **10. PÓS-DEPLOY**

### **10.1 Primeira Semana**
- [ ] **Monitorar logs** diariamente
- [ ] **Verificar uptime** (99%+)
- [ ] **Testar backups** (restauração)
- [ ] **Coletar feedback** de usuários
- [ ] **Corrigir bugs** críticos

### **10.2 Manutenção Contínua**
- [ ] **Backup semanal** do banco de dados
- [ ] **Atualizar dependências** mensalmente
- [ ] **Revisar logs de erro** semanalmente
- [ ] **Monitorar performance** (Google Analytics)
- [ ] **Atualizar produtos** regularmente

---

## 🚨 **11. ITENS CRÍTICOS (OBRIGATÓRIOS)**

### **❗ Antes de fazer deploy, VOCÊ DEVE TER:**

1. ✅ **Domínio registrado** (kzstore.com)
2. ✅ **Servidor/Hospedagem** contratado
3. ✅ **Banco de dados MySQL** em produção
4. ✅ **SSL/HTTPS** configurado
5. ✅ **Backups automáticos** configurados
6. ✅ **Email** configurado para notificações
7. ✅ **Gateway de pagamento** testado
8. ✅ **Termos de serviço** e política de privacidade
9. ✅ **Informações legais** (CNPJ/NIF, contato)
10. ✅ **Sistema de backup** funcionando

---

## 📝 **12. DOCUMENTOS NECESSÁRIOS**

- [ ] **Política de Privacidade** ✅ (já implementada)
- [ ] **Termos de Serviço** ✅ (já implementados)
- [ ] **Política de Devolução** ✅ (já implementada)
- [ ] **Política de Cookies** ✅ (já implementada)
- [ ] **FAQ completo** ✅ (já implementado)
- [ ] **Manual do admin** (criar)
- [ ] **Runbook** para incidentes (criar)

---

## 🔐 **13. SEGURANÇA ADICIONAL (RECOMENDADO)**

- [ ] **WAF** (Web Application Firewall) - Cloudflare grátis
- [ ] **DDoS Protection** - Cloudflare grátis
- [ ] **2FA** para painel admin
- [ ] **Logs de auditoria** (quem fez o quê, quando)
- [ ] **Validação de email** no registro
- [ ] **Captcha** em formulários públicos

---

## 💰 **14. CUSTOS ESTIMADOS (MENSAL)**

### **Básico (Startup):**
- VPS (2GB RAM): $12-15
- Domínio: $1-2
- SSL: Grátis (Let's Encrypt)
- Backups: $3-5
- Email (SendGrid): Grátis (100 emails/dia)
- **TOTAL: ~$16-22/mês**

### **Intermediário:**
- VPS (4GB RAM): $24
- Domínio + Email profissional: $5
- CDN (Cloudflare Pro): $20
- Backups: $10
- Monitoramento: $10
- **TOTAL: ~$69/mês**

### **Avançado:**
- VPS Cluster (3 servidores): $60
- Banco de dados gerenciado: $25
- CDN + WAF: $50
- Email profissional: $15
- Monitoramento avançado: $30
- **TOTAL: ~$180/mês**

---

## 🎯 **15. CRONOGRAMA SUGERIDO**

### **Semana 1: Preparação**
- Contratar hospedagem
- Registrar domínio
- Configurar ambiente de produção

### **Semana 2: Deploy**
- Fazer deploy do backend
- Fazer deploy do frontend
- Configurar SSL
- Testes completos

### **Semana 3: Otimização**
- Configurar CDN
- Otimizar performance
- SEO básico

### **Semana 4: Lançamento**
- Testes finais
- Lançamento suave (beta)
- Coletar feedback
- Ajustes finais

---

## 📞 **SUPORTE E AJUDA**

Se precisar de ajuda durante o deploy:

1. **Documentação técnica:**
   - Prisma: https://www.prisma.io/docs
   - Vite: https://vitejs.dev/guide
   - Nginx: https://nginx.org/en/docs

2. **Comunidades:**
   - Stack Overflow
   - Discord de desenvolvedores Angola

3. **Profissionais:**
   - DevOps freelancer
   - Empresas de hosting Angola

---

**Data de criação:** 27 de Novembro de 2024
**Status:** Pronto para deploy após completar checklist
**Estimativa de tempo:** 2-4 semanas (primeira vez)

✅ **BOA SORTE NO DEPLOY!** 🚀
