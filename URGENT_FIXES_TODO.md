# CORREÇÕES URGENTES - Design e Funcionalidade

## ❌ PROBLEMAS IDENTIFICADOS

1. **QuoteRequestForm** - Fundo preto (deve ser branco como MyTicketsPage)
2. **BusinessRegistration** - Fundo preto + info brasileiras (deve ser angolanas)
3. **TradeInCredits** - Fundo preto (deve ser branco)
4. **BusinessRegistration** - Botão não funciona + dados não chegam no admin

---

## ✅ PARCIALMENTE CORRIGIDO

### QuoteRequestForm
- [x] Header com fundo claro
- [x] Seção "Dados de Contato" com fundo claro
- [x] Seção "Itens do Orçamento" header
- [ ] FALTA: Items individuais (bg-gray-800 → bg-white)
- [ ] FALTA: Seção "Observações Adicionais"
- [ ] FALTA: Botão de envio

**Código restante para corrigir:**
```tsx
// Linha ~209: Items individuais
<div key={item.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
  <h4 className="text-sm font-semibold text-gray-400">Item {index + 1}</h4>
  // ... inputs com bg-gray-900, text-white, border-gray-700
</div>

// Trocar para:
<div key={item.id} className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
  <h4 className="text-sm font-semibold text-gray-700">Item {index + 1}</h4>
  // ... inputs com bg-white, text-gray-900, border-gray-300
</div>

// Linha ~280: Observações Adicionais
<div className="bg-gray-900 rounded-lg p-6">
  <label className="block text-sm font-medium text-gray-400 mb-2">

// Trocar para:
<div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
  <label className="block text-sm font-medium text-gray-700 mb-2">
```

---

## ⏳ NÃO INICIADO

### BusinessRegistration

**Problemas:**
1. Design escuro (mudar para claro)
2. Informações brasileiras:
   - CEP → Código Postal
   - "Rio de Janeiro" → Províncias de Angola
   - Faixas de volume já corrigidas (50k-500k Kz)

**Informações Angolanas Corretas:**
```tsx
// Províncias de Angola:
const provincias = [
  'Luanda',
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire'
];

// Telefone placeholder:
"+244 9XX XXX XXX"

// CEP → Código Postal
"Código Postal" (se aplicável)
```

**Botão de Envio:**
Verificar linha ~350 se tem `onSubmit` correto e `type="submit"`

---

### TradeInCredits

Já tem alguns cards OK, mas precisa revisar:
- Fundo da página principal
- Cards de stats (já OK - verde/azul/vermelho)
- Tabs (podem manter escuro)
- Empty states

---

## 🔧 PADRÃO DE CORREÇÃO

### Fundo da Página:
```tsx
// ❌ ANTES:
<div className="max-w-4xl mx-auto p-6">
  <div className="bg-gray-800 rounded-lg p-8">

// ✅ DEPOIS:
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
  <div className="max-w-4xl mx-auto px-4">
    <div className="bg-white rounded-lg shadow-md p-8">
```

### Seções Internas:
```tsx
// ❌ ANTES:
<div className="bg-gray-900 rounded-lg p-6">
  <h3 className="text-white">

// ✅ DEPOIS:
<div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
  <h3 className="text-gray-900">
```

### Inputs:
```tsx
// ❌ ANTES:
<label className="text-gray-400">
<input className="bg-gray-800 border-gray-700 text-white">

// ✅ DEPOIS:
<label className="text-gray-700">
<input className="bg-white border-gray-300 text-gray-900">
```

### Headers de Card:
```tsx
// ❌ ANTES:
<div className="bg-yellow-500/20 p-3 rounded-lg">
  <FileText className="text-yellow-400" />

// ✅ DEPOIS:
<div className="bg-yellow-100 p-3 rounded-lg">
  <FileText className="text-yellow-600" />
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Terminar QuoteRequestForm:**
   - Procurar todos `bg-gray-800`, `bg-gray-900`
   - Substituir por `bg-white` ou `bg-gray-50`
   - Trocar `text-white` → `text-gray-900`
   - Trocar `text-gray-400` → `text-gray-700`/`text-gray-600`
   - Trocar `border-gray-700` → `border-gray-300`/`border-gray-200`

2. **Corrigir BusinessRegistration:**
   - Aplicar mesmas mudanças de cor
   - Trocar "CEP" por "Código Postal"
   - Trocar select de estados por províncias
   - Trocar placeholder de telefone
   - Verificar função `handleSubmit`
   - Testar envio no admin

3. **Revisar TradeInCredits:**
   - Já tem bom design nos cards
   - Verificar fundo da página
   - Manter tabs escuras (OK)

4. **Testar Tudo:**
   - QuoteRequestForm: Enviar orçamento
   - BusinessRegistration: Enviar cadastro
   - Verificar no AdminPanel se chegam os dados

---

## 📝 ARQUIVOS PARA EDITAR

1. `src/components/QuoteRequestForm.tsx` - Linhas 200-315
2. `src/components/BusinessRegistration.tsx` - Todo o arquivo
3. `src/components/TradeInCredits.tsx` - Verificar linha 1-150
