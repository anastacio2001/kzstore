# 🔧 SOLUÇÃO: Erro "Google recusou a conexão"

## ❌ ERRO:
```
accounts.google.com ha rifiutato la connessione
```

---

## ✅ SOLUÇÃO COMPLETA:

### PASSO 1: Descobrir seu Project ID do Supabase

```
1. Abrir Supabase Dashboard: https://supabase.com/dashboard
2. Selecionar seu projeto KZSTORE
3. Settings (ícone de engrenagem) → API
4. Procurar "Project URL"
```

**Você verá algo como:**
```
Project URL: https://abcdefghijklmnop.supabase.co
                    └──────┬────────┘
                      Este é seu PROJECT-ID
```

**Exemplo:**
- Se sua URL é: `https://xyzabc123.supabase.co`
- Seu PROJECT-ID é: `xyzabc123`

---

### PASSO 2: Configurar Redirect URI no Google Cloud

```
1. Google Cloud Console: https://console.cloud.google.com
2. Selecionar projeto KZSTORE
3. Menu lateral → APIs & Services → Credentials
4. Clicar no OAuth 2.0 Client ID que você criou
5. Scroll até "Authorized redirect URIs"
```

### ⚠️ ADICIONAR ESTAS URLs:

**Clique em "+ ADD URI" e adicione TODAS estas 3 URLs:**

```
1️⃣ https://[SEU-PROJECT-ID].supabase.co/auth/v1/callback
   Exemplo: https://xyzabc123.supabase.co/auth/v1/callback

2️⃣ http://localhost:3000/auth/v1/callback
   (Para testes locais - opcional)

3️⃣ https://kzstore.ao/auth/v1/callback
   (Se já tiver domínio próprio - opcional)
```

**⚠️ IMPORTANTE:**
- ✅ Use HTTPS (não HTTP)
- ✅ Sem barra "/" no final
- ✅ Exatamente `/auth/v1/callback`
- ✅ Project ID correto

**Deve ficar assim:**

```
┌────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                               │
│                                                        │
│ URI 1: https://xyzabc123.supabase.co/auth/v1/callback │
│        [Delete]                                        │
│                                                        │
│ + ADD URI                                              │
└────────────────────────────────────────────────────────┘
```

**Depois:**
```
7. Clicar em "SAVE" (no final da página)
8. ⏱️ Aguardar 5-10 minutos para propagar
```

---

### PASSO 3: Verificar Tela de Consentimento

```
1. Google Cloud Console → APIs & Services
2. OAuth consent screen
```

**Verificar:**

```
✅ App name: KZSTORE (preenchido)
✅ User support email: kstoregeral@gmail.com (preenchido)
✅ Developer email: kstoregeral@gmail.com (preenchido)
✅ App logo: (opcional)
```

**Scopes (Permissões):**

Deve ter pelo menos:
```
✅ .../auth/userinfo.email
✅ .../auth/userinfo.profile
```

**Se não tiver, adicionar:**
```
1. OAuth consent screen → EDIT APP
2. Scopes → ADD OR REMOVE SCOPES
3. Filtrar por "userinfo"
4. Marcar:
   ☑️ .../auth/userinfo.email
   ☑️ .../auth/userinfo.profile
5. UPDATE
6. SAVE AND CONTINUE
```

---

### PASSO 4: Verificar Domínios Autorizados

```
1. OAuth consent screen → EDIT APP
2. Scroll até "Authorized domains"
```

**Adicionar:**
```
1️⃣ supabase.co
2️⃣ kzstore.ao (se tiver domínio próprio)
```

**Deve ficar:**
```
┌────────────────────────────────┐
│ Authorized domains             │
│                                │
│ 1. supabase.co                 │
│ 2. kzstore.ao                  │
│                                │
│ + ADD DOMAIN                   │
└────────────────────────────────┘
```

---

### PASSO 5: Publicar App (Modo Produção)

**Se o app estiver em "Testing":**

