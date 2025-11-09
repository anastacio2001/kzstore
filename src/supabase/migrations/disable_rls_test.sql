-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTE

-- 1. Dropar TODAS as políticas
DROP POLICY IF EXISTS "users_can_view_own_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_create_tickets" ON tickets;
DROP POLICY IF EXISTS "users_can_update_own_tickets" ON tickets;
DROP POLICY IF EXISTS "admins_full_access_tickets" ON tickets;
DROP POLICY IF EXISTS "system_can_assign_tickets" ON tickets;

DROP POLICY IF EXISTS "users_can_view_own_messages" ON ticket_messages;
DROP POLICY IF EXISTS "users_can_create_messages" ON ticket_messages;
DROP POLICY IF EXISTS "admins_full_access_messages" ON ticket_messages;

-- 2. DESABILITAR RLS completamente (TEMPORÁRIO PARA TESTE)
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages DISABLE ROW LEVEL SECURITY;

-- 3. Conceder permissões
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON tickets TO anon;
GRANT ALL ON ticket_messages TO authenticated;
GRANT ALL ON ticket_messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
