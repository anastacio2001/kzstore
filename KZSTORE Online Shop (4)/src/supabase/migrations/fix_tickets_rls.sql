-- FIX RLS para Tickets - Versão Simplificada SEM dependência de users

-- 1. Dropar TODAS as políticas antigas
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_update_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_full_access_tickets" ON tickets;
DROP POLICY IF EXISTS "system_can_assign_tickets" ON tickets;

DROP POLICY IF EXISTS "users_can_view_own_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_full_access_messages" ON ticket_messages;

-- 2. Criar políticas SUPER SIMPLES que usam apenas auth.uid()

-- TICKETS: Ver próprios tickets
CREATE POLICY "users_can_view_own_tickets" 
ON tickets FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- TICKETS: Criar tickets
CREATE POLICY "users_can_create_tickets" 
ON tickets FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- TICKETS: Atualizar próprios tickets
CREATE POLICY "users_can_update_own_tickets" 
ON tickets FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- TICKET_MESSAGES: Ver mensagens dos próprios tickets
CREATE POLICY "users_can_view_own_messages" 
ON ticket_messages FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

-- TICKET_MESSAGES: Criar mensagens nos próprios tickets
CREATE POLICY "users_can_create_messages" 
ON ticket_messages FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

-- 3. Garantir que RLS está ativado
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4. Conceder permissões
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON ticket_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
