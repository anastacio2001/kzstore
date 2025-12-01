# 🚨 DESABILITAR RLS NO SUPABASE - PASSO A PASSO

## ❌ ERRO ATUAL
```
Error: Unauthorized: Invalid token
```

## 🎯 CAUSA
Row Level Security (RLS) está bloqueando acesso às tabelas.

---

## ✅ SOLUÇÃO IMEDIATA (5 minutos)

### **PASSO 1: Acessar Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **KZSTORE**

### **PASSO 2: Abrir SQL Editor**
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"+ New query"** (Nova consulta)

### **PASSO 3: Copiar e Colar este SQL**

```sql
-- =====================================================
-- DESABILITAR RLS - DESENVOLVIMENTO KZSTORE
-- Execute este código completo de uma vez
-- =====================================================

-- 1. PRODUTOS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. PEDIDOS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 3. ITENS DO PEDIDO (se existir)
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 4. CATEGORIAS
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 5. SUBCATEGORIAS (se existir)
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;

-- 6. CLIENTES
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- 7. CUPONS
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- 8. AVALIAÇÕES
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 9. TEAM MEMBERS (se existir)
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- 10. PRICE ALERTS (se existir)
ALTER TABLE price_alerts DISABLE ROW LEVEL SECURITY;

-- 11. LOYALTY POINTS (se existir)
ALTER TABLE loyalty_points DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR STATUS DO RLS
-- =====================================================
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ✅ Todas as tabelas devem mostrar rls_enabled = false
```

### **PASSO 4: Executar o SQL**
1. Cole o código SQL acima no editor
2. Clique no botão **"RUN"** (Executar) no canto inferior direito
3. Aguarde a execução (deve levar 1-2 segundos)

### **PASSO 5: Verificar Resultado**
Você deve ver uma tabela mostrando:
```
tablename         | rls_enabled
------------------+-------------
categories        | false
coupons           | false
customers         | false
orders            | false
products          | false
reviews           | false
...
```

Se **todas** as tabelas mostrarem `false`, está correto! ✅

---

## 🧪 TESTAR A APLICAÇÃO

Após executar o SQL, teste:

1. **Abrir a aplicação KZSTORE**
2. **Navegar para página de produtos**
3. **Adicionar produto ao carrinho**
4. **Fazer um pedido de teste**
5. **Verificar no Admin Dashboard**

**TODOS** os erros de "Unauthorized" devem desaparecer!

---

## ⚠️ IMPORTANTE

### Para Desenvolvimento (AGORA):
✅ **RLS DESABILITADO** - Permite acesso público para testes

### Para Produção (DEPOIS):
🔒 **HABILITAR RLS COM POLÍTICAS** - Segurança completa

Quando for colocar em produção, veja o arquivo `SOLUCAO_RLS_SUPABASE.md` para criar políticas de segurança corretas.

---

## 🆘 SE O ERRO PERSISTIR

### Verificar Credenciais Supabase:

1. Abra o arquivo `/utils/supabase/info.tsx`
2. Confirme que `projectId` e `publicAnonKey` estão corretos
3. Compare com as credenciais em: **Supabase Dashboard** → **Settings** → **API**

### Verificar Conexão com Internet

Certifique-se de que está conectado à internet e o Supabase está acessível.

### Limpar Cache do Navegador

```javascript
// No console do navegador:
localStorage.clear();
sessionStorage.clear();
// Depois, recarregue a página (F5)
```

---

## 📊 STATUS

- ❌ **ANTES**: RLS ativo bloqueando todas as requisições
- ✅ **DEPOIS**: RLS desabilitado, aplicação funcionando

---

## 📝 PRÓXIMOS PASSOS APÓS CORREÇÃO

1. ✅ Testar todas as funcionalidades da loja
2. ✅ Criar produtos de teste no admin
3. ✅ Fazer pedidos de teste
4. ✅ Verificar carrinho e checkout
5. 🔐 Preparar políticas RLS para produção

---

**Data**: 20 de Novembro de 2024  
**Urgência**: 🚨 **CRÍTICO** - Execute imediatamente!  
**Tempo estimado**: ⏱️ 5 minutos  
**Dificuldade**: 🟢 Fácil (apenas copiar e colar SQL)
