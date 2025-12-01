# 🔒 GUIA DE SEGURANÇA - CORREÇÃO URGENTE RLS

## ⚠️ PROBLEMA IDENTIFICADO
**CRÍTICO**: Usuários conseguem ver pedidos e informações de outros usuários!

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Backend Corrigido
- ✅ Rota `/api/orders` agora filtra por `user_id`
- ✅ Query string `?user_id=xxx` obrigatória para usuários comuns
- ✅ Apenas admins podem ver todos os pedidos

### 2. Políticas RLS do Supabase
Arquivo criado: `SECURITY_RLS_POLICIES.sql`

## 📋 PASSOS PARA APLICAR (URGENTE)

### Passo 1: Aplicar Políticas RLS no Supabase

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto KZSTORE
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo `SECURITY_RLS_POLICIES.sql`
6. Cole no editor e clique em **RUN**
7. Aguarde a mensagem de sucesso

### Passo 2: Verificar Políticas Aplicadas

Execute no SQL Editor:
```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'products', 'reviews', 'coupons')
ORDER BY tablename;
```

Você deve ver políticas como:
- ✅ "Users can view their own orders"
- ✅ "Admins can view all orders"
- ✅ "Service role can do everything on orders"

### Passo 3: Testar Segurança

#### Teste 1: Como Usuário Normal
1. Faça login como usuário comum (não admin)
2. Vá em "Meus Pedidos"
3. ✅ **DEVE VER**: Apenas seus próprios pedidos
4. ❌ **NÃO DEVE VER**: Pedidos de outros usuários

#### Teste 2: Como Admin
1. Faça login como admin (admin@kzstore.com)
2. Vá no Painel Admin > Pedidos
3. ✅ **DEVE VER**: Todos os pedidos de todos os usuários

#### Teste 3: Verificar no SQL (Opcional)
No SQL Editor do Supabase:
```sql
-- Ver quantos pedidos existem por usuário
SELECT 
  user_id,
  user_email,
  COUNT(*) as total_pedidos
FROM orders
GROUP BY user_id, user_email;
```

## 🔐 O QUE FOI PROTEGIDO

### ✅ Tabela ORDERS
- Usuários veem APENAS seus pedidos
- Admins veem TODOS os pedidos
- Ninguém pode alterar pedidos (exceto admins)

### ✅ Tabela PRODUCTS
- Todos podem VER produtos (público)
- Apenas admins podem CRIAR/EDITAR/DELETAR

### ✅ Tabela REVIEWS
- Todos podem VER reviews
- Usuários podem criar/editar APENAS suas reviews
- Usuários NÃO podem editar reviews de outros

### ✅ Tabela COUPONS
- Todos podem VER cupons ativos
- Apenas admins podem criar/editar cupons

### ✅ Tabela WISHLIST
- Usuários veem APENAS sua wishlist
- Ninguém pode ver wishlist de outros

## 🚨 ATENÇÕES IMPORTANTES

1. **NÃO use service_role key no frontend**
   - Use apenas `anon` ou `authenticated` key
   - Service role bypassa TODAS as políticas RLS

2. **Sempre filtre por user_id no frontend**
   ```typescript
   // ✅ CORRETO
   const { data } = await supabase
     .from('orders')
     .select('*')
     .eq('user_id', user.id);
   
   // ❌ ERRADO (retorna todos se RLS não estiver ativo)
   const { data } = await supabase
     .from('orders')
     .select('*');
   ```

3. **Verifique role de admin**
   - Admins devem ter `role: 'admin'` no metadata
   - Ou email em lista de admins

## 🧪 CHECKLIST DE TESTES

Após aplicar as políticas:

- [ ] Criar conta de usuário teste 1
- [ ] Criar pedido com usuário 1
- [ ] Criar conta de usuário teste 2
- [ ] Criar pedido com usuário 2
- [ ] Login com usuário 1
- [ ] Verificar "Meus Pedidos" (deve ver APENAS pedidos do usuário 1)
- [ ] Login com usuário 2
- [ ] Verificar "Meus Pedidos" (deve ver APENAS pedidos do usuário 2)
- [ ] Login como admin
- [ ] Verificar Painel Admin > Pedidos (deve ver TODOS os pedidos)

## 📊 MONITORAMENTO

### Ver Logs de Acesso
No Supabase Dashboard:
1. Vá em **Logs** (menu lateral)
2. Selecione **Database**
3. Procure por:
   - "RLS policy violation"
   - "permission denied"

### Alertas de Segurança
Configure alertas para:
- Tentativas de acesso não autorizado
- Queries sem filtro de user_id
- Uso suspeito de service_role

## 🔄 PRÓXIMOS PASSOS

1. ✅ Aplicar políticas RLS (URGENTE)
2. ✅ Testar com múltiplos usuários
3. ⏳ Auditar outras tabelas sensíveis
4. ⏳ Implementar logging de acessos
5. ⏳ Configurar alertas de segurança

## 🆘 SUPORTE

Se encontrar erros:

1. Verifique logs do Supabase
2. Confirme que RLS está habilitado: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;`
3. Teste as políticas manualmente no SQL Editor
4. Verifique se user_id é UUID válido

## 📝 NOTAS FINAIS

- **Segurança é prioridade máxima**
- **RLS é a primeira linha de defesa**
- **Sempre teste com usuários reais**
- **Monitore logs regularmente**
- **Mantenha políticas atualizadas**

---
**Data**: 27 de novembro de 2025
**Status**: 🔴 CRÍTICO - Aplicar imediatamente
**Tempo estimado**: 10-15 minutos
