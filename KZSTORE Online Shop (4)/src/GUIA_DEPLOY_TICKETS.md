# 🚀 GUIA RÁPIDO - DEPLOY DO SISTEMA DE TICKETS

## ⚡ 3 PASSOS PARA ATIVAR

### 1️⃣ **Executar SQL no Supabase** (2 minutos)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto KZSTORE
3. Vá para **SQL Editor** (menu lateral esquerdo)
4. Clique em **+ New Query**
5. Copie **TODO** o conteúdo de `/supabase/migrations/tickets_schema.sql`
6. Cole no editor
7. Clique em **Run** (ou `Ctrl+Enter`)
8. Aguarde mensagem de sucesso ✅

**Resultado esperado:**
```
Success. No rows returned
```

---

### 2️⃣ **Verificar Tabelas Criadas** (1 minuto)

1. Vá para **Table Editor** (menu lateral)
2. Você deve ver **2 novas tabelas:**
   - ✅ `tickets`
   - ✅ `ticket_messages`
3. Clique em cada uma para ver as colunas

**Estrutura esperada:**

**`tickets`:**
- id, user_id, subject, description
- category, priority, status
- assigned_to, created_at, updated_at
- resolved_at, satisfaction_rating, satisfaction_comment

**`ticket_messages`:**
- id, ticket_id, user_id
- message, is_admin, attachments
- created_at

---

### 3️⃣ **Testar no Frontend** (3 minutos)

1. Abra http://localhost:3001/
2. Faça login com sua conta
3. Clique no **ícone de usuário** (canto superior direito)
4. Selecione **"Meus Tickets"**
5. Clique em **"+ Novo Ticket"**
6. Preencha:
   - **Assunto:** Teste de ticket
   - **Descrição:** Testando o sistema
   - **Categoria:** Produto
   - **Prioridade:** Média
7. Clique em **"Criar Ticket"**
8. ✅ **Ticket criado!**
9. Clique no ticket para ver detalhes
10. Digite uma mensagem e clique **"Enviar"**
11. ✅ **Chat funcionando!**

---

## 🔍 VERIFICAÇÕES

### Banco de Dados:
```sql
-- Contar tickets criados
SELECT COUNT(*) FROM tickets;

-- Ver todos os tickets
SELECT * FROM tickets ORDER BY created_at DESC;

-- Ver mensagens do ticket
SELECT * FROM ticket_messages WHERE ticket_id = 'seu-ticket-id';
```

### RLS (Row Level Security):
```sql
-- Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename IN ('tickets', 'ticket_messages');
```

Deve listar **8 políticas:**
- 5 em `tickets`
- 3 em `ticket_messages`

---

## ⚠️ TROUBLESHOOTING

### Problema: "Failed to create ticket"
**Solução:**
1. Verifique se executou o SQL completo
2. Verifique se está logado
3. Verifique console do navegador (F12)

### Problema: "Failed to load tickets"
**Solução:**
1. Verifique se RLS está habilitado
2. Verifique se políticas foram criadas
3. Verifique token de autenticação

### Problema: Não aparece opção "Meus Tickets" no menu
**Solução:**
1. Faça logout e login novamente
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Reinicie o servidor (`npm run dev`)

---

## 📊 DADOS DE TESTE

Se quiser popular com dados de teste:

```sql
-- Inserir ticket de teste (substitua USER_ID pelo seu UUID)
INSERT INTO tickets (user_id, subject, description, category, priority, status)
VALUES (
  'seu-user-id-aqui',
  'Problema com entrega',
  'Meu pedido ainda não chegou após 5 dias',
  'shipping',
  'high',
  'open'
);

-- Inserir mensagem de teste
INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin)
VALUES (
  'id-do-ticket-criado',
  'seu-user-id-aqui',
  'Olá, preciso de ajuda urgente!',
  false
);

-- Inserir resposta do admin
INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin)
VALUES (
  'id-do-ticket-criado',
  'id-do-admin',
  'Vamos verificar seu pedido agora mesmo!',
  true
);
```

Para obter seu `user_id`:
```sql
-- Ver usuários cadastrados
SELECT id, email FROM auth.users;
```

---

## ✅ CHECKLIST FINAL

Antes de considerar pronto:

- [ ] SQL executado sem erros
- [ ] Tabelas `tickets` e `ticket_messages` criadas
- [ ] RLS habilitado em ambas tabelas
- [ ] 8 políticas criadas
- [ ] Frontend carrega sem erros
- [ ] Menu "Meus Tickets" aparece quando logado
- [ ] Consegue criar novo ticket
- [ ] Consegue ver lista de tickets
- [ ] Consegue abrir detalhes do ticket
- [ ] Consegue enviar mensagem no chat
- [ ] Mensagens aparecem corretamente
- [ ] Consegue avaliar ticket resolvido (se aplicável)

---

## 🎉 PRONTO!

Seu **Sistema de Tickets** está funcionando!

Agora seus clientes podem:
- ✅ Criar tickets de suporte
- ✅ Acompanhar status
- ✅ Conversar com o suporte via chat
- ✅ Avaliar o atendimento

**Documentação completa:** `SISTEMA_TICKETS_IMPLEMENTADO.md`

**Próximo passo:** Implementar Admin Ticket Manager para gerenciar tickets! 🚀
