# 📚 Exemplos de Uso - Nova Arquitetura

## Guia Prático com Exemplos Reais

---

## 1. Gerenciar Produtos

### Listar Todos os Produtos

```typescript
import { useProducts } from './hooks/useDatabase';

function ProductList() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.nome}</h3>
          <p>{product.preco.toLocaleString('pt-AO')} Kz</p>
          <p>Estoque: {product.estoque}</p>
        </div>
      ))}
    </div>
  );
}
```

### Criar Novo Produto (Admin)

```typescript
import { useProducts } from './hooks/useDatabase';

function AdminProductForm() {
  const { createProduct } = useProducts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = await createProduct({
      nome: 'Kingston RAM DDR4 8GB',
      descricao: 'Memória RAM DDR4 2666MHz para servidor',
      preco: 15000,
      categoria: 'Memória RAM',
      subcategoria: 'DDR4',
      estoque: 50,
      imagens: ['https://example.com/image.jpg'],
      especificacoes: {
        capacidade: '8GB',
        tipo: 'DDR4',
        velocidade: '2666MHz'
      }
    });

    console.log('Produto criado:', newProduct.id);
    alert('Produto criado com sucesso!');
  };

  return <form onSubmit={handleSubmit}>{ /* ... */ }</form>;
}
```

### Atualizar Estoque

```typescript
import { useProducts } from './hooks/useDatabase';

function StockManager({ productId }: { productId: string }) {
  const { updateProduct } = useProducts();

  const addStock = async (quantity: number) => {
    const product = await updateProduct(productId, {
      estoque: quantity // Novo estoque
    });

    if (product) {
      alert(`Estoque atualizado para ${product.estoque}`);
    }
  };

  return (
    <button onClick={() => addStock(100)}>
      Adicionar 100 unidades
    </button>
  );
}
```

---

## 2. Gerenciar Pedidos

### Criar Pedido no Checkout

```typescript
import { useOrders } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';

function CheckoutPage({ cart, total }: CheckoutProps) {
  const { createOrder } = useOrders();
  const { user } = useAuth();

  const handleCheckout = async () => {
    try {
      const newOrder = await createOrder({
        customer: {
          nome: user?.name || 'Cliente',
          email: user?.email || 'email@example.com',
          telefone: '+244 900 000 000',
          endereco: 'Luanda, Angola'
        },
        items: cart.map(item => ({
          productId: item.product.id,
          nome: item.product.nome,
          preco: item.product.preco,
          quantidade: item.quantity
        })),
        total: total,
        frete: 2000,
        metodoPagamento: 'Multicaixa Express'
      });

      console.log('Pedido criado:', newOrder.id);
      alert(`Pedido #${newOrder.id} criado com sucesso!`);
      
      // Redirecionar para página de confirmação
      window.location.href = `/order/${newOrder.id}`;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    }
  };

  return (
    <button onClick={handleCheckout}>
      Finalizar Compra
    </button>
  );
}
```

### Listar Pedidos do Cliente

```typescript
import { useOrders } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';

function MyOrdersPage() {
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.email);

  if (loading) return <div>Carregando pedidos...</div>;

  return (
    <div>
      <h1>Meus Pedidos</h1>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Pedido #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: {order.total.toLocaleString('pt-AO')} Kz</p>
          <p>Data: {new Date(order.created_at).toLocaleDateString('pt-AO')}</p>
          
          <h4>Itens:</h4>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.nome} - {item.quantidade}x - {item.preco.toLocaleString('pt-AO')} Kz
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Atualizar Status do Pedido (Admin)

