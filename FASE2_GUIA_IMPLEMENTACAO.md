# 🚀 GUIA DE IMPLEMENTAÇÃO - FASE 2

## ✅ O que foi implementado

### 1. **OptimizedImage Component** 🖼️
Componente otimizado para imagens com:
- **Lazy Loading**: Carrega apenas quando visível na tela
- **Suporte WebP**: Formato moderno com fallback
- **Placeholder**: Efeito blur enquanto carrega
- **Compressão automática**: Reduz tamanho via query params
- **Tratamento de erro**: Mostra ícone quando imagem falha

#### Como usar:
```tsx
import { OptimizedImage } from './components/ui/OptimizedImage';

<OptimizedImage
  src={product.imagem_url}
  alt={product.nome}
  width={300}
  height={300}
  className="rounded-lg"
  priority={false} // true = sem lazy loading
/>
```

### 2. **Sistema de Analytics** 📊
Integração completa com Google Analytics 4 e Facebook Pixel.

#### Configuração:

**1. Adicionar ao .env:**
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=YOUR_PIXEL_ID
```

**2. Inicializar no App.tsx:**
```tsx
import { initAnalytics } from './utils/analytics';

useEffect(() => {
  initAnalytics();
}, []);
```

**3. Rastrear eventos:**
```tsx
import { analytics } from './utils/analytics';

// Visualizar produto
analytics.viewItem(product);

// Adicionar ao carrinho
analytics.addToCart(product, quantity);

// Compra concluída
analytics.purchase(orderId, cart, total, couponCode);

// Busca
analytics.search(query);

// Aplicar cupom
analytics.applyCoupon(couponCode, discount);
```

### 3. **Rate Limiting** 🛡️
Sistema de proteção contra spam e abuso.

#### Configurações pré-definidas:
- **COUPON**: 5 tentativas/minuto (bloqueio 5 min)
- **LOGIN**: 3 tentativas/5 min (bloqueio 15 min)
- **CREATE_ORDER**: 3 pedidos/5 min (bloqueio 10 min)
- **CONTACT_FORM**: 2/hora (bloqueio 2 horas)
- **CREATE_REVIEW**: 5/dia (bloqueio 24 horas)
- **SEARCH**: 30/minuto (bloqueio 1 min)

#### Como usar:
```tsx
import { checkRateLimit, getBrowserFingerprint } from './utils/rateLimiter';

const handleSubmit = () => {
  const fingerprint = getBrowserFingerprint();
  const rateCheck = checkRateLimit('COUPON', fingerprint);
  
  if (!rateCheck.allowed) {
    alert(`Aguarde ${rateCheck.blockedTime} segundos`);
    return;
  }

  // Continuar com a ação...
};
```

**Já integrado em:**
- ✅ CouponInput (aplicar cupons)

**Precisa adicionar em:**
- [ ] LoginPage
- [ ] CheckoutPage (criar pedido)
- [ ] Formulário de contato
- [ ] Sistema de avaliações

---

## 📋 Checklist de Integração

### **OptimizedImage** 🖼️
Substituir `<img>` por `<OptimizedImage>` nos seguintes arquivos:

- [ ] **ProductCard.tsx** (lista de produtos)
- [ ] **ProductDetailPage.tsx** (detalhes do produto)
- [ ] **CartPage.tsx** (itens no carrinho)
- [ ] **CheckoutPage.tsx** (resumo do pedido)
- [ ] **CustomerDashboard.tsx** (recomendações)
- [ ] **AdvancedSearch.tsx** (sugestões)
- [ ] **WishlistPage.tsx** (favoritos)
- [ ] **MyOrdersPage.tsx** (histórico)

**Exemplo de conversão:**
```tsx
// ANTES
<img 
  src={product.imagem_url} 
  alt={product.nome}
  className="w-full h-48 object-cover"
/>

// DEPOIS
<OptimizedImage
  src={product.imagem_url}
  alt={product.nome}
  width={300}
  height={192}
  className="w-full h-48"
/>
```

### **Analytics** 📊

#### 1. Inicializar no App.tsx
```tsx
import { initAnalytics, analytics } from './utils/analytics';

