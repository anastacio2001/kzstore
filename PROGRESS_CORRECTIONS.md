# Status das Correções - Componentes Novos

## ✅ COMPLETO

### 1. TradeInCredits.tsx
- [x] Todas ocorrências de R$ mudadas para Kz
- [x] Todos .toFixed(2) mudados para .toLocaleString('pt-AO')
- [x] " Kz" adicionado após cada valor monetário
- [x] Design mantido (fundo escuro é apropriado para esta página)

### 2. TradeInEvaluator.tsx
- [x] R$ mudado para Kz no card "Valor Médio Estimado"
- [x] R$ mudado para Kz no label do input
- [x] .toFixed mudado para .toLocaleString
- [x] step="0.01" mudado para step="1" (Kwanzas inteiros)
- [x] Campos da tabela corrigidos (customer_email, product_condition, etc.)

### 3. TradeInForm.tsx
- [x] Upload de imagens funcionando corretamente
- [x] Bucket 'trade-in' configurado
- [x] RLS policies corrigidas
- [x] Error handling melhorado

## 🔄 EM ANDAMENTO

### 4. AffiliateManager.tsx (Admin)
- [ ] 4 ocorrências de R$ encontradas
- [ ] Linha 287: totalCommissionsPaid
- [ ] Linha 301: totalCommissionsPending  
- [ ] Linha 390: affiliate.total_commission
- [ ] Linha 455: Label "Valor (R$)"
- [ ] Design OK (admin pode manter fundo escuro)

## ⏳ PENDENTE

### 5. QuoteBuilder.tsx (Admin)
- [ ] Verificar ocorrências de R$
- [ ] Mudar para Kz

### 6. AffiliateDashboard.tsx
- [ ] Verificar ocorrências de R$
- [ ] Ajustar design se necessário

### 7. QuoteRequestForm.tsx
- [ ] Verificar design system
- [ ] Ajustar cores se necessário

### 8. BusinessRegistration.tsx
- [ ] Verificar design system
- [ ] Ajustar cores se necessário

### 9. EmailCampaignBuilder.tsx (Admin)
- [ ] Verificar design (OK manter escuro)

## 📋 PRÓXIMOS PASSOS

1. Corrigir AffiliateManager (4 ocorrências de R$)
2. Buscar e corrigir QuoteBuilder
3. Buscar e corrigir AffiliateDashboard
4. Verificar QuoteRequestForm (design)
5. Verificar BusinessRegistration (design)
6. Testar todos os componentes
7. Commit final

## 🎨 PADRÃO DE DESIGN

### Componentes Públicos (Usuários):
- Fundo: `bg-gradient-to-br from-gray-50 to-gray-100`
- Cards: `bg-white shadow-md`
- Texto: `text-gray-900` / `text-gray-600`

### Componentes Admin:
- Manter: `bg-gray-900` / `bg-gray-800`  
- Manter: `text-white` / `text-gray-400`
- Consistente com AdminPanel

## 💰 PADRÃO DE MOEDA

```typescript
// SEMPRE usar:
{value.toLocaleString('pt-AO')} Kz

// NUNCA usar:
R$ {value.toFixed(2)}
```