```typescript
import { useOrders } from './hooks/useDatabase';

function AdminOrderManager({ orderId }: { orderId: string }) {
  const { updateOrderStatus } = useOrders();

  const markAsShipped = async () => {
    const updated = await updateOrderStatus(orderId, 'shipped');
    
    if (updated) {
      alert('Pedido marcado como enviado!');
      // TODO: Enviar notificação por email/WhatsApp
    }
  };

  const markAsDelivered = async () => {
    const updated = await updateOrderStatus(orderId, 'delivered');
    
    if (updated) {
      alert('Pedido marcado como entregue!');
    }
  };

  return (
    <div>
      <button onClick={markAsShipped}>Marcar como Enviado</button>
      <button onClick={markAsDelivered}>Marcar como Entregue</button>
    </div>
  );
}
```

---

## 3. Sistema de Avaliações

### Adicionar Avaliação

```typescript
import { useReviews } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';

function ProductReviewForm({ productId }: { productId: string }) {
  const { createReview, refreshReviews } = useReviews(productId);
  const { user } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Faça login para avaliar');
      return;
    }

    const review = await createReview({
      productId,
      customerName: user.name,
      customerEmail: user.email,
      rating,
      comment
    });

    console.log('Avaliação criada:', review.id);
    alert('Avaliação enviada com sucesso!');
    
    // Limpar formulário
    setRating(5);
    setComment('');
    
    // Recarregar avaliações
    await refreshReviews();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nota:</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
          <option value={4}>⭐⭐⭐⭐ Muito Bom</option>
          <option value={3}>⭐⭐⭐ Bom</option>
          <option value={2}>⭐⭐ Regular</option>
          <option value={1}>⭐ Ruim</option>
        </select>
      </div>
      
      <div>
        <label>Comentário:</label>
        <textarea 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          placeholder="Compartilhe sua experiência..."
          required
        />
      </div>
      
      <button type="submit">Enviar Avaliação</button>
    </form>
  );
}
```

### Exibir Avaliações

```typescript
import { useReviews } from './hooks/useDatabase';

function ProductReviews({ productId }: { productId: string }) {
  const { reviews, loading } = useReviews(productId);

  if (loading) return <div>Carregando avaliações...</div>;

  // Calcular média
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <h3>Avaliações ({reviews.length})</h3>
      
      {reviews.length > 0 && (
        <div>
          <p>Média: {averageRating.toFixed(1)} ⭐</p>
        </div>
      )}
      
      {reviews.map(review => (
        <div key={review.id} className="review">
          <div className="review-header">
            <strong>{review.customerName}</strong>
            <span>{'⭐'.repeat(review.rating)}</span>
          </div>
          <p>{review.comment}</p>
          <small>
            {new Date(review.created_at).toLocaleDateString('pt-AO')}
          </small>
        </div>
      ))}
      
      {reviews.length === 0 && (
        <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
      )}
    </div>
  );
}
```

---

## 4. Sistema de Cupons

### Validar e Aplicar Cupom

```typescript
import { useState } from 'react';
import { useCoupons } from './hooks/useDatabase';

function CartCouponInput({ orderTotal }: { orderTotal: number }) {
  const { validateCoupon, useCoupon } = useCoupons();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    setError('');
    setDiscount(0);

    const result = await validateCoupon(couponCode, orderTotal);

    if (result.valid && result.discount) {
      // Cupom válido!
      setDiscount(result.discount);
      await useCoupon(couponCode);
      alert(`Cupom aplicado! Desconto de ${result.discount.toLocaleString('pt-AO')} Kz`);
    } else {
      // Cupom inválido
      setError(result.message || 'Cupom inválido');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        placeholder="Código do cupom"
      />
      <button onClick={handleApplyCoupon}>Aplicar</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {discount > 0 && (
        <div style={{ color: 'green' }}>
          ✅ Desconto de {discount.toLocaleString('pt-AO')} Kz aplicado!
        </div>
      )}

      <div>
        <strong>Subtotal:</strong> {orderTotal.toLocaleString('pt-AO')} Kz
        {discount > 0 && (
          <>
            <br />
            <strong>Desconto:</strong> -{discount.toLocaleString('pt-AO')} Kz
            <br />
            <strong>Total:</strong> {(orderTotal - discount).toLocaleString('pt-AO')} Kz
          </>
        )}
      </div>
    </div>
  );
}
```

