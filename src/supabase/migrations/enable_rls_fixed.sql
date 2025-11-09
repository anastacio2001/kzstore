-- REATIVAR RLS COM POLÍTICAS SEGURAS - VERSÃO CORRIGIDA
-- Esta versão NÃO acessa a tabela auth.users diretamente

-- 1. Primeiro, dropar políticas antigas se existirem
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_rate_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_view_all_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_update_all_tickets" ON tickets;

DROP POLICY IF EXISTS "users_can_view_own_ticket_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages_own_tickets" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_view_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_create_all_messages" ON ticket_messages;

-- 2. Revogar permissões amplas
REVOKE ALL ON tickets FROM anon;
REVOKE ALL ON ticket_messages FROM anon;

-- 3. Reativar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4. TICKETS - Políticas SIMPLIFICADAS (sem acessar auth.users)
-- Permite usuários verem seus próprios tickets E admins verem todos
CREATE POLICY "users_and_admins_view_tickets" 
ON tickets FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR 
  auth.jwt()->>'email' = 'admin@kzstore.ao'
  OR
  (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
);

-- Usuários podem criar tickets (force user_id = auth.uid())
CREATE POLICY "users_can_create_tickets" 
ON tickets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus tickets (rating) E admins podem atualizar todos
CREATE POLICY "users_and_admins_update_tickets" 
ON tickets FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR 
  auth.jwt()->>'email' = 'admin@kzstore.ao'
  OR
  (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
);

-- 5. TICKET_MESSAGES - Políticas SIMPLIFICADAS
-- Usuários veem mensagens dos seus tickets E admins veem todas
CREATE POLICY "users_and_admins_view_messages" 
ON ticket_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND (
      tickets.user_id = auth.uid()
      OR
      auth.jwt()->>'email' = 'admin@kzstore.ao'
      OR
      (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
    )
  )
);

-- Usuários criam mensagens nos seus tickets E admins em qualquer ticket
CREATE POLICY "users_and_admins_create_messages" 
ON ticket_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND (
      tickets.user_id = auth.uid()
      OR
      auth.jwt()->>'email' = 'admin@kzstore.ao'
      OR
      (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
    )
  )
);

-- 6. Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 8. Comentários
COMMENT ON POLICY "users_and_admins_view_tickets" ON tickets IS 
'Permite usuários verem seus tickets e admins verem todos (via JWT claims)';

COMMENT ON POLICY "users_and_admins_view_messages" ON ticket_messages IS 
'Permite usuários verem mensagens dos seus tickets e admins todas (via JWT claims)';
