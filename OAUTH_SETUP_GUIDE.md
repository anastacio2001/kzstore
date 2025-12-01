# Configuração OAuth - Google e Facebook

## ✅ Google OAuth - CORRIGIR REDIRECT URI

### Passo 1: Acessar Google Cloud Console
1. Acesse: https://console.cloud.google.com/apis/credentials?project=kzstore-477422
2. Clique no OAuth Client ID existente: `341392738431-cql0059qvscfe2r61uiepar5hst18pod`

### Passo 2: Adicionar URIs de Redirecionamento
Adicione as seguintes URIs na seção "Authorized redirect URIs":

**Produção:**
```
https://kzstore-341392738431.europe-southwest1.run.app/api/auth/google/callback
```

**Local (se ainda não tiver):**
```
http://localhost:3000/api/auth/google/callback
http://localhost:8080/api/auth/google/callback
```

### Passo 3: Salvar
Clique em "SAVE" (pode levar alguns minutos para propagar)

---

## 🔵 Facebook OAuth - CONFIGURAR

### Passo 1: Criar App no Facebook Developers
1. Acesse: https://developers.facebook.com/apps/
2. Clique em "Create App"
3. Escolha "Consumer" como tipo
4. Nome do app: "KZSTORE"
5. Email de contato: l.anastacio001@gmail.com

### Passo 2: Adicionar Facebook Login
1. No Dashboard do App, clique em "Add Product"
2. Selecione "Facebook Login"
3. Escolha "Settings" no menu lateral

### Passo 3: Configurar OAuth Redirect URIs
Adicione em "Valid OAuth Redirect URIs":

```
https://kzstore-341392738431.europe-southwest1.run.app/api/auth/facebook/callback
http://localhost:3000/api/auth/facebook/callback
http://localhost:8080/api/auth/facebook/callback
```

### Passo 4: Obter Credenciais
1. Vá em "Settings" > "Basic"
2. Copie o "App ID" 
3. Clique em "Show" para ver o "App Secret"

### Passo 5: Adicionar Secrets no Google Cloud
Execute os comandos:

```bash
# Facebook App ID
echo -n "SEU_APP_ID_AQUI" | gcloud secrets create FACEBOOK_APP_ID --data-file=- --replication-policy="automatic"

# Facebook App Secret
echo -n "SEU_APP_SECRET_AQUI" | gcloud secrets create FACEBOOK_APP_SECRET --data-file=- --replication-policy="automatic"
```

### Passo 6: Atualizar Cloud Run
```bash
gcloud run services update kzstore --region=europe-southwest1 \
  --update-secrets=FACEBOOK_APP_ID=FACEBOOK_APP_ID:latest,FACEBOOK_APP_SECRET=FACEBOOK_APP_SECRET:latest
```

---

## 🚀 Deploy das Correções

Após fazer as alterações no código, execute:

```bash
cd /Users/UTENTE1/Desktop/KZSTORE\ Online\ Shop-2
gcloud builds submit --config=cloudbuild.yaml .
```

---

## ✅ Testar

1. **Google Login**: Aguarde 5-10 minutos após adicionar as URIs
2. **Facebook Login**: Teste após configurar o app e fazer deploy

---

## 📝 Variáveis Atuais

**Google:**
- Client ID: `341392738431-cql0059qvscfe2r61uiepar5hst18pod.apps.googleusercontent.com`
- Client Secret: (já configurado no Secret Manager)

**Facebook:**
- App ID: (a configurar)
- App Secret: (a configurar)
