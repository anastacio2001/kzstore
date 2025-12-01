# 🔐 GUIA DE CONFIGURAÇÃO - LOGIN SOCIAL (Google & Facebook)

## 🎯 Objetivo

Permitir que clientes façam login na KZSTORE usando:
1. **Google Account** (Gmail)
2. **Facebook Account**

Ambos integrados via Supabase Auth.

---

## 📋 PRÉ-REQUISITOS

- Conta Supabase ativa
- Domínio da aplicação (ou localhost para testes)
- Conta Google (para Google OAuth)
- Conta Facebook (para Facebook OAuth)

---

## 🔵 PARTE 1: CONFIGURAR GOOGLE LOGIN

### Passo 1: Criar Projeto no Google Cloud

1. **Acesse:** https://console.cloud.google.com
2. **Crie novo projeto:**
   - Nome: `KZSTORE`
   - ID: `kzstore-auth` (ou similar)
3. **Selecione o projeto** criado

### Passo 2: Ativar Google+ API

1. No menu lateral: **APIs & Services** → **Library**
2. Busque: `Google+ API`
3. Clique em **ENABLE**

### Passo 3: Configurar Tela de Consentimento OAuth

1. **APIs & Services** → **OAuth consent screen**
2. Escolha **External** (ou Internal se G Suite)
3. Preencha:
   ```
   App name: KZSTORE
   User support email: kstoregeral@gmail.com
   Developer contact: kstoregeral@gmail.com
   ```
4. **Scopes:** Adicionar:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. **Salvar e continuar**

### Passo 4: Criar Credenciais OAuth 2.0

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. Tipo: **Web application**
4. Nome: `KZSTORE Web Client`
5. **Authorized redirect URIs** - Adicionar:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   
   **Exemplo:**
   ```
   https://abc123xyz.supabase.co/auth/v1/callback
   ```

6. **Create**
7. **COPIAR:**
   - `Client ID` (ex: 123456789-abc.apps.googleusercontent.com)
   - `Client Secret` (ex: GOCSPX-xxxx...)

### Passo 5: Configurar no Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Encontre **Google** na lista
3. Ative o toggle **Enable Sign in with Google**
4. Cole:
   - **Client ID** (do Google Cloud)
   - **Client Secret** (do Google Cloud)
5. **Save**

### Passo 6: Testar

```typescript
// Frontend já implementado em /hooks/useAuth.tsx
const { signInWithGoogle } = useAuth();

await signInWithGoogle();
// Usuário será redirecionado para login Google
```

---

## 🔵 PARTE 2: CONFIGURAR FACEBOOK LOGIN

### Passo 1: Criar App Facebook

1. **Acesse:** https://developers.facebook.com
2. **My Apps** → **Create App**
3. Tipo: **Consumer** (para login de clientes)
4. Preencha:
   ```
   App Name: KZSTORE
   App Contact Email: kstoregeral@gmail.com
   ```
5. **Create App**

### Passo 2: Adicionar Facebook Login

1. No Dashboard do app, **Add Product**
2. Encontre **Facebook Login** → **Set Up**
3. Escolha **Web** como plataforma
4. Site URL: `https://kzstore.ao` (ou seu domínio)

### Passo 3: Configurar OAuth Redirect URLs

1. **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs** - Adicionar:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   
   **Exemplo:**
   ```
   https://abc123xyz.supabase.co/auth/v1/callback
   ```

3. **Save Changes**

### Passo 4: Obter Credenciais

1. **Settings** → **Basic**
2. **COPIAR:**
   - `App ID` (ex: 1234567890123456)
   - `App Secret` (clicar em "Show" para revelar)

### Passo 5: Configurar Domínios

1. **Settings** → **Basic**
2. **App Domains:** Adicionar:
   ```
   kzstore.ao
   [your-project-id].supabase.co
   ```

### Passo 6: Configurar no Supabase

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Encontre **Facebook** na lista
3. Ative o toggle **Enable Sign in with Facebook**
4. Cole:
   - **Facebook Client ID** (App ID do Facebook)
   - **Facebook Secret** (App Secret do Facebook)
