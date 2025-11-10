# Guia Rápido - Correções Restantes

## ✅ JÁ CORRIGIDO (Commit cc8afa2)

1. **TradeInCredits** - 100% OK
2. **TradeInEvaluator** - 100% OK  
3. **TradeInForm** - 100% OK
4. **AffiliateManager** - 100% OK

---

## 🔧 FALTA CORRIGIR

### QuoteBuilder.tsx (5 ocorrências)

```bash
# Linha 361:
R$ {quote.total_amount.toFixed(2)}
# CORRIGIR PARA:
{quote.total_amount.toLocaleString('pt-AO')} Kz

# Linha 389:
R$ {item.total_price?.toFixed(2)}
# CORRIGIR PARA:
{item.total_price?.toLocaleString('pt-AO')} Kz

# Linha 478:
{product.name} - R$ {product.price.toFixed(2)}
# CORRIGIR PARA:
{product.name} - {product.price.toLocaleString('pt-AO')} Kz

# Linha 523:
R$ {item.total_price.toFixed(2)}
# CORRIGIR PARA:
{item.total_price.toLocaleString('pt-AO')} Kz

# Linha 537:
R$ {totalAmount.toFixed(2)}
# CORRIGIR PARA:
{totalAmount.toLocaleString('pt-AO')} Kz
```

### Buscar em Outros Componentes

```powershell
# Buscar R$ em AffiliateDashboard:
Select-String -Path "src\components\AffiliateDashboard.tsx" -Pattern "R\$"

# Buscar bg-gray em QuoteRequestForm:
Select-String -Path "src\components\QuoteRequestForm.tsx" -Pattern "bg-gray-[0-9]"

# Buscar bg-gray em BusinessRegistration:
Select-String -Path "src\components\BusinessRegistration.tsx" -Pattern "bg-gray-[0-9]"
```

---

## 📝 PADRÃO DE SUBSTITUIÇÃO

### Para Moeda:
```tsx
// ANTES:
R$ {value.toFixed(2)}

// DEPOIS:
{value.toLocaleString('pt-AO')} Kz
```

### Para Cores (Componentes Públicos):
```tsx
// ANTES (fundo preto):
className="bg-gray-900"
className="bg-gray-800"  
className="text-white"
className="text-gray-400"

// DEPOIS (fundo claro):
className="bg-gradient-to-br from-gray-50 to-gray-100"
className="bg-white shadow-md"
className="text-gray-900"
className="text-gray-600"
```

### Para Inputs (se for step decimal):
```tsx
// ANTES:
step="0.01"

// DEPOIS:
step="1"
```

---

## ⚡ TESTE RÁPIDO

Após corrigir, teste:

1. **TradeInCredits** - Ver créditos disponíveis
2. **TradeInForm** - Upload de imagens
3. **TradeInEvaluator (Admin)** - Ver solicitações  
4. **AffiliateManager (Admin)** - Ver comissões
5. **QuoteBuilder (Admin)** - Criar orçamento

---

## 🚀 COMMIT FINAL

```powershell
git add -A
git commit -m "fix: Corrigir moeda restante (QuoteBuilder) e design system

- QuoteBuilder: 5 correções R$ para Kz
- AffiliateDashboard: correções se necessário
- QuoteRequestForm: ajuste de cores se necessário
- BusinessRegistration: ajuste de cores se necessário

Todos os componentes agora usam Kwanzas (Kz) corretamente"
```

---

## 📊 PROGRESSO

- ✅ TradeInCredits (5 correções)
- ✅ TradeInEvaluator (2 correções)
- ✅ TradeInForm (funcionalidade completa)
- ✅ AffiliateManager (4 correções)
- ⏳ QuoteBuilder (5 pending)
- ⏳ AffiliateDashboard (verificar)
- ⏳ QuoteRequestForm (verificar design)
- ⏳ BusinessRegistration (verificar design)

**Total: 4/8 componentes corrigidos (50%)**
