-- REATIVAR RLS COM POLÍTICAS SEGURAS PARA PRODUÇÃO

-- 1. Revogar permissões amplas
REVOKE ALL ON tickets FROM anon;
REVOKE ALL ON ticket_messages FROM anon;

-- 2. Reativar RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 3. TICKETS - Políticas para usuários
-- Usuários podem ver apenas seus próprios tickets
CREATE POLICY "users_can_view_own_tickets" 
ON tickets FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Usuários podem criar tickets
CREATE POLICY "users_can_create_tickets" 
ON tickets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas o campo satisfaction_rating dos próprios tickets
CREATE POLICY "users_can_rate_own_tickets" 
ON tickets FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. TICKETS - Políticas para admins
-- Admin pode ver todos os tickets
CREATE POLICY "admins_can_view_all_tickets" 
ON tickets FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email = 'admin@kzstore.ao' 
      OR auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Admin pode atualizar qualquer ticket
CREATE POLICY "admins_can_update_all_tickets" 
ON tickets FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email = 'admin@kzstore.ao' 
      OR auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 5. TICKET_MESSAGES - Políticas para usuários
-- Usuários podem ver mensagens dos seus tickets
CREATE POLICY "users_can_view_own_ticket_messages" 
ON ticket_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND tickets.user_id = auth.uid()
  )
);

-- Usuários podem criar mensagens nos seus tickets
CREATE POLICY "users_can_create_messages_own_tickets" 
ON ticket_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND tickets.user_id = auth.uid()
  )
  AND ticket_messages.is_admin = false
);

-- 6. TICKET_MESSAGES - Políticas para admins
-- Admin pode ver todas as mensagens
CREATE POLICY "admins_can_view_all_messages" 
ON ticket_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email = 'admin@kzstore.ao' 
      OR auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- Admin pode criar mensagens em qualquer ticket
CREATE POLICY "admins_can_create_all_messages" 
ON ticket_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.email = 'admin@kzstore.ao' 
      OR auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 7. Garantir permissões básicas para authenticated
GRANT SELECT, INSERT ON tickets TO authenticated;
GRANT UPDATE (satisfaction_rating, satisfaction_comment) ON tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Criar índice para melhorar performance das queries de admin
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Comentários de documentação
COMMENT ON POLICY "users_can_view_own_tickets" ON tickets IS 
'Permite usuários verem apenas seus próprios tickets';

COMMENT ON POLICY "admins_can_view_all_tickets" ON tickets IS 
'Permite admins (admin@kzstore.ao ou role=admin) verem todos os tickets';

COMMENT ON POLICY "users_can_view_own_ticket_messages" ON ticket_messages IS 
'Permite usuários verem mensagens apenas dos seus próprios tickets';

COMMENT ON POLICY "admins_can_view_all_messages" ON ticket_messages IS 
'Permite admins verem todas as mensagens de todos os tickets';