### Criar Cupom (Admin)

```typescript
import { useCoupons } from './hooks/useDatabase';

function AdminCouponForm() {
  const { createCoupon } = useCoupons();

  const handleCreateCoupon = async () => {
    const coupon = await createCoupon({
      code: 'BLACKFRIDAY2024',
      discount: 20, // 20%
      minPurchase: 50000, // Mínimo 50.000 Kz
      maxUses: 100,
      validUntil: '2024-11-30T23:59:59',
      active: true
    });

    console.log('Cupom criado:', coupon.code);
    alert(`Cupom ${coupon.code} criado com sucesso!`);
  };

  return (
    <button onClick={handleCreateCoupon}>
      Criar Cupom Black Friday
    </button>
  );
}
```

---

## 5. Programa de Fidelidade

### Exibir Pontos do Cliente

```typescript
import { useLoyalty } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';

function LoyaltyDashboard() {
  const { user } = useAuth();
  const { loyaltyPoints, loading } = useLoyalty(user?.id || null);

  if (!user) return <div>Faça login para ver seus pontos</div>;
  if (loading) return <div>Carregando...</div>;
  if (!loyaltyPoints) return null;

  const tierColors = {
    bronze: 'bg-amber-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-400',
    platinum: 'bg-purple-500'
  };

  const tierNames = {
    bronze: 'Bronze',
    silver: 'Prata',
    gold: 'Ouro',
    platinum: 'Platina'
  };

  return (
    <div className="loyalty-card">
      <h2>Programa de Fidelidade</h2>
      
      <div className={`tier-badge ${tierColors[loyaltyPoints.tier]}`}>
        {tierNames[loyaltyPoints.tier]}
      </div>
      
      <div className="points">
        <h3>{loyaltyPoints.points} Pontos</h3>
        <p>Total gasto: {loyaltyPoints.totalSpent.toLocaleString('pt-AO')} Kz</p>
      </div>

      <div className="tier-progress">
        <h4>Próximo nível:</h4>
        {loyaltyPoints.tier === 'bronze' && (
          <p>Gaste mais {(200000 - loyaltyPoints.totalSpent).toLocaleString('pt-AO')} Kz para Prata</p>
        )}
        {loyaltyPoints.tier === 'silver' && (
          <p>Gaste mais {(500000 - loyaltyPoints.totalSpent).toLocaleString('pt-AO')} Kz para Ouro</p>
        )}
        {loyaltyPoints.tier === 'gold' && (
          <p>Gaste mais {(1000000 - loyaltyPoints.totalSpent).toLocaleString('pt-AO')} Kz para Platina</p>
        )}
        {loyaltyPoints.tier === 'platinum' && (
          <p>🎉 Você atingiu o nível máximo!</p>
        )}
      </div>
    </div>
  );
}
```

### Resgatar Pontos

```typescript
import { useLoyalty } from './hooks/useDatabase';
import { useAuth } from './hooks/useAuth';

function RedeemPointsButton() {
  const { user } = useAuth();
  const { loyaltyPoints, redeemPoints } = useLoyalty(user?.id || null);

  const handleRedeem = async () => {
    if (!loyaltyPoints) return;

    const pointsToRedeem = 1000; // 1000 pontos = 1000 Kz de desconto
    
    if (loyaltyPoints.points < pointsToRedeem) {
      alert('Pontos insuficientes!');
      return;
    }

    const success = await redeemPoints(pointsToRedeem);
    
    if (success) {
      alert(`${pointsToRedeem} pontos resgatados! Você ganhou ${pointsToRedeem} Kz de desconto.`);
      // Aplicar desconto no carrinho...
    }
  };

  return (
    <button onClick={handleRedeem} disabled={!loyaltyPoints || loyaltyPoints.points < 1000}>
      Resgatar 1000 Pontos (1000 Kz)
    </button>
  );
}
```

