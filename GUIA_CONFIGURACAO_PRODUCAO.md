# 🚀 Guia de Configuração de Produção - KZSTORE

## 📋 Variáveis de Ambiente para Cloud Run

Para o chatbot IA e emails funcionarem em produção, você precisa configurar estas variáveis de ambiente no Google Cloud Run:

### 1️⃣ **Chatbot IA (Google Gemini)**

```bash
VITE_GEMINI_API_KEY=AIzaSyCVoEhEyOUbpBlYczM6NcGOU-Fc5hZd1PE
```

### 2️⃣ **Email (Resend)**

```bash
RESEND_API_KEY=re_jjyJF16u_3zkM9UCPMz2YtgjKmU4D4qqt
RESEND_FROM_EMAIL=noreply@kzstore.ao
RESEND_FROM_NAME=KZSTORE Angola
```

### 3️⃣ **Banco de Dados**

```bash
DATABASE_URL=mysql://kzstore_app:Kzstore2024!@/cloudsql/kzstore-442520:us-central1:kzstore-mysql/kzstore_prod
```

### 4️⃣ **JWT (Autenticação)**

```bash
JWT_SECRET=6c903c0b0f39f7eac446135dbfc59bff7bbe94c6c7142b8693017cafdb5655be0ceed41bae625bf961682a1f5c97eeaea1f91db1bbd8545b236d09c61751ff0c
JWT_EXPIRES_IN=30d
```

### 5️⃣ **URLs e Configurações**

```bash
FRONTEND_URL=https://kzstore.ao
NODE_ENV=production
PORT=8080
```

---

## 🔧 Como Configurar no Google Cloud Run

### **Opção 1: Via Console Web (Recomendado)**

1. Acesse: https://console.cloud.google.com/run
2. Clique no seu serviço `kzstore-api`
3. Clique em **"EDIT & DEPLOY NEW REVISION"**
4. Role até **"Container, Variables & Secrets"**
5. Na aba **"VARIABLES & SECRETS"**, clique em **"+ ADD VARIABLE"**
6. Adicione CADA variável acima:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `AIzaSyCVoEhEyOUbpBlYczM6NcGOU-Fc5hZd1PE`
7. Repita para todas as variáveis
8. Clique em **"DEPLOY"**

### **Opção 2: Via gcloud CLI**

```bash
# Configurar todas as variáveis de uma vez
gcloud run services update kzstore-api \
  --region=us-central1 \
  --update-env-vars="VITE_GEMINI_API_KEY=AIzaSyCVoEhEyOUbpBlYczM6NcGOU-Fc5hZd1PE,RESEND_API_KEY=re_jjyJF16u_3zkM9UCPMz2YtgjKmU4D4qqt,RESEND_FROM_EMAIL=noreply@kzstore.ao,RESEND_FROM_NAME=KZSTORE Angola,JWT_SECRET=6c903c0b0f39f7eac446135dbfc59bff7bbe94c6c7142b8693017cafdb5655be0ceed41bae625bf961682a1f5c97eeaea1f91db1bbd8545b236d09c61751ff0c,JWT_EXPIRES_IN=30d,FRONTEND_URL=https://kzstore.ao,NODE_ENV=production"
```

---

## ✅ Verificação Pós-Deploy

Após configurar e fazer deploy, teste:

### 1. **Chatbot IA**
- Acesse https://kzstore.ao
- Clique no botão do chatbot (canto inferior direito)
- Digite uma mensagem
- ✅ Deve responder com IA

### 2. **Emails**
- Faça um pedido de teste
- ✅ Deve receber email de confirmação em `leuboy30@gmail.com`

### 3. **Formulário de Contato**
- Acesse https://kzstore.ao/contato
- Preencha e envie
- ✅ Deve receber email com os dados do cliente

---

## 🔍 Troubleshooting

### Chatbot não funciona?

1. Verifique se `VITE_GEMINI_API_KEY` está configurada
2. Veja os logs:
   ```bash
   gcloud run services logs read kzstore-api --region=us-central1 --limit=50
   ```
3. Procure por erros relacionados a "GEMINI_API_KEY"

### Emails não chegam?

1. Verifique se `RESEND_API_KEY` está configurada
2. Teste o domínio kzstore.ao em: https://resend.com/domains
3. Veja os logs de envio no painel Resend

---

## 📦 Deploy Completo

Após configurar as variáveis, faça o deploy:

```bash
cd /Users/UTENTE1/Desktop/KZSTORE\ Online\ Shop-2

# 1. Build do frontend
npm run build

# 2. Deploy no Cloud Run
gcloud run deploy kzstore-api \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

---

## 🎯 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Todas as variáveis de ambiente configuradas no Cloud Run
- [ ] Chatbot IA respondendo corretamente
- [ ] Emails de confirmação de pedido funcionando
- [ ] Formulário de contato enviando emails
- [ ] Password recovery funcionando
- [ ] Google OAuth funcionando
- [ ] Links de redes sociais corretos (Facebook, Instagram)
- [ ] Contraste de texto nas páginas FAQ, Sobre, Contato

---

## 🆘 Suporte

Se tiver problemas:

1. Verifique os logs do Cloud Run
2. Teste localmente primeiro: `npm run dev` + `npx tsx server.ts`
3. Confirme que as API keys estão válidas
4. Verifique se o domínio kzstore.ao está ativo

---

**Última atualização:** 29 de Novembro de 2025
**Status:** ✅ Pronto para produção
