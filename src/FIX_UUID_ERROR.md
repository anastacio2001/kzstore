# 🔧 FIX: Erro de UUID nos Produtos

## 🔴 PROBLEMA IDENTIFICADO

```
Error: invalid input syntax for type uuid: "prod_1763663371403_l7fbqgf1u"
```

## 💡 CAUSA

Você tem **dados antigos** no carrinho (localStorage) que usam IDs customizados ao invés de UUIDs do Supabase.

### **Origem do problema:**

1. **Antes:** Sistema usava `database.ts` que criava IDs customizados: `prod_1763663371403_l7fbqgf1u`
2. **Agora:** Sistema migrou para Supabase que usa UUIDs: `550e8400-e29b-41d4-a716-446655440000`
3. **Carrinho:** Ainda tem produtos com IDs antigos salvos no localStorage

---

## ✅ SOLUÇÃO EM 3 PASSOS

### **PASSO 1: Limpar LocalStorage** 🧹

**Execute no Console do Navegador:**

```javascript
// Abra DevTools (F12)
// Cole isto no Console:

localStorage.removeItem('kzstore_cart');
localStorage.removeItem('kzstore_wishlist');
localStorage.removeItem('kzstore_user');
console.log('✅ LocalStorage limpo!');

// Ou limpe tudo:
localStorage.clear();
console.log('✅ Todo localStorage limpo!');
```

**Depois recarregue a página (F5)**

---

### **PASSO 2: Deletar arquivo antigo** 🗑️

O arquivo `/services/database.ts` não deve mais ser usado. Vou deletá-lo.

---

### **PASSO 3: Verificar que hooks usam serviço correto** ✅

Os hooks devem usar os novos serviços:
- ❌ NÃO: `import from '../services/database'`
- ✅ SIM: `import from '../services/productsService'`

---

## 🎯 O QUE VOU FAZER

1. ✅ Criar componente para detectar e limpar dados antigos
2. ✅ Deletar `/services/database.ts`
3. ✅ Atualizar `/hooks/useDatabase.tsx` para usar novos serviços
4. ✅ Adicionar migração automática no App

---

## 📋 CHECKLIST

Após o fix:
- [ ] LocalStorage limpo
- [ ] Arquivo database.ts deletado
- [ ] Hooks atualizados
- [ ] Carrinho vazio
- [ ] Produtos carregam normalmente
- [ ] Adicionar ao carrinho funciona
- [ ] Checkout funciona

---

## ⚡ EXECUÇÃO AUTOMÁTICA

Vou criar o fix agora automaticamente!
