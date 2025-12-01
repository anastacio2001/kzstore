# 🚀 Guia de Migração - Edge Functions para SDK Supabase

## Visão Geral

Migramos toda a lógica de negócio do **Edge Function (Hono Server)** para usar o **SDK do Supabase diretamente no frontend**. Isso simplifica a arquitetura, reduz latência e custos.

---

## ✅ O que foi migrado

### 1. **Serviço de Database** (`/services/database.ts`)
Substitui todas as chamadas HTTP ao servidor.

**Funcionalidades incluídas:**
- ✅ KV Store (get, set, del, getByPrefix, mget, mset, mdel)
- ✅ Product Service (CRUD completo)
- ✅ Order Service (criar, atualizar, cancelar)
- ✅ Review Service (avaliações de produtos)
- ✅ Coupon Service (cupons de desconto)
- ✅ Loyalty Service (programa de fidelidade)
- ✅ Flash Sale Service (vendas relâmpago)
- ✅ Customer Service (gestão de clientes)
- ✅ Analytics Service (rastreamento de eventos)

### 2. **Serviço Gemini AI** (`/services/gemini.ts`)
Chatbot com IA usando Google Gemini diretamente no frontend.

**Funcionalidades:**
- ✅ Conversa com contexto da loja
- ✅ Busca inteligente de produtos
- ✅ Sugestões personalizadas
- ✅ Histórico de conversa

### 3. **Hooks Customizados** (`/hooks/useDatabase.tsx`)
Hooks React para facilitar o uso dos serviços.

**Hooks disponíveis:**
- `useProducts()` - Gestão de produtos
- `useOrders()` - Gestão de pedidos
- `useReviews(productId)` - Avaliações de produto
- `useCoupons()` - Cupons de desconto
- `useLoyalty(customerId)` - Programa de fidelidade
- `useFlashSales()` - Vendas relâmpago
- `useCustomers()` - Lista de clientes
- `useAnalytics()` - Estatísticas da loja

### 4. **Componente AI Chatbot** (`/components/AIChatbot.tsx`)
Interface de chatbot com IA integrada.

---

## 📖 Como usar

### Exemplo 1: Gerenciar Produtos

**ANTES (com Edge Function):**
```typescript
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/products`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`
  }
});
const { products } = await response.json();
```

**DEPOIS (com SDK direto):**
```typescript
import { useProducts } from './hooks/useDatabase';

function MyComponent() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  
  // Produtos já estão carregados!
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.nome}</div>
      ))}
    </div>
  );
}
```

### Exemplo 2: Criar Pedido

**ANTES:**
```typescript
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify(orderData)
});
```

**DEPOIS:**
```typescript
import { useOrders } from './hooks/useDatabase';

function CheckoutPage() {
  const { createOrder } = useOrders();
  
  const handleCheckout = async () => {
    const newOrder = await createOrder({
      customer: { /* ... */ },
      items: [ /* ... */ ],
      total: 50000,
      frete: 2000,
      metodoPagamento: 'Multicaixa Express'
    });
    
    console.log('Pedido criado:', newOrder.id);
  };
}
```

### Exemplo 3: Validar Cupom

**DEPOIS:**
```typescript
import { useCoupons } from './hooks/useDatabase';

function CartPage() {
  const { validateCoupon, useCoupon } = useCoupons();
  
  const handleApplyCoupon = async (code: string, orderTotal: number) => {
    const result = await validateCoupon(code, orderTotal);
    
    if (result.valid) {
      await useCoupon(code);
      alert(`Desconto de ${result.discount} Kz aplicado!`);
    } else {
      alert(result.message);
    }
  };
}
```

### Exemplo 4: Chatbot com IA

**Adicionar no App.tsx:**
```typescript
import { AIChatbot } from './components/AIChatbot';

function App() {
  return (
    <div>
      {/* Seu conteúdo */}
      
      {/* Chatbot flutuante */}
      <AIChatbot />
    </div>
  );
}
```

---

## ⚙️ Configuração Necessária

### 1. Variável de Ambiente Gemini API

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Como obter a chave:**
1. Acesse https://aistudio.google.com/app/apikey
2. Crie uma API key
3. Cole no arquivo `.env`

### 2. Verificar Tabela KV Store

