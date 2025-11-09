# Sistema de Notificações por Email - Guia de Configuração

## 📧 Configuração do Resend.com

### 1. Criar Conta no Resend
1. Acesse: https://resend.com/signup
2. Crie uma conta gratuita (permite 100 emails/dia)
3. Confirme seu email

### 2. Obter API Key
1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome: `KZSTORE Ticket Emails`
4. Copie a API key gerada

### 3. Verificar Domínio (Opcional - para produção)
Para emails em produção, você precisa verificar seu domínio:

1. No Resend Dashboard → **Domains**
2. Clique em **Add Domain**
3. Digite: `kzstore.ao`
4. Adicione os registros DNS fornecidos no seu provedor de domínio:
   - TXT record para verificação
   - CNAME records para DKIM
   - MX records (opcional)

**Para testes**, você pode usar o domínio sandbox do Resend: `onboarding@resend.dev`

---

## ⚙️ Configuração no Supabase

### 1. Adicionar API Key como Environment Variable

1. Acesse: https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/settings/functions
2. Em **Edge Functions Secrets**, adicione:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cole a API key do Resend
3. Clique em **Save**

### 2. Criar Tabela de Logs

Execute o SQL no **SQL Editor** do Supabase:

```sql
-- Copie o conteúdo do arquivo: src/supabase/migrations/add_email_logs.sql
```

### 3. Deploy da Edge Function

No terminal, dentro da pasta do projeto:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link com o projeto
supabase link --project-ref duxeeawfyxcciwlyjllk

# Deploy da função
supabase functions deploy send-ticket-email
```

### 4. Testar a Função

Após o deploy, teste via curl:

```bash
curl -i --location --request POST \
  'https://duxeeawfyxcciwlyjllk.supabase.co/functions/v1/send-ticket-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "new_ticket",
    "ticketId": "test-123",
    "userEmail": "seu-email@gmail.com",
    "userName": "Teste User",
    "subject": "Problema com produto",
    "message": "Descrição do problema...",
    "ticketUrl": "https://kzstore.ao/tickets/test-123"
  }'
```

Se retornar `{"success": true, "messageId": "..."}`, está funcionando! ✅

---

## 🔗 Integração Automática

A integração já está preparada no código frontend:

1. **Quando usuário cria ticket** → Email enviado para admin
2. **Quando admin responde** → Email enviado para usuário

### Emails dos Admins

Por padrão, emails são enviados para: `leuboy30@gmail.com`

Para adicionar mais admins, edite a função:
- Arquivo: `supabase/functions/send-ticket-email/index.ts`
- Linha: `toEmail = 'leuboy30@gmail.com'`
- Altere para array: `toEmail = ['admin1@kzstore.ao', 'admin2@kzstore.ao']`

---

## 📝 Resumo dos Arquivos

### Edge Function
- **Localização**: `supabase/functions/send-ticket-email/index.ts`
- **Função**: Enviar emails via Resend API
- **Tipos suportados**: `new_ticket`, `admin_response`

### Migration SQL
- **Localização**: `src/supabase/migrations/add_email_logs.sql`
- **Função**: Criar tabela de logs de emails

### Hook Frontend (próximo passo)
- **Localização**: `src/hooks/useTickets.tsx`
- **Função**: Chamar Edge Function ao criar/responder tickets

---

## ✅ Checklist de Configuração

- [ ] Conta criada no Resend.com
- [ ] API Key copiada
- [ ] API Key adicionada no Supabase (Secrets)
- [ ] Tabela `ticket_email_logs` criada (SQL executado)
- [ ] Edge Function deployed via CLI
- [ ] Teste de email funcionando
- [ ] Integração no frontend ativada

---

## 🚀 Próximos Passos

Depois de configurar:

1. Execute a migration SQL no Supabase
2. Deploy da Edge Function
3. Teste enviando um email
4. Ative a integração no frontend (próxima etapa)

Qualquer erro, verifique os logs da função:
https://supabase.com/dashboard/project/duxeeawfyxcciwlyjllk/functions/send-ticket-email/logs
