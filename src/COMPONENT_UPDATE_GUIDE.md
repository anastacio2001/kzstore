# 🔄 Guia de Atualização de Componentes - KZSTORE

## ✅ Status Atual

### Componentes JÁ Atualizados:
- ✅ App.tsx
- ✅ AdsManager.tsx  
- ✅ TeamManager.tsx
- ✅ ProductForm.tsx

### Componentes PENDENTES (15):

## 📋 Padrão de Atualização

Para cada componente abaixo, siga este padrão:

### 1. Remover imports antigos:
```typescript
// ❌ REMOVER
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ❌ REMOVER todas as chamadas fetch
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/...`);
```

### 2. Adicionar novo hook:
```typescript
// ✅ ADICIONAR
import { useNomeDoHook } from '../../hooks/useNomeDoHook';

// ✅ No componente
const { list, loading, fetch, create, update, delete } = useNomeDoHook();
```

---

## 📝 Lista de Atualizações

### 1. ReviewManagement.tsx
```typescript
// Adicionar
import { useReviews } from '../../hooks/useReviews';

// Usar
const { reviews, loading, fetchReviews, updateReviewStatus, deleteReview } = useReviews();

// Substituir
loadReviews() → fetchReviews()
handleApprove(id) → updateReviewStatus(id, 'approved')
handleReject(id) → updateReviewStatus(id, 'rejected')
handleDelete(id) → deleteReview(id)
```

### 2. CouponManagement.tsx
```typescript
// Adicionar
import { useCoupons } from '../../hooks/useCoupons';

// Usar
const { coupons, loading, fetchCoupons, createCoupon, updateCoupon, deleteCoupon } = useCoupons();

// Substituir
loadCoupons() → fetchCoupons()
handleSubmit() → createCoupon(formData) ou updateCoupon(id, formData)
handleDelete(id) → deleteCoupon(id)
```

### 3. CouponsManager.tsx
```typescript
// Adicionar
import { useCoupons } from '../../hooks/useCoupons';

// MESMO que CouponManagement.tsx
```

### 4. FlashSalesManager.tsx
```typescript
// Adicionar
import { useFlashSales } from '../../hooks/useFlashSales';

// Usar
const { flashSales, loading, fetchFlashSales, createFlashSale, updateFlashSale, deleteFlashSale } = useFlashSales();

// Substituir
loadFlashSales() → fetchFlashSales()
handleSubmit() → createFlashSale(formData) ou updateFlashSale(id, formData)
handleDelete(id) → deleteFlashSale(id)
```

### 5. PreOrdersManager.tsx
```typescript
// Adicionar
import { usePreOrders } from '../../hooks/usePreOrders';

// Usar
const { preOrders, loading, fetchPreOrders, updatePreOrderStatus } = usePreOrders();

// Substituir
loadPreOrders() → fetchPreOrders()
handleStatusChange(id, status) → updatePreOrderStatus(id, status)
```

### 6. TradeInManager.tsx
```typescript
// Adicionar
import { useTradeIn } from '../../hooks/useTradeIn';

// Usar
const { tradeIns, loading, fetchTradeIns, evaluateTradeIn, updateTradeInStatus } = useTradeIn();

// Substituir
loadTradeIns() → fetchTradeIns()
handleEvaluate(id, value, status, notes) → evaluateTradeIn(id, value, status, notes)
handleStatusChange(id, status) → updateTradeInStatus(id, status)
```

### 7. QuotesManager.tsx
```typescript
// Adicionar
import { useQuotes } from '../../hooks/useQuotes';

// Usar
const { quotes, loading, fetchQuotes, respondToQuote, updateQuoteStatus } = useQuotes();

// Substituir
loadQuotes() → fetchQuotes()
handleRespond(id, price, delivery, notes) → respondToQuote(id, price, delivery, notes)
handleStatusChange(id, status) → updateQuoteStatus(id, status)
```

### 8. B2BManager.tsx
```typescript
// Adicionar
import { useB2B } from '../../hooks/useB2B';

// Usar
const { accounts, loading, fetchAccounts, createAccount, updateAccount } = useB2B();

// Substituir
loadAccounts() → fetchAccounts()
handleSubmit() → createAccount(formData) ou updateAccount(id, formData)
```

### 9. AffiliatesManager.tsx
```typescript
// Adicionar
import { useAffiliates } from '../../hooks/useAffiliates';

// Usar
const { affiliates, loading, fetchAffiliates, payCommission } = useAffiliates();

