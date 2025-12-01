# Configuração do Google OAuth

## Passos para configurar o Google Login:

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/

### 2. Crie ou selecione um projeto
- Se ainda não tem projeto, clique em "Novo Projeto"
- Nome sugerido: "KZStore OAuth"

### 3. Ative a Google+ API
- Menu > APIs & Services > Library
- Procure por "Google+ API"
- Clique em "Ativar"

### 4. Crie credenciais OAuth 2.0
- Menu > APIs & Services > Credentials
- Clique em "+ CREATE CREDENTIALS" > "OAuth client ID"
- Application type: "Web application"
- Name: "KZStore Web Client"

### 5. Configure as URLs autorizadas
**Origens JavaScript autorizadas:**
```
http://localhost:5173
https://kzstore.ao
```

**URIs de redirecionamento autorizados:**
```
http://localhost:5173
https://kzstore.ao
```

### 6. Copie o Client ID
- Após criar, você verá o Client ID
- Exemplo: `123456789-abc123.apps.googleusercontent.com`

### 7. Configure a variável de ambiente
Adicione no arquivo `.env`:
```
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
```

### 8. Configure a tela de consentimento OAuth
- Menu > APIs & Services > OAuth consent screen
- User Type: "External"
- App name: "KZStore"
- User support email: l.anastacio001@gmail.com
- Developer contact: l.anastacio001@gmail.com
- Scopes: email, profile, openid

### 9. Adicione usuários de teste (se app não publicado)
- Na tela de consentimento OAuth
- Seção "Test users"
- Adicione os emails que podem fazer login durante os testes

### 10. Rebuild e deploy
```bash
npm run build
gcloud builds submit --tag europe-southwest1-docker.pkg.dev/kzstore-477422/kzstore/kzstore:latest
gcloud run deploy kzstore --image europe-southwest1-docker.pkg.dev/kzstore-477422/kzstore/kzstore:latest --platform managed --region europe-southwest1 --allow-unauthenticated
```

## Como funciona o fluxo OAuth:

1. **Frontend**: Usuário clica no botão "Google"
2. **Google SDK**: Abre popup de login do Google
3. **Google**: Retorna ID Token após autenticação
4. **Frontend**: Envia ID Token para `/api/auth/oauth/google`
5. **Backend**: Verifica token com `https://oauth2.googleapis.com/tokeninfo?id_token=...`
6. **Backend**: Cria/atualiza usuário e retorna JWT token
7. **Frontend**: Salva JWT e redireciona usuário

## Configuração atual:

### Facebook OAuth ✅
- **App ID**: 1126992036171396
- **App Secret**: 7b93c1ac74c63a3524dd7c98be3fdb3b
- **Status**: Configurado e pronto

### Google OAuth ⚠️
- **Client ID**: Precisa ser criado
- **Status**: Código implementado, aguardando credenciais

## Troubleshooting:

### Erro: "Google Login não configurado"
- Verifique se VITE_GOOGLE_CLIENT_ID está no .env
- Rebuild o projeto após adicionar a variável

### Erro: "redirect_uri_mismatch"
- Adicione a URL atual nas "URIs de redirecionamento autorizados"
- Espere alguns minutos para propagação das mudanças

### Erro: "Access blocked: This app's request is invalid"
- Configure a tela de consentimento OAuth
- Adicione seu email nos usuários de teste

## Links úteis:
- Console: https://console.cloud.google.com/
- Documentação: https://developers.google.com/identity/gsi/web/guides/overview
- Guia de setup: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