```
1. OAuth consent screen
2. Ver "Publishing status"
```

**Se mostrar "Testing":**

```
┌────────────────────────────────────────┐
│ Publishing status: Testing             │
│                                        │
│ ⚠️ Only test users can access         │
│                                        │
│ [PUBLISH APP]                          │
└────────────────────────────────────────┘
```

**Para produção:**
```
1. Clicar em "PUBLISH APP"
2. Confirmar
```

**OU adicionar Test Users:**
```
1. OAuth consent screen → Test users
2. + ADD USERS
3. Adicionar emails que podem testar:
   - kstoregeral@gmail.com
   - seu-email-pessoal@gmail.com
4. SAVE
```

---

## 🧪 TESTAR NOVAMENTE:

### Método 1: Limpar Cache do Navegador

```
1. Fechar todas as abas do site
2. Ctrl + Shift + Del (Chrome/Edge)
3. Marcar "Cookies" e "Cache"
4. Limpar dos últimos 7 dias
5. Fechar e reabrir navegador
6. Tentar login Google novamente
```

### Método 2: Modo Anônimo

```
1. Abrir aba anônima (Ctrl + Shift + N)
2. Ir para seu site KZSTORE
3. Clicar em "Entrar"
4. Clicar em "Continuar com Google"
5. Verificar se funciona
```

---

## ✅ CHECKLIST COMPLETO:

```
Google Cloud Console:
□ Redirect URI correto adicionado
□ Format: https://[project-id].supabase.co/auth/v1/callback
□ HTTPS (não HTTP)
□ Sem barra "/" no final
□ SAVE clicado
□ Aguardado 5-10 minutos

OAuth Consent Screen:
□ App name preenchido
□ Emails de contato preenchidos
□ Scopes adicionados (email + profile)
□ Domínio "supabase.co" autorizado
□ App publicado OU test users adicionados

Supabase:
□ Client ID correto
□ Client Secret correto
□ Provider Google ativado (toggle verde)
□ SAVE clicado

Teste:
□ Cache limpo
□ Testado em modo anônimo
□ Aguardado propagação (5-10 min)
```

---

## 🔍 DEBUG ADICIONAL:

### Ver Detalhes do Erro:

**Se ainda não funcionar, abrir Console do Navegador:**

```
1. F12 (ou Ctrl + Shift + I)
2. Aba "Console"
3. Clicar em "Continuar com Google"
4. Ver mensagem de erro completa
```

**Erros comuns e soluções:**

| Erro | Solução |
|------|---------|
| `redirect_uri_mismatch` | URI no Google ≠ URI do Supabase |
| `invalid_client` | Client ID/Secret incorretos |
| `access_denied` | App não publicado ou user não é tester |
| `unauthorized_client` | Scopes não configurados |

---

## 📞 AINDA COM ERRO?

### Verificar URL EXATA que Supabase está usando:

```
1. Supabase Dashboard → Authentication → Providers
2. Clicar em "Google" (já ativado)
3. Scroll até o final
4. Ver "Callback URL (for OAuth)"
```

**Copiar essa URL EXATA e colar no Google Cloud Console!**

---

## 🎯 SOLUÇÃO RÁPIDA (TL;DR):

```bash
# 1. Pegar Project ID
Supabase → Settings → API → Project URL
Exemplo: https://xyzabc123.supabase.co
         Project ID = xyzabc123

# 2. Adicionar no Google Cloud
Google Console → Credentials → OAuth 2.0 Client
→ Authorized redirect URIs
→ + ADD URI
→ https://xyzabc123.supabase.co/auth/v1/callback
→ SAVE

# 3. Aguardar 5 minutos

# 4. Testar em modo anônimo
```

---

## ✅ DEVE FUNCIONAR AGORA!

Se seguir estes passos, o erro será resolvido em 99% dos casos.

**Tempo estimado:** 5-15 minutos (incluindo propagação)

---

*Criado para KZSTORE - Solução de erro Google OAuth*
