# 🚨 CORREÇÃO: Erro "Unauthorized: Invalid token"

## 📋 DIAGNÓSTICO

**Erro atual:**
```
Error: Unauthorized: Invalid token
```

**Causa:** Row Level Security (RLS) do Supabase está bloqueando acesso público às tabelas.

**Status:** ⚠️ **CRÍTICO** - Aplicação não funciona até resolver

---

## ✅ SOLUÇÃO EM 3 PASSOS (5 minutos)

### **PASSO 1: Acesse o Supabase**

1. Vá para https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto KZSTORE

### **PASSO 2: Abra o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"+ New query"**

### **PASSO 3: Execute o SQL**

Copie e cole este código SQL completo:

```sql
-- DESABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_ins DISABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;

-- VERIFICAR STATUS
SELECT 
  tablename AS "Tabela",
  CASE 
    WHEN rowsecurity = true THEN '❌ RLS Ativo'
    ELSE '✅ RLS Desabilitado'
  END AS "Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Clique em **"RUN"** para executar.

---

## 🧪 VERIFICAR SE FUNCIONOU

### Opção 1: No Supabase Dashboard

Após executar o SQL, você deve ver uma tabela mostrando todas as tabelas com status "✅ RLS Desabilitado".

### Opção 2: Na Aplicação

1. Abra sua aplicação KZSTORE
2. Navegue para a página de produtos
3. Adicione um produto ao carrinho
4. O erro "Unauthorized" **NÃO** deve mais aparecer

### Opção 3: Componente de Diagnóstico

Adicione temporariamente ao seu App.tsx:

```tsx
import { SupabaseDiagnostics } from './components/SupabaseDiagnostics';

// ... no seu JSX
<SupabaseDiagnostics />
```

Este componente mostrará um painel no canto inferior direito com status de todas as tabelas.

---

## 📁 ARQUIVOS DE APOIO

### Arquivos SQL:
- 📄 `/QUICK_FIX_RLS.sql` - Script SQL completo e comentado

### Documentação:
- 📄 `/DESABILITAR_RLS_AGORA.md` - Instruções detalhadas passo a passo
- 📄 `/SOLUCAO_RLS_SUPABASE.md` - Documentação completa com políticas para produção

### Ferramentas:
- 📄 `/TESTE_CONEXAO_SUPABASE.tsx` - Script de teste de conexão
- 📄 `/components/SupabaseDiagnostics.tsx` - Componente visual de diagnóstico

---

## 🔄 SE O ERRO PERSISTIR

### 1. Verificar se o SQL foi executado com sucesso

No SQL Editor do Supabase, execute:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

**Resultado esperado:** Nenhuma tabela retornada (todas devem ter RLS desabilitado)

### 2. Verificar credenciais Supabase

Abra `/utils/supabase/info.tsx` e confirme que:
- `projectId` está correto
- `publicAnonKey` está correto

Compare com: **Supabase Dashboard** → **Settings** → **API**

### 3. Limpar cache e recarregar

No console do navegador:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 4. Verificar console do navegador

Abra o console (F12) e veja os logs:
- ✅ Se aparecer mensagens de sucesso: está funcionando
- ❌ Se aparecer erros: copie o erro completo e analise

---

## 🎯 RESULTADO ESPERADO

### ANTES (com RLS ativo):
```
❌ Error: Unauthorized: Invalid token
❌ Produtos não carregam
❌ Pedidos não aparecem
❌ Carrinho não funciona
```

### DEPOIS (com RLS desabilitado):
```
✅ Produtos carregam normalmente
✅ Pedidos aparecem no admin
✅ Carrinho funciona
✅ Checkout completa com sucesso
✅ Todos os serviços Supabase funcionando
```

---

## ⚠️ NOTA IMPORTANTE

### Para Desenvolvimento (AGORA):
✅ **RLS DESABILITADO** - Permite acesso público para testes e desenvolvimento

### Para Produção (FUTURO):
🔒 **RLS COM POLÍTICAS** - Quando for colocar em produção, reative o RLS com políticas de segurança apropriadas. Veja `SOLUCAO_RLS_SUPABASE.md` para instruções completas.

---

## 📞 SUPORTE

Se após seguir todos os passos o erro persistir:

1. ✅ Confirme que executou o SQL no projeto correto
2. ✅ Confirme que não há erros de sintaxe no SQL
3. ✅ Verifique se seu usuário tem permissões de administrador no Supabase
4. ✅ Tente desabilitar RLS manualmente pela interface:
   - Vá em Database → Tables
   - Selecione cada tabela
   - Desmarque "Enable Row Level Security"

---

**Data**: 20 de Novembro de 2024  
**Urgência**: 🚨 **CRÍTICO**  
**Tempo**: ⏱️ 5 minutos  
**Dificuldade**: 🟢 Fácil  
**Status**: ⚠️ **AGUARDANDO EXECUÇÃO**
