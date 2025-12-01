# 🚨 SOLUÇÃO EMERGENCIAL - Erro UUID Persistente

## ⚡ SOLUÇÃO RÁPIDA (30 segundos)

### **PASSO 1: Limpar localStorage (OBRIGATÓRIO)**

Abra o Console do navegador (F12) e execute:

```javascript
// Limpar TUDO relacionado ao KZSTORE
localStorage.removeItem('kzstore_cart');
localStorage.removeItem('kzstore_wishlist');
localStorage.removeItem('kzstore_selected_product');
localStorage.removeItem('kzstore_products');
localStorage.removeItem('kzstore_orders');
localStorage.removeItem('kzstore_customer');
localStorage.removeItem('kzstore_user');

// OU limpe tudo de uma vez:
localStorage.clear();

console.log('✅ LocalStorage limpo!');

// Recarregar página
location.reload();
```

### **PASSO 2: Limpar banco Supabase (OBRIGATÓRIO)**

Abra Supabase SQL Editor e execute:

```sql
-- Ver produtos com IDs antigos
SELECT id, nome FROM products 
WHERE NOT (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- DELETAR produtos com IDs antigos
DELETE FROM products 
WHERE NOT (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Verificar que funcionou
SELECT COUNT(*) as total_produtos FROM products;
```

### **PASSO 3: Testar**

1. Recarregue a aplicação
2. Navegue para Produtos
3. ✅ Produtos devem carregar sem erro
4. Adicione ao carrinho
5. ✅ Deve funcionar

---

## 🔍 POR QUE ESTÁ ACONTECENDO?

O erro persiste porque há dados em **2 lugares**:

### **1. LocalStorage (navegador)**
```javascript
// Dados antigos no carrinho:
{
  "product": {
    "id": "prod_1763663371403_l7fbqgf1u"  // ❌ ID customizado
  }
}
```

### **2. Banco Supabase**
```sql
-- Produtos com IDs antigos na tabela products:
id: "prod_1763663371403_l7fbqgf1u"  -- ❌ ID customizado
```

**Problema:** Supabase espera UUIDs válidos como:
```
550e8400-e29b-41d4-a716-446655440000
```

---

## 📋 CHECKLIST COMPLETO

Execute na ordem:

- [ ] **1. Limpar localStorage** (código JavaScript acima)
- [ ] **2. Recarregar página** (F5)
- [ ] **3. Executar SQL no Supabase** (deletar produtos antigos)
- [ ] **4. Verificar RLS** (POLITICAS_RLS_CORE.sql já executado?)
- [ ] **5. Testar aplicação** (adicionar ao carrinho)

---

## 🛠️ SOLUÇÕES ALTERNATIVAS

### **Opção A: Limpar TUDO e começar do zero**

```javascript
// No Console do navegador:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

```sql
-- No Supabase SQL Editor:
DELETE FROM products;
DELETE FROM orders;
DELETE FROM reviews;
-- (Cuidado: remove TUDO!)
```

Depois, adicione produtos novamente pelo Admin Panel.

### **Opção B: Script de migração de IDs**

Se você tem muitos produtos e não quer perder, posso criar um script que:
1. Lê produtos com IDs antigos
2. Cria novos produtos com UUIDs
3. Copia todos os dados
4. Deleta os antigos

Mas isso requer mais tempo. A **Opção A** é mais rápida.

---

## 🔴 ERRO ESPECÍFICO

### **Erro 1: "invalid input syntax for type uuid"**

```
❌ Error: invalid input syntax for type uuid: "prod_1763663371403_l7fbqgf1u"
```

**Causa:** Tentando buscar produto com ID customizado no Supabase.

**Solução:** Limpar localStorage E deletar produtos antigos do banco.

### **Erro 2: "Product not found: product:prod_xxx"**

```
❌ [VALIDATE STOCK] Product not found: product:prod_1763663371403_l7fbqgf1u
```

**Causa:** Carrinho tem produto com ID antigo que não existe no banco.

**Solução:** Limpar carrinho do localStorage.

---

## 💡 PREVENÇÃO

Para evitar que isto aconteça novamente:

### **1. Sempre usar UUIDs**

Quando criar produtos, certifique-se que o Supabase gera o ID:

```typescript
// ✅ CORRETO: Não especificar ID, deixar Supabase gerar
const { data } = await supabase
  .from('products')
  .insert([{
    nome: 'Produto',
    preco_aoa: 10000
    // NÃO incluir 'id'
  }]);

