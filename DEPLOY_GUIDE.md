# 🚀 Guia de Deploy - KZSTORE

## ✅ Pré-requisitos Resolvidos

- [x] Variáveis de ambiente configuradas (`.env`)
- [x] URLs hardcoded migradas para variáveis de ambiente
- [x] Console.logs removidos/controlados
- [x] Build de produção testado e funcionando
- [x] Arquivos duplicados removidos
- [x] `.gitignore` atualizado

---

## 📋 Checklist Final Antes do Deploy

### 1. Supabase em Produção

#### Criar Projeto de Produção:
1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Configure:
   - Nome: `kzstore-production`
   - Região: Escolha a mais próxima de Angola (ex: `eu-west-1`)
   - Senha do banco: Anote em local seguro!

#### Aplicar Migrações:
```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Vincular ao projeto de produção
supabase link --project-ref SEU_PROJECT_REF

# Aplicar todas as migrações
supabase db push
```

#### Configurar Storage:
1. Vá em **Storage** no dashboard
2. Crie os buckets:
   - `products` (público)
   - `trade-in` (público)
   - `ad-images` (público)
3. Configure políticas RLS (já estão nas migrations)

---

### 2. Configurar Variáveis de Ambiente

#### No seu projeto local:
O arquivo `.env` já está criado com as credenciais atuais.

#### Para produção (Vercel/Netlify):
Adicione estas variáveis no painel da plataforma:

```env
VITE_SUPABASE_PROJECT_ID=seu_novo_project_id_producao
VITE_SUPABASE_ANON_KEY=sua_nova_anon_key_producao
```

**Onde encontrar:**
- Project ID: Settings > General > Reference ID
- Anon Key: Settings > API > `anon` `public`

---

### 3. Deploy no Vercel (Recomendado)

#### Opção A: Via GitHub (Recomendado)

1. **Criar repositório Git:**
```bash
git init
git add .
git commit -m "🚀 Preparando para produção"
```

2. **Criar repo no GitHub:**
   - Vá em https://github.com/new
   - Nome: `kzstore`
   - **NÃO** marque "Add a README"

3. **Push para GitHub:**
```bash
git remote add origin https://github.com/SEU_USUARIO/kzstore.git
git branch -M main
git push -u origin main
```

4. **Deploy no Vercel:**
   - Acesse https://vercel.com/new
   - Import seu repositório GitHub
   - Configure:
     - **Framework Preset:** Vite
     - **Root Directory:** `./`
     - **Build Command:** `npm run build`
     - **Output Directory:** `build`
   
5. **Adicionar variáveis de ambiente:**
   - Em "Environment Variables", adicione:
     ```
     VITE_SUPABASE_PROJECT_ID = seu_project_id
     VITE_SUPABASE_ANON_KEY = sua_anon_key
     ```
   
6. **Deploy!** 🚀

#### Opção B: Deploy direto (sem Git)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel --prod

# Seguir instruções no terminal
```

---

### 4. Deploy no Netlify (Alternativa)

1. **Criar arquivo de configuração:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via CLI:**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

3. **Ou via interface web:**
   - https://app.netlify.com/drop
   - Arraste a pasta `build` após rodar `npm run build`

---

### 5. Configurações Pós-Deploy

#### A. Domínio Customizado (Opcional)

**No Vercel:**
1. Settings > Domains
2. Add Domain
3. Configurar DNS conforme instruções

**No Netlify:**
1. Domain Settings > Add custom domain
2. Seguir instruções DNS

#### B. Email Service (Resend)

1. Criar conta: https://resend.com
2. Criar API Key
3. Adicionar variável de ambiente:
   ```
   RESEND_API_KEY=sua_chave_aqui
   ```
4. Verificar domínio para emails profissionais

#### C. SSL/HTTPS
- ✅ Vercel e Netlify configuram automaticamente
- ✅ Certificado gratuito via Let's Encrypt

---

## 🧪 Testes Pós-Deploy

### Checklist de Funcionalidades:

- [ ] **Autenticação**
  - [ ] Login funciona
  - [ ] Cadastro funciona
  - [ ] Logout funciona

- [ ] **E-commerce**
  - [ ] Produtos carregam
  - [ ] Carrinho funciona
  - [ ] Checkout completa pedido
  - [ ] Pedidos aparecem em "Meus Pedidos"

- [ ] **Trade-in**
  - [ ] Formulário envia fotos
  - [ ] Admin vê solicitações
  - [ ] Avaliação cria crédito
  - [ ] Crédito aparece na página do usuário

- [ ] **B2B**
  - [ ] Cadastro de empresa funciona
  - [ ] Admin vê cadastros
  - [ ] Aprovação funciona
  - [ ] Desconto é aplicado

- [ ] **Admin Panel**
  - [ ] Login admin funciona
  - [ ] Todas as abas carregam
  - [ ] Edição de produtos funciona
  - [ ] Dashboard mostra estatísticas

---

## 📊 Monitoramento (Recomendado)

### Opção 1: Vercel Analytics
```bash
npm i @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Opção 2: Google Analytics
1. Criar propriedade GA4
2. Adicionar script no `index.html`

### Opção 3: Plausible (Privacy-friendly)
1. Criar conta: https://plausible.io
2. Adicionar script no `index.html`

---

## 🔒 Segurança

### RLS Policies - Verificação Final:

```sql
-- Verificar todas as políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Checklist de Segurança:
- [x] `.env` no `.gitignore`
- [x] Anon key pública usada (não service role)
- [ ] RLS habilitado em todas as tabelas sensíveis
- [ ] Políticas testadas (usuário comum vs admin)
- [ ] Storage buckets com RLS adequado

---

## 🐛 Troubleshooting

### Erro: "Invalid API Key"
- Verifique variáveis de ambiente na plataforma
- Confirme que usou a Anon Key (não Service Role)

### Erro: "Row Level Security"
- Verifique políticas RLS no Supabase Dashboard
- Execute migrations: `supabase db push`

### Build falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Imagens não carregam
- Verifique buckets no Supabase Storage
- Confirme políticas de leitura pública
- Verifique URLs das imagens

---

## 📞 Suporte

### Recursos:
- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Vite Deploy: https://vitejs.dev/guide/static-deploy.html

### Em caso de problemas:
1. Verifique logs no dashboard da plataforma
2. Inspecione console do navegador (F12)
3. Verifique logs do Supabase (Dashboard > Logs)

---

## ✨ Próximos Passos (Opcional)

1. **PWA**: Já configurado, testar instalação mobile
2. **Analytics**: Configurar tracking de eventos
3. **SEO**: Adicionar meta tags e sitemap
4. **Performance**: Otimizar imagens (WebP, lazy loading)
5. **CI/CD**: Configurar testes automáticos
6. **Backups**: Agendar backups do banco
7. **Monitoring**: Configurar alertas de erro (Sentry)

---

## 🎉 Pronto para Produção!

Seu e-commerce está pronto para ir ao ar. Boa sorte! 🚀

**Última atualização:** $(date)
**Versão:** 1.0.0
