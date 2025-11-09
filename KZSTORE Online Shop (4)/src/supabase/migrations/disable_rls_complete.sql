-- DESABILITAR RLS NOVAMENTE PARA TESTES
-- Versão simplificada que funciona 100%

-- 1. Dropar TODAS as políticas
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_rate_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_view_all_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_can_update_all_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_view_tickets" ON tickets;
DROP POLICY IF EXISTS "users_and_admins_update_tickets" ON tickets;

DROP POLICY IF EXISTS "users_can_view_own_ticket_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages_own_tickets" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_view_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_can_create_all_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_view_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_and_admins_create_messages" ON ticket_messages;

-- 2. DESABILITAR RLS completamente
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages DISABLE ROW LEVEL SECURITY;

-- 3. Conceder permissões completas
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON tickets TO anon;
GRANT ALL ON ticket_messages TO authenticated;
GRANT ALL ON ticket_messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. Garantir que não há outras restrições
ALTER TABLE tickets OWNER TO postgres;
ALTER TABLE ticket_messages OWNER TO postgres;
