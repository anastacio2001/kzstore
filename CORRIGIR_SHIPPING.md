# 🔧 Corrigir Shipping dos Produtos

## Problema
Produtos criados antes do sistema de shipping ter `shipping_type` e `shipping_cost_aoa` definidos ficam com valores `NULL`, causando frete de 5000 Kz no checkout mesmo quando deveriam ter frete grátis.

## Solução

**Opção 1 - Via Browser (Recomendado)**

1. Faz login como admin em: https://kzstore-341392738431.europe-southwest1.run.app/#/admin

2. Abre o Console do navegador (F12 → Console)

3. Cola e executa este código:

```javascript
fetch('/api/products/fix-shipping', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(result => {
  console.log('✅ Produtos corrigidos:', result);
  alert(`✅ ${result.updated} produtos atualizados!\n🎁 Frete grátis: ${result.stats.free}\n💰 Frete pago: ${result.stats.paid}`);
})
.catch(err => console.error('❌ Erro:', err));
```

## O que o endpoint faz

```sql
UPDATE products 
SET 
  shipping_type = 'free',
  shipping_cost_aoa = 0,
  shipping_cost_usd = 0
WHERE shipping_type IS NULL 
   OR shipping_type = ''
   OR (shipping_type = 'paid' AND shipping_cost_aoa = 0);
```

Define **frete grátis** para todos os produtos que:
- Não têm `shipping_type` definido (NULL ou vazio)
- Têm `shipping_type = 'paid'` mas `shipping_cost_aoa = 0` (inconsistência)

## Verificação

Depois de executar, todos os produtos no carrinho devem mostrar:
- `🎁 GRÁTIS` se o produto tiver `shipping_type = 'free'`
- Valor correto se tiver `shipping_type = 'paid'` com custo definido