5. **Save**

### Passo 7: Publicar App (Produção)

**⚠️ IMPORTANTE:** Para produção, você precisa:

1. **Settings** → **Basic**
2. Scroll down → **App Mode**
3. Mudar de "Development" para "Live"
4. Completar **App Review**:
   - Política de privacidade
   - Termos de serviço
   - Ícone do app (1024x1024px)
   - Screenshot da funcionalidade de login

---

## 🧪 TESTAR CONFIGURAÇÃO

### Teste Local (Development)

#### Google:
```typescript
import { useAuth } from './hooks/useAuth';

function LoginButton() {
  const { signInWithGoogle } = useAuth();
  
  return (
    <button onClick={signInWithGoogle}>
      Login with Google
    </button>
  );
}
```

#### Facebook:
```typescript
import { useAuth } from './hooks/useAuth';

function LoginButton() {
  const { signInWithFacebook } = useAuth();
  
  return (
    <button onClick={signInWithFacebook}>
      Login with Facebook
    </button>
  );
}
```

### Verificar Usuário Autenticado

```typescript
const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log('User:', user);
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Avatar:', user.avatar);
}
```

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────┐
│  1. Cliente clica "Login with Google/Facebook"     │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  2. Redirecionado para página de login do Provider │
│     (Google ou Facebook)                            │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  3. Cliente autoriza acesso (primeira vez)          │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  4. Redirect de volta para Supabase callback URL   │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  5. Supabase cria/atualiza usuário                  │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  6. Cliente redirecionado de volta para app         │
│     (já autenticado)                                │
└─────────────────────────────────────────────────────┘
```

---

## 🔒 DADOS DO USUÁRIO

### O que você recebe do Google:
```json
{
  "id": "google-user-id",
  "email": "cliente@gmail.com",
  "user_metadata": {
    "name": "João Silva",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "email_verified": true,
    "provider": "google"
  }
}
```

### O que você recebe do Facebook:
```json
{
  "id": "facebook-user-id",
  "email": "cliente@email.com",
  "user_metadata": {
    "name": "João Silva",
    "avatar_url": "https://graph.facebook.com/.../picture",
    "email_verified": true,
    "provider": "facebook"
  }
}
```

---

## ⚠️ PROBLEMAS COMUNS

### Google: "redirect_uri_mismatch"

**Causa:** URL de redirect não corresponde ao configurado

**Solução:**
1. Google Cloud Console → Credentials
2. Editar OAuth 2.0 Client
3. Adicionar URL exata:
   ```
   https://[project-id].supabase.co/auth/v1/callback
   ```
4. Aguardar 5 minutos para propagar

### Facebook: "URL Blocked"

**Causa:** Domínio não autorizado

**Solução:**
1. Facebook App → Settings → Basic
2. Adicionar domínio em "App Domains"
3. Salvar mudanças

### Supabase: "Invalid provider credentials"

**Causa:** Client ID ou Secret incorretos

**Solução:**
1. Verificar credenciais copiadas
2. Confirmar que não há espaços extras
3. Re-copiar do console do provider
4. Salvar novamente no Supabase

### "Email not verified"

**Causa:** Email do provider não verificado

**Solução:**
1. Cliente deve verificar email no Google/Facebook
2. Ou configurar Supabase para aceitar emails não verificados:
   - Authentication → Settings
   - Desativar "Confirm email"

---

## 🎨 CUSTOMIZAÇÃO UI

### Botões Prontos (já implementados)

O componente `AuthModal.tsx` já inclui:

```typescript
// Botão Google com ícone oficial
<button onClick={handleGoogleSignIn}>
  <GoogleIcon />
  Continuar com Google
</button>

// Botão Facebook com ícone oficial  
<button onClick={handleFacebookSignIn}>
  <FacebookIcon />
  Continuar com Facebook