function App() {
  useEffect(() => {
    initAnalytics();
  }, []);
  
  // ...resto do código
}
```

#### 2. Adicionar eventos nos componentes:

**ProductDetailPage.tsx:**
```tsx
useEffect(() => {
  if (product) {
    analytics.viewItem(product);
  }
}, [product]);
```

**App.tsx (addToCart):**
```tsx
const addToCart = (product: Product, quantity: number = 1) => {
  analytics.addToCart(product, quantity);
  // ...resto do código
};
```

**CheckoutPage.tsx (beginCheckout):**
```tsx
useEffect(() => {
  analytics.beginCheckout(cart, total);
}, []);
```

**CheckoutPage.tsx (purchase):**
```tsx
const order = await createOrder(orderData);
analytics.purchase(
  order.order_number || order.id,
  cart,
  total,
  appliedCoupon?.code
);
```

**AdvancedSearch.tsx (search):**
```tsx
const handleSearch = (query: string) => {
  analytics.search(query);
  // ...resto do código
};
```

### **Rate Limiting** 🛡️

#### LoginPage.tsx
```tsx
import { checkRateLimit, getBrowserFingerprint } from '../utils/rateLimiter';

const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  
  const fingerprint = getBrowserFingerprint();
  const rateCheck = checkRateLimit('LOGIN', email);
  
  if (!rateCheck.allowed) {
    toast.error(`Muitas tentativas. Aguarde ${rateCheck.blockedTime}s`);
    return;
  }

  // ...resto do código de login
};
```

#### CheckoutPage.tsx
```tsx
const handleConfirmPayment = async () => {
  const fingerprint = getBrowserFingerprint();
  const rateCheck = checkRateLimit('CREATE_ORDER', user?.email || fingerprint);
  
  if (!rateCheck.allowed) {
    toast.error(`Limite de pedidos atingido. Aguarde ${rateCheck.blockedTime}s`);
    return;
  }

  // ...resto do código
};
```

---

## 🔧 Configuração do Google Analytics 4

### 1. Criar conta GA4
1. Acesse: https://analytics.google.com/
2. Admin → Criar Propriedade
3. Nome: "KZSTORE"
4. Fuso horário: Africa/Luanda
5. Moeda: AOA (Kwanza Angolano)

### 2. Criar fluxo de dados
1. Plataforma: Web
2. URL: https://kzstore.vercel.app
3. Nome do fluxo: "KZSTORE Production"
4. **Copiar Measurement ID** (formato: G-XXXXXXXXXX)

### 3. Adicionar ao Vercel
```bash
vercel env add VITE_GA_MEASUREMENT_ID
# Cole o ID: G-XXXXXXXXXX
# Marcar: Production, Preview, Development
```

---

## 📘 Configuração do Facebook Pixel

### 1. Criar Pixel
1. Acesse: https://business.facebook.com/
2. Eventos → Pixels → Criar Pixel
3. Nome: "KZSTORE Pixel"
4. **Copiar Pixel ID** (número de 15 dígitos)

### 2. Adicionar ao Vercel
```bash
vercel env add VITE_FB_PIXEL_ID
# Cole o ID do Pixel
# Marcar: Production, Preview, Development
```

---

## 🎯 Próximos Passos

1. **Executar migrations SQL:**
   - `increment_coupon_usage.sql` ✅
   - `notify_order_status.sql` (requer extensão pgsql-http)

2. **Substituir imagens por OptimizedImage**
   - Começar pelos componentes mais visitados

3. **Configurar Analytics**
   - Criar contas GA4 e Facebook
   - Adicionar IDs no Vercel
   - Testar eventos

4. **Adicionar Rate Limiting**
   - LoginPage
   - CheckoutPage
   - Formulários de contato

5. **Teste completo**
   - Testar fluxo de compra com analytics
   - Verificar carregamento de imagens
   - Testar bloqueio por rate limiting

---

## 📊 Monitoramento

### Google Analytics 4:
- Acesse: https://analytics.google.com/
- Tempo real → Ver eventos ao vivo
- Relatórios → E-commerce

### Facebook Events Manager:
- Acesse: https://business.facebook.com/events_manager
- Testar eventos → Pixel Helper extension

---

## 🐛 Troubleshooting

### OptimizedImage não carrega:
- Verificar URL da imagem
- Checar console do navegador
- Testar sem WebP (remover `<source>`)

### Analytics não rastreia:
- Verificar variáveis de ambiente
- Abrir DevTools → Console
- Procurar mensagens "📊 GA4" ou "📘 FB"

### Rate Limiting muito agressivo:
- Ajustar configurações em `rateLimiter.ts`
- Aumentar `maxAttempts` ou `windowMs`

---

**Status:** ✅ Fase 2 completa e pronta para integração!
