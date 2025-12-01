# 🚀 GUIA RÁPIDO - Executar Scripts SQL

## ⚠️ IMPORTANTE: Execute os scripts NA ORDEM!

---

## 📝 PASSO A PASSO

### 1. Acesse o Supabase
```
1. Abra: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto KZSTORE
4. Clique em "SQL Editor" (menu lateral)
```

---

### 2. Execute os Scripts (UM POR VEZ)

#### ✅ **SCRIPT 1: Criar tabela ORDERS**

1. No SQL Editor, clique em **"+ New Query"**
2. Copie o conteúdo do arquivo: **`/SQL_STEP_1_ORDERS.sql`**
3. Cole no editor
4. Clique em **"Run"** (ou CTRL + Enter)
5. ✅ Verifique se apareceu: **"Success. No rows returned"**

**⚠️ Se der erro**, me envie o erro exato!

---

#### ✅ **SCRIPT 2: Criar tabela ORDER_ITEMS**

1. Clique em **"+ New Query"** novamente
2. Copie o conteúdo do arquivo: **`/SQL_STEP_2_ORDER_ITEMS.sql`**
3. Cole no editor
4. Clique em **"Run"**
5. ✅ Verifique se apareceu: **"Success. No rows returned"**

---

#### ✅ **SCRIPT 3: Criar tabela COUPONS**

1. Clique em **"+ New Query"** novamente
2. Copie o conteúdo do arquivo: **`/SQL_STEP_3_COUPONS.sql`**
3. Cole no editor
4. Clique em **"Run"**
5. ✅ Verifique se apareceu: **"Success. 1 row affected"** (cupom inserido)

---

#### ✅ **SCRIPT 4: Criar tabela TEAM_MEMBERS**

1. Clique em **"+ New Query"** novamente
2. Copie o conteúdo do arquivo: **`/SQL_STEP_4_TEAM_MEMBERS.sql`**
3. Cole no editor
4. Clique em **"Run"**
5. ✅ Verifique se apareceu: **"Success. No rows returned"**

---

#### ✅ **SCRIPT 5: Configurar Segurança (RLS)**

1. Clique em **"+ New Query"** novamente
2. Copie o conteúdo do arquivo: **`/SQL_STEP_5_RLS_POLICIES.sql`**
3. Cole no editor
4. Clique em **"Run"**
5. ✅ Verifique se apareceu: **"Success. No rows returned"**

---

## 🎯 VERIFICAÇÃO FINAL

### Verifique se as tabelas foram criadas:

1. No Supabase, vá em **"Table Editor"** (menu lateral)
2. Você deve ver estas tabelas:

```
✅ coupons
✅ kv_store_d8a4dffd (já existia)
✅ order_items
✅ orders
✅ team_members
```

---

### Teste rápido das tabelas:

Execute este script no SQL Editor:

```sql
-- Verificar quantas tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**
```
coupons
kv_store_d8a4dffd
order_items
orders
team_members
```

---

### Verifique se o cupom foi criado:

```sql
SELECT * FROM coupons;
```

**Resultado esperado:**
```
code: KZSTORE10
description: Desconto de 10% para novos clientes
discount_type: percentage
discount_value: 10
is_active: true
```

---

## ✅ PRONTO!

Se tudo funcionou, você terá:

- ✅ 4 novas tabelas criadas
- ✅ 1 cupom de teste (KZSTORE10)
- ✅ Segurança RLS configurada
- ✅ Índices de performance criados
- ✅ Triggers automáticos funcionando

---

## 🐛 Se der ERRO

### Erro: "relation already exists"
**Solução:** A tabela já existe. Ignore ou execute o DROP antes.

### Erro: "column does not exist"
**Solução:** Execute os scripts NA ORDEM (1, 2, 3, 4, 5).

### Erro: "permission denied"
**Solução:** Verifique se está logado com a conta correta do Supabase.

### Erro: "function does not exist"
**Solução:** Execute primeiro o Script 1 (ele cria a função).

---

## 🎉 DEPOIS DE CONCLUIR

Vá para `/GUIA_IMPLEMENTACAO.md` - **Passo 2** para testar o fluxo de compra!

**Tempo total: 5 minutos** ⏱️

---

*Guia criado: 19/11/2025*
*Versão: 2.0 (Simplificada)*
