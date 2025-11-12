# 🚀 Deploy KZSTORE - Passo a Passo

## ✅ Status Atual
- ✅ Build de produção funcionando (1.52 MB)
- ✅ Variáveis de ambiente configuradas
- ✅ Console.logs removidos
- ✅ URLs migradas para env vars
- ✅ Supabase conectado: `duxeeawfyxcciwlyjllk`

---

## 🎯 Opção 1: Deploy no Vercel (RECOMENDADO) - 10 minutos

### Passo 1: Preparar Git

```powershell
# Se ainda não tem Git iniciado
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "🚀 Deploy inicial - KZSTORE v1.0"
```

### Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `kzstore-production` (ou outro nome)
3. **NÃO marque** "Add a README"
4. Clique em **"Create repository"**

### Passo 3: Push para GitHub

```powershell
# Substituir SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/kzstore-production.git
git branch -M main
git push -u origin main
```

### Passo 4: Deploy no Vercel

1. **Acesse:** https://vercel.com/new
2. **Import Git Repository:**
   - Conecte sua conta GitHub
   - Selecione o repositório `kzstore-production`
   - Clique em **Import**

3. **Configure o Projeto:**
   - **Project Name:** `kzstore` (ou outro)
   - **Framework Preset:** `Vite` ✅
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` ✅
   - **Output Directory:** `build` ✅

4. **Adicionar Variáveis de Ambiente:**
   
   Clique em **"Environment Variables"** e adicione:

   ```
   Nome: VITE_SUPABASE_PROJECT_ID
   Valor: duxeeawfyxcciwlyjllk
   ```

   ```
   Nome: VITE_SUPABASE_ANON_KEY
   Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eGVlYXdmeXhjY2l3bHlqbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwMDQsImV4cCI6MjA3Nzg1MzAwNH0.1BWI_11MST5ZC19NEx5yZoLJHn3MtOmgfd-Fs8FQhVc
   ```

5. **Deploy!** 
   - Clique em **"Deploy"**
   - Aguarde 2-3 minutos ⏳
   - 🎉 Pronto! Você terá uma URL: `https://kzstore-xxxxx.vercel.app`

---

## 🎯 Opção 2: Deploy no Netlify (ALTERNATIVA) - 10 minutos

### Passo 1: Criar netlify.toml

Execute no PowerShell:

```powershell
@"
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"@ | Out-File -FilePath netlify.toml -Encoding UTF8
```

### Passo 2: Deploy

**Opção A - Via Interface Web (Mais Fácil):**

1. **Build local:**
   ```powershell
   npm run build
   ```

2. **Deploy:**
   - Acesse: https://app.netlify.com/drop
   - Arraste a pasta `build` para o site
   - ✅ Pronto!

**Opção B - Via CLI:**

```powershell
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Passo 3: Configurar Variáveis de Ambiente

1. No Netlify Dashboard:
2. **Site Settings** > **Environment Variables**
3. Adicione:
   - `VITE_SUPABASE_PROJECT_ID` = `duxeeawfyxcciwlyjllk`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Redeploy:** Site Configuration > Trigger Deploy

---

## 🎯 Opção 3: Deploy Manual (SEM GIT) - 5 minutos

### Vercel CLI:

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Seguir instruções e adicionar as variáveis de ambiente quando solicitado
```

---

## 🔧 Configurar Supabase para Produção

### Adicionar URL do Site no Supabase:

1. **Acesse:** https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk
2. **Settings** > **Authentication** > **URL Configuration**
3. **Site URL:** Adicione sua URL do Vercel/Netlify
   - Exemplo: `https://kzstore-xxxxx.vercel.app`
4. **Redirect URLs:** Adicione:
   ```
   https://kzstore-xxxxx.vercel.app/**
   http://localhost:5173/**
   ```

---

## ✅ Verificações Pós-Deploy

### Checklist Essencial:

1. **Site carrega?** ✅
   - Abra a URL no navegador
   - Verifique se não há erro 404

2. **Produtos aparecem?** ✅
   - Vá em "Produtos"
   - Devem carregar da base de dados

3. **Login funciona?** ✅
   - Teste fazer login
   - Email: `admin@kzstore.ao`
   - Senha: `admin123`

4. **Admin Panel abre?** ✅
   - Acesse `/admin`
   - Todas as abas devem funcionar
   - Teste as novas: **Banner Home** e **Categorias**

5. **Imagens carregam?** ✅
   - Verifique se logos e produtos aparecem

---

## 🐛 Resolução de Problemas

### ❌ Erro: "Failed to fetch"
**Solução:** Verifique variáveis de ambiente no Vercel/Netlify

### ❌ Páginas retornam 404
**Solução (Vercel):** Adicione `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Solução (Netlify):** Já está no `netlify.toml` ✅

### ❌ Imagens não carregam
**Solução:** 
1. Vá no Supabase Storage
2. Verifique buckets são públicos
3. Teste URLs diretamente

### ❌ Login não funciona
**Solução:**
1. Verifique Site URL no Supabase
2. Adicione URL de produção nas Redirect URLs

---

## 📱 Domínio Customizado (Opcional)

### No Vercel:
1. **Settings** > **Domains**
2. **Add Domain:** `kzstore.ao` (ou seu domínio)
3. Configurar DNS:
   - Tipo: `CNAME`
   - Nome: `@` ou `www`
   - Valor: `cname.vercel-dns.com`

### No Netlify:
1. **Domain Settings** > **Add custom domain**
2. Seguir instruções DNS

---

## 🎉 Pronto!

Seu e-commerce está **NO AR!** 🚀

### Próximos Passos:

1. ✅ **Teste tudo** no site de produção
2. 🎨 **Customize** banner e categorias no admin
3. 📦 **Adicione produtos** reais
4. 📢 **Compartilhe** a URL com clientes
5. 📊 **Configure Analytics** (opcional)

---

## 📞 Suporte Rápido

**Vercel Docs:** https://vercel.com/docs
**Netlify Docs:** https://docs.netlify.com
**Supabase Docs:** https://supabase.com/docs

**Logs de Erro:**
- Vercel: Dashboard > Deployment > Logs
- Netlify: Deploys > Deploy Log
- Supabase: Dashboard > Logs

---

**Última atualização:** 12 de Novembro de 2025  
**Status:** ✅ Pronto para deploy!
