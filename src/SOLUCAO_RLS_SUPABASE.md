# 🔒 SOLUÇÃO: Row Level Security (RLS) no Supabase

## ❌ PROBLEMA

Erros de autenticação ao buscar dados:
```
Error: Unauthorized: Invalid token
column products.ativo does not exist
```

## 🎯 CAUSA

O Supabase tem **Row Level Security (RLS)** ativado por padrão, bloqueando acesso público às tabelas.

---

## ✅ SOLUÇÃO RÁPIDA (Recomendada para Desenvolvimento)

### 1️⃣ **DESABILITAR RLS NAS TABELAS**

Acesse o **Supabase Dashboard** → **SQL Editor** e execute:

```sql
-- Desabilitar RLS para permitir acesso público (SOMENTE EM DESENVOLVIMENTO)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
```

### 2️⃣ **OU: CRIAR POLÍTICAS PERMISSIVAS**

Se preferir manter RLS ativo, crie políticas que permitem leitura pública:

```sql
-- Products: Leitura pública
CREATE POLICY "Public read products"
ON products FOR SELECT
USING (true);

-- Orders: Usuário pode ver seus próprios pedidos
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid()::text = user_id);

-- Orders: Admin pode ver todos (se tiver role admin)
CREATE POLICY "Admin can view all orders"
ON orders FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Reviews: Leitura pública de reviews aprovadas
CREATE POLICY "Public read approved reviews"
ON reviews FOR SELECT
USING (status = 'approved');

-- Categories: Leitura pública
CREATE POLICY "Public read categories"
ON categories FOR SELECT
USING (true);

-- Coupons: Leitura pública de cupons ativos
CREATE POLICY "Public read active coupons"
ON coupons FOR SELECT
USING (active = true);

-- Customers: Usuário pode ver seus próprios dados
CREATE POLICY "Users can view own data"
ON customers FOR SELECT
USING (auth.uid()::text = user_id);
```

---

## 🔐 SOLUÇÃO COMPLETA (Recomendada para Produção)

### **Políticas RLS Completas com Segurança**

```sql
-- =====================
-- PRODUCTS
-- =====================

-- Leitura: Público
CREATE POLICY "Public read products"
ON products FOR SELECT
USING (true);

-- Escrita: Apenas Admin
CREATE POLICY "Admin manage products"
ON products FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- ORDERS
-- =====================

-- Usuário lê seus pedidos
CREATE POLICY "Users read own orders"
ON orders FOR SELECT
USING (auth.uid()::text = user_id);

-- Usuário cria seus pedidos
CREATE POLICY "Users create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Admin lê todos os pedidos
CREATE POLICY "Admin read all orders"
ON orders FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Admin atualiza pedidos
CREATE POLICY "Admin update orders"
ON orders FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- REVIEWS
-- =====================

-- Público lê reviews aprovadas
CREATE POLICY "Public read approved reviews"
ON reviews FOR SELECT
USING (status = 'approved');

-- Usuário cria reviews
CREATE POLICY "Authenticated users create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Usuário edita suas reviews
CREATE POLICY "Users update own reviews"
ON reviews FOR UPDATE
USING (auth.uid()::text = user_id);

-- Admin gerencia todas as reviews
CREATE POLICY "Admin manage reviews"
ON reviews FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- CUSTOMERS
-- =====================

-- Usuário lê seus dados
CREATE POLICY "Users read own data"
ON customers FOR SELECT
USING (auth.uid()::text = user_id);

-- Usuário atualiza seus dados
CREATE POLICY "Users update own data"
ON customers FOR UPDATE
USING (auth.uid()::text = user_id);

-- Admin lê todos os clientes
CREATE POLICY "Admin read customers"
ON customers FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- CATEGORIES
-- =====================

-- Público lê categorias
CREATE POLICY "Public read categories"
ON categories FOR SELECT
USING (true);

-- Admin gerencia categorias
CREATE POLICY "Admin manage categories"
ON categories FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- =====================
-- COUPONS
-- =====================

-- Público lê cupons ativos
CREATE POLICY "Public read active coupons"
ON coupons FOR SELECT
USING (active = true);

-- Admin gerencia cupons
CREATE POLICY "Admin manage coupons"
ON coupons FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🚀 QUICK FIX (Execute Agora)

Para fazer o app funcionar IMEDIATAMENTE, execute no SQL Editor:

```sql
-- DESABILITAR RLS (apenas desenvolvimento)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- ✅ App vai funcionar imediatamente!
```

---

## ⚠️ IMPORTANTE

### Para Desenvolvimento:
✅ **DESABILITAR RLS** - Mais rápido e fácil

### Para Produção:
🔒 **USAR POLÍTICAS RLS** - Seguro e correto

---

## 🔍 VERIFICAR STATUS DO RLS

```sql
-- Ver quais tabelas têm RLS ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Ver políticas existentes
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 📝 PRÓXIMOS PASSOS

1. ✅ **Execute o QUICK FIX acima**
2. ✅ **Teste o app - deve funcionar!**
3. 🔐 **Depois, implemente as políticas RLS para produção**

---

**Data**: 20 de Novembro de 2024  
**Status**: ⚠️ **AÇÃO NECESSÁRIA** - Execute o SQL acima!
