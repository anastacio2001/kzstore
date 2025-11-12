# 🚀 Deploy KZSTORE no Vercel - Passo a Passo

## 📋 Checklist

- [ ] Criar repositório no GitHub
- [ ] Push do código
- [ ] Conectar Vercel
- [ ] Configurar variáveis
- [ ] Deploy!

---

## PASSO 1: Criar Repositório no GitHub

### 1.1 Acesse o GitHub:
🔗 https://github.com/new

### 1.2 Configure o repositório:
- **Repository name:** `kzstore` (ou outro nome de sua preferência)
- **Description:** "E-commerce KZSTORE - Loja online de tecnologia"
- **Visibilidade:** 
  - ✅ **Public** (recomendado para Vercel gratuito)
  - ⚠️ Private (funciona, mas pode ter limitações)
- **❌ NÃO marque:** "Add a README file"
- **❌ NÃO marque:** "Add .gitignore"
- **❌ NÃO marque:** "Choose a license"

### 1.3 Clique em: **"Create repository"**

---

## PASSO 2: Push para GitHub

Você verá uma página com instruções. Copie a URL do repositório.

### 2.1 Execute no PowerShell:

```powershell
# Substituir USERNAME pelo seu usuário do GitHub
git remote add origin https://github.com/USERNAME/kzstore.git

# Push do código
git push -u origin main
```

**Exemplo:**
```powershell
git remote add origin https://github.com/anastacio2001/kzstore.git
git push -u origin main
```

### 2.2 Autenticação:
Se pedir usuário e senha:
- **Username:** seu_usuario_github
- **Password:** ⚠️ Use um **Personal Access Token** (não sua senha)

#### Como criar Token (se necessário):
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Marcar "repo" → Generate
3. Copiar o token e usar como senha

---

## PASSO 3: Deploy no Vercel

### 3.1 Acesse o Vercel:
🔗 https://vercel.com/new

### 3.2 Login:
- Clique em **"Continue with GitHub"**
- Autorize o Vercel a acessar seus repositórios

### 3.3 Import Git Repository:
1. Você verá uma lista dos seus repositórios
2. Encontre **kzstore**
3. Clique em **"Import"**

### 3.4 Configure o Projeto:

#### Project Settings:
- **Project Name:** `kzstore` (ou personalize)
- **Framework Preset:** `Vite` ✅ (detecta automaticamente)
- **Root Directory:** `./` (deixar padrão)
- **Build Command:** `npm run build` (já preenchido)
- **Output Directory:** `build` (já preenchido)

---

## PASSO 4: Variáveis de Ambiente

### 4.1 Expandir "Environment Variables":

Adicione as seguintes variáveis:

#### Variável 1:
```
Name: VITE_SUPABASE_PROJECT_ID
Value: duxeeawfyxcciwlyjllk
```

#### Variável 2:
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eGVlYXdmeXhjY2l3bHlqbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwMDQsImV4cCI6MjA3Nzg1MzAwNH0.1BWI_11MST5ZC19NEx5yZoLJHn3MtOmgfd-Fs8FQhVc
```

### 4.2 Marcar para todos os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## PASSO 5: Deploy! 🚀

### 5.1 Clique em **"Deploy"**

O Vercel vai:
1. ✅ Clonar seu repositório
2. ✅ Instalar dependências (`npm install`)
3. ✅ Executar build (`npm run build`)
4. ✅ Fazer deploy dos arquivos

⏱️ **Tempo estimado:** 2-3 minutos

### 5.2 Aguarde o Deploy:

Você verá:
- 🔵 Building... (instalando e compilando)
- 🟢 Success! (quando finalizar)

---

## PASSO 6: Sua Aplicação Está no Ar! 🎉

### 6.1 Você receberá uma URL:
```
https://kzstore-xxxxx.vercel.app
```

### 6.2 Clique em **"Visit"** para abrir o site

---

## PASSO 7: Configurar Supabase

Agora que tem a URL de produção, configure no Supabase:

### 7.1 Acesse o Supabase:
🔗 https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk

### 7.2 Vá em: Settings → Authentication → URL Configuration

### 7.3 Configure:

**Site URL:**
```
https://sua-url.vercel.app
```

**Redirect URLs (adicione ambas):**
```
https://sua-url.vercel.app/**
http://localhost:5173/**
```

### 7.4 Clique em **"Save"**

---

## PASSO 8: Executar Migrações SQL

### 8.1 Acesse SQL Editor:
🔗 https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/sql

### 8.2 Nova Query:
- Clique em **"New Query"**

### 8.3 Copiar SQL:
- Abra o arquivo: `supabase/migrations/EXECUTE_THIS_IN_SUPABASE.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor

### 8.4 Executar:
- Clique em **"Run"** (ou Ctrl+Enter)
- Aguarde confirmação: ✅ Success

---

## PASSO 9: Testar Aplicação

### 9.1 Acesse seu site de produção

### 9.2 Teste básico:
- [ ] Site carrega sem erros
- [ ] Produtos aparecem
- [ ] Imagens carregam
- [ ] Login funciona

### 9.3 Teste Admin:
- [ ] Acesse: `https://sua-url.vercel.app/admin`
- [ ] Login: `admin@kzstore.ao` / `admin123`
- [ ] Painel admin abre
- [ ] Aba **"Banner Home"** aparece
- [ ] Aba **"Categorias"** aparece

---

## 🎊 PRONTO! Seu E-commerce Está no Ar!

### URLs Importantes:

**Site de Produção:**
```
https://kzstore-xxxxx.vercel.app
```

**Dashboard Vercel:**
```
https://vercel.com/seu-usuario/kzstore
```

**Painel Admin:**
```
https://kzstore-xxxxx.vercel.app/admin
```

---

## 🔄 Próximos Deploys (Automáticos)

Agora, sempre que você fizer:
```powershell
git add .
git commit -m "descrição"
git push
```

O Vercel automaticamente:
1. Detecta a mudança
2. Faz novo build
3. Deploy automático
4. Gera preview URL

**Sem fazer nada!** 🎉

---

## 🎯 Domínio Customizado (Opcional)

Se quiser usar `kzstore.ao` ou outro domínio:

### No Vercel:
1. Settings → Domains
2. Add Domain
3. Digite: `kzstore.ao`
4. Seguir instruções DNS

### No seu registrador de domínio:
Adicionar registro CNAME:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

## 📞 Suporte

**Vercel Docs:** https://vercel.com/docs
**Vercel Support:** https://vercel.com/support

---

## ⚡ Comandos Rápidos

```powershell
# Ver status do repositório
git status

# Fazer mudanças e deploy
git add .
git commit -m "descrição da mudança"
git push

# Ver logs remotos
git log --oneline

# Voltar para versão anterior (se necessário)
git revert HEAD
git push
```

---

## 🎉 Parabéns!

Você acabou de fazer o deploy de um e-commerce completo com:
- ✅ Frontend React otimizado
- ✅ Backend Supabase
- ✅ Admin panel completo
- ✅ Sistema B2B e B2C
- ✅ CI/CD automático
- ✅ SSL gratuito
- ✅ 100GB banda/mês

**Tudo isso por:** $0/mês! 🆓

---

**Criado em:** 12 de Novembro de 2025  
**Status:** ✅ Pronto para deploy!
