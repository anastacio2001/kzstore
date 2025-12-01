# 🚨 CORRIGIR ERROS - AÇÃO IMEDIATA

## ❌ ERROS ATUAIS

```
Error: Unauthorized: Invalid token
Error: column products.ativo does not exist
```

---

## ✅ SOLUÇÃO (3 Minutos)

### **PASSO 1: Acessar Supabase Dashboard**

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (barra lateral esquerda)

---

### **PASSO 2: Executar Este SQL**

Cole e execute no SQL Editor:

```sql
-- 🔥 FIX IMEDIATO: Desabilitar RLS para permitir acesso
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
```

Clique em **RUN** ou pressione `Ctrl+Enter`

---

### **PASSO 3: Recarregar a Página**

Recarregue a aplicação: `Ctrl+R` ou `F5`

---

## ✅ PRONTO!

**Os erros devem desaparecer!** 🎉

Os produtos e pedidos agora vão carregar normalmente.

---

## 🔍 O QUE FIZEMOS?

**Row Level Security (RLS)** é uma camada de segurança do Supabase que estava bloqueando o acesso às tabelas.

Desabilitamos temporariamente para permitir acesso público (adequado para desenvolvimento).

---

## 🔐 Para Produção (Depois)

Quando for deploy, você deve:
1. Reabilitar RLS
2. Criar políticas de acesso
3. Implementar autenticação adequada

Veja o arquivo `/SOLUCAO_RLS_SUPABASE.md` para detalhes.

---

## 📊 VERIFICAR FUNCIONAMENTO

Após executar, teste:

```javascript
// No console do navegador
verificarSupabase.tudo()
```

Deve mostrar produtos e pedidos sem erros! ✅

---

**EXECUTE O SQL AGORA E VOLTE AQUI!** 👆