</button>
```

### Personalizar Cores

```css
/* Google - Azul #4285F4 */
.google-button {
  background: #4285F4;
  color: white;
}

/* Facebook - Azul #1877F2 */
.facebook-button {
  background: #1877F2;
  color: white;
}
```

---

## 📱 MOBILE COMPATIBILITY

### Teste em Dispositivos Móveis

1. **Google:** Funciona nativamente
2. **Facebook:** Pode abrir app Facebook instalado
3. **Fallback:** Sempre abre navegador web

### Deep Links

Para melhor experiência mobile, configure:

```typescript
// No Supabase Auth options
{
  redirectTo: window.location.origin,
  // Para mobile apps:
  // redirectTo: 'myapp://auth/callback'
}
```

---

## 🔐 SEGURANÇA

### Práticas Recomendadas

1. **HTTPS Obrigatório** em produção
2. **Validar emails** após login social
3. **Rate limiting** em tentativas de login
4. **Monitorar** logins suspeitos
5. **2FA opcional** para contas sensíveis

### Proteção de Dados

```typescript
// Dados armazenados no Supabase
// ✅ Criptografados em repouso
// ✅ Transmitidos via HTTPS
// ✅ Tokens com expiração
// ✅ Refresh tokens seguros
```

---

## 📊 ANALYTICS

### Rastrear Métodos de Login

```typescript
// Após login bem-sucedido
const trackLoginMethod = (provider: string) => {
  // Google Analytics
  gtag('event', 'login', {
    method: provider
  });
  
  // Ou seu sistema de analytics
  analytics.track('User Logged In', {
    method: provider,
    timestamp: new Date()
  });
};

// No componente
const handleGoogleSignIn = async () => {
  await signInWithGoogle();
  trackLoginMethod('google');
};
```

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### Google OAuth
- [ ] Projeto criado no Google Cloud
- [ ] Google+ API ativada
- [ ] Tela de consentimento configurada
- [ ] Credenciais OAuth criadas
- [ ] Redirect URI configurado
- [ ] Client ID e Secret copiados
- [ ] Configurado no Supabase
- [ ] Testado com sucesso

### Facebook OAuth
- [ ] App criado no Facebook Developers
- [ ] Facebook Login adicionado
- [ ] Redirect URI configurado
- [ ] App ID e Secret copiados
- [ ] Domínios autorizados
- [ ] Configurado no Supabase
- [ ] App publicado (para produção)
- [ ] Testado com sucesso

### Código Frontend
- [ ] `AuthModal.tsx` criado
- [ ] `useAuth.tsx` atualizado
- [ ] Botões de login social implementados
- [ ] Tratamento de erros
- [ ] Feedback visual ao usuário

---

## 🚀 DEPLOYMENT

### Antes de ir para Produção

1. **Google:**
   - Verificar tela de consentimento
   - Publicar app (se necessário)
   - Testar com múltiplos usuários

2. **Facebook:**
   - Completar App Review
   - Mudar para modo "Live"
   - Adicionar política de privacidade
   - Adicionar ícone e screenshots

3. **Supabase:**
   - Confirmar URLs de produção
   - Testar fluxo completo
   - Configurar emails de verificação

---

## 📞 SUPORTE

### Documentação Oficial

- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Facebook Login:** https://developers.facebook.com/docs/facebook-login

### Troubleshooting

- **Supabase Discord:** https://discord.supabase.com
- **Stack Overflow:** Tag `supabase`
- **GitHub Issues:** https://github.com/supabase/supabase/issues

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Agora:** Configurar Google OAuth (30 min)
2. ✅ **Depois:** Configurar Facebook OAuth (30 min)
3. ✅ **Testar:** Ambos os métodos de login
4. 📱 **Opcional:** Adicionar Apple Sign In
5. 🔐 **Futuro:** Implementar 2FA

---

**Guia criado por:** KZSTORE / BVLE CAPITAL  
**Data:** Dezembro 2024  
**Versão:** 1.0  
**Status:** Pronto para implementação ✅
