# Correções Necessárias nos Novos Componentes

## Problemas Identificados:
1. **Moeda**: Todos componentes usando R$ (Real) ao invés de Kz (Kwanza)
2. **Design**: Usando `bg-gray-800`, `bg-gray-900` (fundo preto) ao invés do design system atual (bg-white, bg-gradient-to-br from-gray-50)
3. **Textos**: `text-white`, `text-gray-400` ao invés de `text-gray-900`, `text-gray-600`

## Componentes a Corrigir:

### 1. TradeInCredits.tsx
- [ ] Mudar todas as ocorrências de `R$` para `Kz`
- [ ] Mudar `.toFixed(2)` para `.toLocaleString('pt-AO')`
- [ ] Trocar `bg-gray-800` por `bg-white shadow-md`
- [ ] Trocar `bg-gray-900` por `bg-gray-50` ou `bg-white`
- [ ] Trocar `text-white` por `text-gray-900`
- [ ] Trocar `text-gray-400` por `text-gray-600`
- [ ] Fundo principal: `bg-gray-900` → `bg-gradient-to-br from-gray-50 to-gray-100`

### 2. TradeInEvaluator.tsx (Admin)
- [x] Moeda corrigida
- [ ] Manter fundo escuro (é admin panel)
- [ ] Verificar consistência com AdminPanel

### 3. AffiliateManager.tsx
- [ ] Mudar R$ para Kz
- [ ] Ajustar design system

### 4. QuoteBuilder.tsx  
- [ ] Mudar R$ para Kz
- [ ] Ajustar design system

### 5. AffiliateDashboard.tsx
- [ ] Verificar moeda
- [ ] Ajustar design system

### 6. QuoteRequestForm.tsx
- [ ] Ajustar design system

### 7. BusinessRegistration.tsx
- [ ] Ajustar design system

### 8. EmailCampaignBuilder.tsx (Admin)
- [ ] Manter fundo escuro (é admin)
- [ ] Verificar consistência

## Padrão de Cores Correto:

### Para Componentes de Usuário (Public):
```tsx
// Fundo
className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"

// Cards
className="bg-white rounded-lg shadow-md p-6"

// Títulos
className="text-3xl font-bold text-gray-900"

// Textos
className="text-gray-600"

// Inputs
className="bg-white border-gray-300 text-gray-900"
```

### Para Componentes Admin:
```tsx
// Manter fundo escuro
className="bg-gray-900"
className="bg-gray-800"
className="text-white"
className="text-gray-400"
```

## Moeda Padrão:
```tsx
// ERRADO:
R$ {value.toFixed(2)}

// CORRETO:
{value.toLocaleString('pt-AO')} Kz
```