---

## 6. Chatbot com IA

### Usar Chatbot Programaticamente

```typescript
import { sendChatMessage, type ChatMessage } from './services/gemini';

async function askAIAssistant(question: string) {
  const conversationHistory: ChatMessage[] = [
    {
      role: 'user',
      content: 'Olá',
      timestamp: new Date().toISOString()
    },
    {
      role: 'assistant',
      content: 'Olá! Como posso ajudar?',
      timestamp: new Date().toISOString()
    }
  ];

  const response = await sendChatMessage(question, conversationHistory);
  console.log('Resposta da IA:', response);
  return response;
}

// Exemplo de uso:
const resposta = await askAIAssistant('Qual o melhor SSD para servidor?');
```

---

## 7. Analytics e Estatísticas

### Dashboard Admin

```typescript
import { useAnalytics } from './hooks/useDatabase';

function AdminDashboard() {
  const { stats, loading, track } = useAnalytics();

  // Rastrear evento quando dashboard é aberto
  useEffect(() => {
    track('admin_dashboard_viewed', { timestamp: new Date().toISOString() });
  }, []);

  if (loading) return <div>Carregando estatísticas...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard Administrativo</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pedidos</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Receita Total</h3>
          <p className="stat-value">{stats.totalRevenue.toLocaleString('pt-AO')} Kz</p>
        </div>

        <div className="stat-card">
          <h3>Clientes</h3>
          <p className="stat-value">{stats.totalCustomers}</p>
        </div>

        <div className="stat-card">
          <h3>Produtos</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
      </div>

      <div className="revenue-per-customer">
        <h3>Ticket Médio</h3>
        <p>
          {stats.totalCustomers > 0 
            ? (stats.totalRevenue / stats.totalCustomers).toLocaleString('pt-AO')
            : '0'
          } Kz
        </p>
      </div>
    </div>
  );
}
```

---

## 8. Gerenciar Clientes

### Listar Clientes (Admin)

```typescript
import { useCustomers } from './hooks/useDatabase';

function AdminCustomerList() {
  const { customers, loading } = useCustomers();

  if (loading) return <div>Carregando clientes...</div>;

  return (
    <div>
      <h2>Clientes ({customers.length})</h2>
      
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.nome}</td>
              <td>{customer.email}</td>
              <td>{customer.telefone}</td>
              <td>
                {new Date(customer.created_at).toLocaleDateString('pt-AO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🎯 Dicas e Boas Práticas

### 1. Tratamento de Erros

```typescript
try {
  const order = await createOrder(orderData);
  console.log('Sucesso:', order);
} catch (error) {
  console.error('Erro:', error);
  alert('Erro ao criar pedido. Tente novamente.');
}
```

### 2. Loading States

```typescript
const { products, loading } = useProducts();

if (loading) {
  return <div className="spinner">Carregando...</div>;
}

return <ProductList products={products} />;
```

### 3. Refetch Data

```typescript
const { products, refreshProducts } = useProducts();

// Recarregar após ação
const handleDelete = async (id: string) => {
  await deleteProduct(id);
  await refreshProducts(); // Atualizar lista
};
```

### 4. Conditional Hooks

```typescript
// ✅ Correto
const { user } = useAuth();
const { loyaltyPoints } = useLoyalty(user?.id || null);

// ❌ Errado
if (user) {
  const { loyaltyPoints } = useLoyalty(user.id); // Hooks devem ser no topo!
}
```

---

## 📚 Recursos Adicionais

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guia completo de migração
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Resumo executivo
- [/services/database.ts](./services/database.ts) - Código fonte dos serviços
- [/hooks/useDatabase.tsx](./hooks/useDatabase.tsx) - Código fonte dos hooks

---

**Desenvolvido para KZSTORE 🇦🇴**