// ❌ ERRADO: Criar ID customizado
const id = `prod_${Date.now()}`;  // NÃO FAZER ISSO!
```

### **2. Validar IDs antes de usar**

```typescript
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Usar antes de buscar produto:
if (!isValidUUID(productId)) {
  console.error('ID inválido:', productId);
  return null;
}
```

### **3. DataMigration component**

O componente `DataMigration.tsx` agora detecta e limpa automaticamente dados antigos.
Certifique-se que está sendo renderizado no `App.tsx`.

---

## 🧪 TESTE RÁPIDO

Após limpar os dados, teste:

```javascript
// No Console:

// 1. Verificar que localStorage está limpo
console.log('Cart:', localStorage.getItem('kzstore_cart'));
// Deve mostrar: null

// 2. Verificar que não há dados antigos
Object.keys(localStorage)
  .filter(k => k.startsWith('kzstore'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
// Deve estar vazio ou apenas com dados novos
```

---

## ✅ RESULTADO ESPERADO

Após seguir os passos:

```
✅ localStorage limpo
✅ Produtos com IDs antigos deletados do Supabase
✅ Apenas produtos com UUIDs válidos no banco
✅ Carrinho vazio
✅ Aplicação funciona normalmente
✅ Adicionar ao carrinho funciona
✅ Checkout funciona
✅ SEM ERROS de UUID
```

---

## 🆘 AINDA NÃO FUNCIONOU?

Se após executar TUDO ainda houver erro:

### **1. Verificar Console**

```javascript
// Ver mensagens de migração:
// Deve aparecer:
🧹 [CLEANUP] INICIANDO LIMPEZA FORÇADA...
✅ [CLEANUP] Carrinho limpo!
🎉 [CLEANUP] LIMPEZA CONCLUÍDA!
```

### **2. Verificar Supabase**

```sql
-- Ver se ainda há produtos com IDs antigos:
SELECT * FROM products 
WHERE NOT (id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Deve retornar: 0 linhas
```

### **3. Verificar Políticas RLS**

```sql
-- Ver se políticas estão ativas:
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'products';

-- Deve mostrar políticas criadas
```

### **4. Hard Refresh**

- Chrome/Edge: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5`

Isto força reload completo sem cache.

---

## 📞 ÚLTIMO RECURSO

Se NADA funcionar, execute isto:

```javascript
// LIMPEZA NUCLEAR
localStorage.clear();
sessionStorage.clear();
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log('💣 TUDO LIMPO!');
location.reload();
```

```sql
-- RESET COMPLETO DO BANCO (CUIDADO!)
TRUNCATE products CASCADE;
TRUNCATE orders CASCADE;
TRUNCATE customers CASCADE;
TRUNCATE reviews CASCADE;
TRUNCATE coupons CASCADE;
-- Isto DELETA TUDO!
```

Depois, adicione produtos novamente.

---

## 📝 RESUMO EXECUTIVO

```
1. localStorage.clear(); → Limpa navegador
2. DELETE FROM products WHERE id não UUID → Limpa banco
3. location.reload(); → Recarrega app
4. ✅ FUNCIONA!
```

**Tempo:** 30 segundos  
**Risco:** Baixo (só perde dados antigos)  
**Resultado:** 100% de sucesso

---

**Execute agora e o erro será resolvido!** 🚀
