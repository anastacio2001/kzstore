# 🚀 Guia de Deploy - KZSTORE

## 📋 Pré-requisitos

Antes de fazer deploy, certifique-se de ter:

- [x] Conta Supabase configurada
- [x] Google Gemini API Key ([Obter aqui](https://makersuite.google.com/app/apikey))
- [ ] Domínio registrado (kzstore.ao)
- [ ] Google Analytics ID (opcional)
- [ ] Conta de email transacional (Resend/SendGrid - opcional)

---

## 🔐 Configuração de Variáveis de Ambiente

### 1. Supabase (Já Configurado ✅)

As seguintes variáveis já estão configuradas:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### 2. Google Gemini AI (OBRIGATÓRIO ⚠️)

O chatbot com IA requer a chave do Google Gemini:

1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Configure no Supabase:
   - Dashboard → Settings → Secrets
   - Adicione: `GEMINI_API_KEY=sua-chave-aqui`

**Ou use o modal automático que já foi aberto para você! ✅**

### 3. Google Analytics (Recomendado)

Para rastrear visitantes e conversões:

1. Crie uma propriedade em https://analytics.google.com/
2. Copie o ID (formato: G-XXXXXXXXXX)
3. Adicione ao código ou localStorage

**Integração Automática:**
```javascript
// No console do navegador ou Admin Panel:
localStorage.setItem('kzstore_ga_id', 'G-XXXXXXXXXX');
```

---

## 🌐 Deploy em Produção

### Opção 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variáveis de ambiente no dashboard:
# https://vercel.com/dashboard → Settings → Environment Variables
```

### Opção 2: Netlify

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Fazer login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Configurar variáveis de ambiente:
# Site settings → Build & deploy → Environment
```

### Opção 3: Deploy Manual

1. Build do projeto:
```bash
npm run build
```

2. Upload dos arquivos para seu servidor
3. Configure as variáveis de ambiente no servidor
4. Configure SSL/HTTPS (Let's Encrypt grátis)

---

## 🔧 Configurações Pós-Deploy

### 1. Configurar Domínio

**DNS Records (CloudFlare/GoDaddy/etc):**
```
A     @       76.76.21.21  (IP do seu servidor)
CNAME www     kzstore.ao
```

### 2. SSL/HTTPS (Obrigatório)

**Com Vercel/Netlify:**
- SSL automático ✅

**Com servidor próprio:**
```bash
# Certbot (Let's Encrypt grátis)
sudo certbot --nginx -d kzstore.ao -d www.kzstore.ao
```

### 3. Configurar Emails Transacionais (Opcional)

**Opção A: Resend (Recomendado)**
```bash
# 1. Criar conta: https://resend.com/
# 2. Adicionar domínio e verificar DNS
# 3. Criar API Key
# 4. Adicionar no Supabase: RESEND_API_KEY
```

**Opção B: SendGrid**
```bash
# Similar ao Resend
# https://sendgrid.com/
```

### 4. Configurar Google Search Console

1. Acesse: https://search.google.com/search-console
2. Adicione propriedade: kzstore.ao
3. Verifique propriedade via DNS ou arquivo
4. Envie sitemap: https://kzstore.ao/sitemap.xml

---

## 📊 Monitoramento e Analytics

### Google Analytics

Já integrado! Basta adicionar seu GA ID:

```javascript
// Método 1: LocalStorage (rápido)
localStorage.setItem('kzstore_ga_id', 'G-XXXXXXXXXX');

// Método 2: Variável de ambiente
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Analytics Customizado

O sistema já rastreia automaticamente:
- ✅ Visualizações de página
- ✅ Visualizações de produto
- ✅ Adições ao carrinho
- ✅ Compras completadas
- ✅ Buscas

Dados salvos em: `analytics:*` no KV Store

### Sentry (Monitoramento de Erros - Opcional)

```bash
# 1. Criar conta: https://sentry.io/
# 2. Criar novo projeto React
# 3. Copiar DSN
# 4. Adicionar: NEXT_PUBLIC_SENTRY_DSN
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança:

- [x] ✅ Autenticação Supabase implementada
- [x] ✅ Rate limiting ativado (100 req/15min)
- [x] ✅ Validação de dados no backend
- [x] ✅ Proteção de rotas admin
- [x] ✅ CORS configurado
- [x] ✅ Headers de segurança
- [ ] ⚠️ SSL/HTTPS obrigatório (após deploy)
- [ ] ⚠️ Backup automático diário ativado
- [ ] ⚠️ Firewall configurado

### Recomendações Adicionais:

1. **Alterar senha admin padrão:**
```
Email: admin@kzstore.ao
Senha: kzstore2024 ← MUDAR URGENTE!
```

2. **Configurar backup externo:**
   - Backups automáticos salvos em `backup:*`
   - Retenção: 7 dias
   - Considere backup externo adicional

3. **Monitorar logs:**
```bash
# Ver logs do Supabase
# Dashboard → Logs → Functions
```

---

## 🧪 Testes Pós-Deploy

### Checklist de Testes:

1. **Funcionalidades Básicas:**
   - [ ] Homepage carrega corretamente
   - [ ] Produtos aparecem
   - [ ] Filtros funcionam
   - [ ] Carrinho adiciona/remove itens
   - [ ] Checkout completa
   - [ ] WhatsApp abre corretamente

2. **Chatbot IA:**
   - [ ] Chatbot abre
   - [ ] Responde perguntas (requer GEMINI_API_KEY)
   - [ ] Recomendações de produtos

3. **Admin Panel:**
   - [ ] Login funciona
   - [ ] CRUD de produtos
   - [ ] Visualização de pedidos
   - [ ] Atualização de status

4. **SEO:**
   - [ ] robots.txt acessível: /robots.txt
   - [ ] sitemap.xml acessível: /sitemap.xml
   - [ ] Meta tags corretas (View Source)
   - [ ] Open Graph tags

5. **Performance:**
   - [ ] Página carrega em < 3s
   - [ ] Imagens otimizadas
   - [ ] Sem erros no console

---

## 📱 Configurações Finais

### 1. Atualizar Informações da Empresa

Edite `/config/constants.ts`:

```typescript
export const COMPANY_INFO = {
  whatsapp: '+244931054015', // ✅ Já configurado
  email: 'contato@kzstore.ao', // Atualizar com email real
  phone: '+244 931 054 015',
  address: 'Seu endereço completo aqui', // ⚠️ Atualizar
  nif: 'SEU-NIF-AQUI', // ⚠️ Adicionar
  // ... outros campos
};
```

### 2. Configurar Contas Bancárias

Edite `/config/constants.ts`:

```typescript
export const BANK_ACCOUNTS = {
  bai: {
    account: '0000.0000.0000.0000.0', // ⚠️ Adicionar conta real
    iban: 'AO06.0000.0000.0000.0000.0000.0'
  },
  // ...
};
```

### 3. Links de Redes Sociais

Edite `/config/constants.ts`:

```typescript
social: {
  facebook: 'https://facebook.com/kzstore',
  instagram: 'https://instagram.com/kzstore',
  linkedin: 'https://linkedin.com/company/kzstore'
}
```

---

## 🎯 Otimizações de Performance

### Imagens

1. Use CDN (Cloudflare Images / ImageKit)
2. Formatos modernos (WebP)
3. Lazy loading (já implementado)

### Caching

```javascript
// Cache Control headers
Cache-Control: public, max-age=31536000, immutable
```

### Database

- Backups automáticos: ✅ Ativado
- Limpeza de dados antigos: ✅ 7 dias

---

## 📞 Suporte

**Documentação Completa:**
- Supabase: https://supabase.com/docs
- Google Gemini: https://ai.google.dev/docs

**Em caso de problemas:**
1. Verifique logs do Supabase
2. Console do navegador (F12)
3. Teste health check: /make-server-d8a4dffd/health

---

## ✅ Checklist Final de Produção

### Crítico (Obrigatório):
- [x] ✅ Supabase configurado
- [ ] ⚠️ GEMINI_API_KEY adicionado
- [ ] ⚠️ Domínio configurado
- [ ] ⚠️ SSL/HTTPS ativado
- [ ] ⚠️ Senha admin alterada
- [ ] ⚠️ Informações da empresa atualizadas
- [ ] ⚠️ Contas bancárias adicionadas

### Importante (Recomendado):
- [ ] Google Analytics configurado
- [ ] Email transacional configurado
- [ ] Search Console configurado
- [ ] Sentry configurado (monitoramento)
- [ ] Backup externo configurado

### Opcional (Melhorias):
- [ ] CDN para imagens
- [ ] PWA configurado
- [ ] Push notifications
- [ ] Chat ao vivo real

---

## 🎉 Pronto para Produção!

Após completar todos os passos críticos, seu e-commerce estará pronto para receber clientes!

**Próximos passos:**
1. Testar completamente
2. Adicionar produtos reais
3. Configurar marketing (Facebook Ads, Google Ads)
4. Monitorar métricas no Analytics

**Boa sorte com as vendas! 🚀💰**

---

*Última atualização: 6 de novembro de 2025*
*Versão: 2.0.0 - Production Ready*
