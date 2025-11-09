# Configuração de Notificações por Email - KZSTORE

## 📧 Sistema de Emails Implementado

O sistema de tickets agora envia emails automaticamente para:
1. **Admin** quando um novo ticket é criado
2. **Usuário** quando o admin responde ao ticket
3. **Usuário** quando o status do ticket muda

---

## 🚀 Setup do Resend.com (Serviço de Email)

### 1. Criar conta no Resend
1. Acesse: https://resend.com
2. Crie uma conta gratuita (100 emails/dia grátis)
3. Verifique seu email

### 2. Obter API Key
1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Nome: `KZSTORE Production`
4. Permissões: **Sending access**
5. Copie a chave gerada (começa com `re_...`)

### 3. Configurar domínio (Opcional mas Recomendado)
1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite: `kzstore.ao`
4. Adicione os registros DNS fornecidos no seu provedor de domínio:
   - **DKIM**: Record TXT
   - **SPF**: Record TXT  
   - **DMARC**: Record TXT

**Registros DNS típicos:**
```
Type: TXT
Name: resend._domainkey
Value: [fornecido pelo Resend]

Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

---

## 🔧 Configurar no Supabase

### 1. Adicionar variáveis de ambiente
1. Acesse o Dashboard do Supabase
2. Vá em **Settings** → **Edge Functions** → **Environment Variables**
3. Adicione a variável:

```
RESEND_API_KEY=re_sua_chave_aqui
```

### 2. Deploy da função
Execute no terminal:

```bash
cd "KZSTORE Online Shop (4)"

# Deploy da função de email
supabase functions deploy send-ticket-email --no-verify-jwt
```

### 3. Testar a função
```bash
# Criar um novo ticket pela UI e verificar:
# 1. Email chegou no admin (leuboy30@gmail.com)
# 2. Responder como admin e verificar email do usuário
# 3. Mudar status e verificar email do usuário
```

---

## 📨 Emails Enviados

### 1. Novo Ticket (para Admin)
- **De:** suporte@kzstore.ao (ou resend.dev se domínio não verificado)
- **Para:** leuboy30@gmail.com
- **Assunto:** 🎫 Novo Ticket #XXXXXXXX - [Assunto]
- **Conteúdo:** Detalhes completos do ticket + link para responder

### 2. Resposta do Admin (para Usuário)
- **De:** suporte@kzstore.ao
- **Para:** email do usuário
- **Assunto:** ✅ Resposta ao seu Ticket #XXXXXXXX - [Assunto]
- **Conteúdo:** Mensagem do admin + link para ver o ticket

### 3. Mudança de Status (para Usuário)
- **De:** suporte@kzstore.ao
- **Para:** email do usuário
- **Assunto:** 🔄 Status do Ticket #XXXXXXXX atualizado
- **Conteúdo:** Novo status + link para ver o ticket

---

## 🎨 Templates de Email

Os templates estão em:
`/supabase/functions/send-ticket-email/index.ts`

**Características:**
- ✅ Design responsivo (mobile + desktop)
- ✅ Cores da marca KZSTORE (#E31E24)
- ✅ Emojis para melhor UX
- ✅ Botões de ação (CTA)
- ✅ Links diretos para os tickets
- ✅ Footer com informações de contato

---

## 🔍 Debugging

### Ver logs da função
```bash
supabase functions logs send-ticket-email --project-ref duxeeawfyxcciwlyjllk
```

### Testar envio manualmente
```bash
curl -X POST https://duxeeawfyxcciwlyjllk.supabase.co/functions/v1/send-ticket-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "new_ticket",
    "ticketId": "UUID_DO_TICKET",
    "recipientEmail": "teste@example.com",
    "recipientName": "Teste"
  }'
```

---

## ⚠️ Troubleshooting

### Emails não chegam
1. Verifique se a API Key está correta no Supabase
2. Verifique spam/lixo eletrônico
3. Se usando domínio customizado, verifique DNS records
4. Veja os logs da função: `supabase functions logs send-ticket-email`

### Função retorna erro
1. Verifique se `RESEND_API_KEY` está configurada
2. Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` existem (automáticas)
3. Redeploy a função: `supabase functions deploy send-ticket-email`

### Email vai para spam
1. Configure SPF, DKIM e DMARC no DNS
2. Use domínio verificado no Resend
3. Adicione link de unsubscribe (opcional)

---

## 📊 Monitoramento

### Dashboard do Resend
- Acesse: https://resend.com/emails
- Veja emails enviados, entregas, bounces, etc.

### Logs do Supabase
```bash
supabase functions logs send-ticket-email --tail
```

---

## 💡 Melhorias Futuras

- [ ] Adicionar template para ticket resolvido
- [ ] Permitir usuário escolher receber ou não emails
- [ ] Adicionar botão "responder por email"
- [ ] Enviar resumo semanal de tickets para admin
- [ ] Adicionar anexos nos emails (imagens do ticket)

---

## ✅ Checklist de Produção

- [ ] Conta Resend criada
- [ ] API Key gerada
- [ ] Variável RESEND_API_KEY configurada no Supabase
- [ ] Função deployed com sucesso
- [ ] Domínio kzstore.ao verificado (opcional)
- [ ] DNS records configurados (opcional)
- [ ] Testado envio de novo ticket
- [ ] Testado resposta de admin
- [ ] Testado mudança de status
- [ ] Emails chegando sem ir para spam

---

## 📞 Suporte

Se tiver problemas:
1. Veja os logs: `supabase functions logs send-ticket-email`
2. Verifique o Dashboard do Resend
3. Entre em contato: leuboy30@gmail.com