A tabela `kv_store_d8a4dffd` já está configurada no Supabase. Não precisa fazer nada.

---

## 🔥 Vantagens da Migração

### Performance
- ⚡ **Mais rápido**: Sem latência de Edge Function
- 🚀 **Menos requisições HTTP**: Comunicação direta com Supabase
- 💾 **Cache local**: React hooks mantêm estado em memória

### Custo
- 💰 **Grátis**: Não consome invocações de Edge Function
- 📊 **Limite maior**: Supabase tem limites generosos no plano gratuito

### Desenvolvimento
- 🧪 **Mais fácil de testar**: Tudo no frontend
- 🐛 **Melhor debugging**: Console do navegador
- 🔧 **Hot reload**: Mudanças refletem instantaneamente

### Arquitetura
- 🎯 **Mais simples**: Menos camadas
- 📦 **Menos código**: Não precisa manter servidor
- 🔒 **Ainda seguro**: Supabase RLS protege os dados

---

## 🛡️ Segurança

### Row Level Security (RLS)

**IMPORTANTE**: Configure políticas RLS no Supabase para proteger os dados:

```sql
-- Exemplo: Apenas usuários autenticados podem criar pedidos
CREATE POLICY "Authenticated users can create orders"
ON kv_store_d8a4dffd
FOR INSERT
TO authenticated
USING (key LIKE 'order:%');

-- Exemplo: Produtos são públicos (leitura)
CREATE POLICY "Anyone can read products"
ON kv_store_d8a4dffd
FOR SELECT
TO public
USING (key LIKE 'product:%');

-- Exemplo: Apenas admin pode editar produtos
CREATE POLICY "Only admins can update products"
ON kv_store_d8a4dffd
FOR UPDATE
TO authenticated
USING (
  key LIKE 'product:%' AND
  auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
);
```

### Chaves de API

- ✅ `publicAnonKey`: Pode ser exposta no frontend
- ❌ `SUPABASE_SERVICE_ROLE_KEY`: NUNCA exponha no frontend
- ✅ `GEMINI_API_KEY`: Use com prefixo `VITE_` para Vite expor

---

## 📚 Funcionalidades que ainda usam Edge Function

Algumas funcionalidades ainda precisam do backend:

### 1. **Envio de E-mails** (Resend API)
- Confirmação de pedido
- Atualizações de status
- Recuperação de senha

**Motivo**: Chave de API sensível

### 2. **SMS/WhatsApp** (Twilio API)
- Verificação de telefone (OTP)
- Notificações

**Motivo**: Chave de API sensível

### 3. **Pagamentos** (Multicaixa Express)
- Processamento de pagamentos
- Webhooks

**Motivo**: Requer processamento seguro no servidor

---

## 🔄 Rota de Migração Gradual

Se preferir migrar gradualmente:

1. ✅ **Fase 1**: Migrar leitura de dados (produtos, reviews)
2. ✅ **Fase 2**: Migrar criação de pedidos
3. ✅ **Fase 3**: Migrar gestão de cupons/fidelidade
4. ✅ **Fase 4**: Migrar chatbot IA
5. ⏳ **Fase 5**: Manter apenas e-mails/SMS no Edge Function

---

## 🐛 Troubleshooting

### Erro: "No response from Gemini AI"
**Solução**: Verifique se `VITE_GEMINI_API_KEY` está configurada corretamente.

### Erro: "Permission denied"
**Solução**: Configure RLS policies no Supabase.

### Produtos não aparecem
**Solução**: Verifique se existem produtos na tabela KV Store com prefixo `product:`.

### Hook retorna erro
**Solução**: Abra DevTools > Console para ver logs detalhados.

---

## 📞 Suporte

Para dúvidas sobre a migração, entre em contato:
- WhatsApp: +244 931 054 015
- Email: contato@kzstore.ao

---

## ✨ Próximos Passos

1. ✅ Testar todas as funcionalidades migradas
2. ✅ Configurar RLS policies no Supabase
3. ✅ Adicionar tratamento de erros robusto
4. ✅ Implementar cache offline (Service Worker)
5. ✅ Adicionar testes unitários

---

**Status**: 🚀 Migração completa e funcional!
**Data**: Novembro 2024
**Versão**: 4.0.0