// Substituir
loadAffiliates() → fetchAffiliates()
handlePayCommission(id, amount) → payCommission(id, amount)
```

### 10. TicketsManager.tsx
```typescript
// Adicionar
import { useTickets } from '../../hooks/useTickets';

// Usar
const { tickets, loading, fetchTickets, addResponse, updateTicketStatus } = useTickets();

// Substituir
loadTickets() → fetchTickets()
handleAddResponse(id, message, author, role) → addResponse(id, message, author, role)
handleStatusChange(id, status) → updateTicketStatus(id, status)
```

### 11. AnalyticsDashboard.tsx
```typescript
// Adicionar
import { useAnalytics } from '../../hooks/useAnalytics';

// Usar
const { loading, getSummary, fetchEvents } = useAnalytics();

// Substituir
loadSummary(days) → getSummary(days)
loadEvents(days) → fetchEvents(days)
```

### 12. OrderManagementComplete.tsx
```typescript
// Adicionar
import { useOrders } from '../../hooks/useOrders';

// Usar
const { orders, loading, fetchOrders, updateOrderStatus } = useOrders();

// Substituir
loadOrders() → fetchOrders()
handleStatusChange(id, status) → updateOrderStatus(id, status)
```

### 13. StockAlerts.tsx
```typescript
// Adicionar
import { useProducts } from '../../hooks/useProducts';

// Usar
const { getLowStockProducts } = useProducts();

// Substituir
const response = await fetch('.../products/alerts/low-stock?threshold=...')
→
const products = await getLowStockProducts(threshold)
```

### 14. SampleDataCreator.tsx
```typescript
// Adicionar
import { useAds } from '../../hooks/useAds';
import { useTeam } from '../../hooks/useTeam';

// Usar
const { createAd } = useAds();
const { createMember } = useTeam();

// Substituir cada fetch com o método correspondente
```

### 15. Analytics.tsx
```typescript
// Adicionar
import { useAnalytics } from '../../hooks/useAnalytics';

// Usar
const { trackEvent } = useAnalytics();

// Na função trackCustomEvent:
async function trackCustomEvent(eventName: string, eventParams?: Record<string, any>) {
  const { trackEvent } = useAnalytics(); // Precisa ser dentro de um componente React
  await trackEvent(eventName, eventParams);
}

// OU criar uma função standalone:
import { kvSet } from '../utils/supabase/kv';

async function trackCustomEvent(eventName: string, eventParams?: Record<string, any>) {
  const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await kvSet(`analytics:event:${id}`, {
    id,
    eventName,
    eventParams,
    timestamp: new Date().toISOString()
  });
}
```

---

## 🎯 Checklist Rápido para Cada Componente

Para cada componente:

- [ ] Importar hook apropriado
- [ ] Substituir estado local por hook (se aplicável)
- [ ] Remover todas as chamadas `fetch()` 
- [ ] Remover imports de `projectId` e `publicAnonKey`
- [ ] Substituir `loadX()` por `fetchX()` do hook
- [ ] Substituir operações CRUD por métodos do hook
- [ ] Testar funcionalidade

---

## 🚀 Benefícios Após Atualização

### Performance
- ⚡ Menos latência (sem HTTP)
- ⚡ Operações mais rápidas
- ⚡ Cache automático

### Código
- 📦 Menos linhas de código
- 🎯 Mais organizado
- 🔧 Mais fácil de manter
- 🐛 Mais fácil de debugar

### Funcionalidade
- ✅ Tipagem completa TypeScript
- ✅ Estados de loading automáticos
- ✅ Tratamento de erros consistente
- ✅ Reutilização de código

---

## 💡 Dicas

### 1. Use useEffect para carregar dados:
```typescript
useEffect(() => {
  fetchData();
}, []);
```

### 2. Gerencie estados de loading:
```typescript
{loading ? (
  <p>Carregando...</p>
) : (
  <DataDisplay data={list} />
)}
```

### 3. Trate erros:
```typescript
try {
  await createItem(data);
  toast.success('Item criado!');
} catch (error) {
  console.error('Error:', error);
  toast.error('Erro ao criar item');
}
```

### 4. Use async/await:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await createItem(formData);
  if (result) {
    // Sucesso
  }
};
```

---

## ✅ Conclusão

Todos os hooks estão prontos e funcionais. É só:
1. Importar o hook apropriado
2. Substituir chamadas HTTP por métodos do hook
3. Remover código desnecessário

**Tempo estimado por componente: 5-10 minutos**
**Tempo total para os 15: 1-2 horas**

A infraestrutura está 100% completa! 🎉
