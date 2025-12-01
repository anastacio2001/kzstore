# 🗄️ ESTRUTURA FINAL DO BANCO - KZSTORE

**Status:** ✅ LIMPO E PRONTO PARA USO  
**Data:** 22 de Novembro de 2025  
**Migração:** Concluída com sucesso

---

## 📋 TABELAS (11 TOTAL)

### 1️⃣ **PRODUCTS** (11 registros)
```typescript
interface Product {
  id: string;                    // uuid (PK)
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  preco_aoa: number;
  preco_usd?: number;
  custo_aoa?: number;
  margem_lucro?: number;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  imagens?: string[];            // array
  especificacoes?: object;       // jsonb
  marca?: string;
  modelo?: string;
  sku?: string;
  codigo_barras?: string;
  peso_kg?: number;
  dimensoes?: object;            // jsonb
  ativo?: boolean;
  destaque?: boolean;
  is_featured?: boolean;
  featured_order?: number;
  fornecedor?: string;
  condicao?: string;
  tags?: string[];               // array
  category_id?: string;          // uuid
  subcategory_id?: string;       // uuid
  created_at?: string;
  updated_at?: string;
}
```

---

### 2️⃣ **ORDERS** (2 registros)
```typescript
interface Order {
  id: string;                    // uuid (PK)
  order_number: string;          // único
  user_id: string;               // uuid
  user_name: string;
  user_email: string;
  items: OrderItem[];            // jsonb
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_type?: string;
  discount_details?: string;
  shipping_cost: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: Address;     // jsonb
  status: string;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

interface OrderItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

interface Address {
  nome: string;
  telefone: string;
  provincia: string;
  municipio: string;
  bairro: string;
  rua: string;
  casa?: string;
  referencia?: string;
}
```

---

### 3️⃣ **REVIEWS** (11 registros) ✅ LIMPO
```typescript
interface Review {
  id: string;                    // uuid (PK)
  product_id: string;            // uuid (FK)
  user_id?: string;              // uuid
  user_name: string;
  user_email: string;
  rating: number;                // 1-5
  comment?: string;
  is_approved?: boolean;
  is_verified_purchase?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
```
**✅ Removidos:** `customer_name`, `customer_email`

---

### 4️⃣ **COUPONS** (1 registro) ✅ LIMPO
```typescript
interface Coupon {
  id: string;                    // uuid (PK)
  code: string;                  // único
  description?: string;
  discount_type: string;         // 'percentage' | 'fixed'
  discount_value: number;
  max_discount?: number;
  minimum_order_value?: number;
  usage_limit?: number;
  used_count?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}
```
**✅ Removidos:** `active`, `max_uses`, `min_purchase`

---

### 5️⃣ **PRICE_ALERTS** (1 registro)
```typescript
interface PriceAlert {
  id: string;                    // uuid (PK)
  product_id: string;            // text
  user_name: string;
  user_email: string;
  target_price: number;
  notified?: boolean;
  notified_at?: string;
  created_at?: string;
}
```

---

### 6️⃣ **FLASH_SALES** (1 registro) ✅ LIMPO
```typescript
interface FlashSale {
  id: string;                    // uuid (PK)
  product_id: string;            // uuid (FK)
  title: string;
  description?: string;
  product_name?: string;
  original_price?: number;
  sale_price?: number;
  discount_percentage: number;
  stock_limit: number;
  stock_sold: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
```
**✅ Removidos:** `active`, `quantity_available`, `quantity_sold`

---

### 7️⃣ **CUSTOMER_PROFILES** (0 registros)
```typescript
interface CustomerProfile {
  id: string;                    // text (PK)
  auth_user_id?: string;         // uuid (FK Supabase Auth)
  nome: string;
  email: string;
  telefone?: string;
  endereco?: Address;            // jsonb
  preferences?: object;          // jsonb
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

---

### 8️⃣ **LOYALTY_ACCOUNTS** (0 registros)
```typescript
interface LoyaltyAccount {
  id: string;                    // text (PK)
  user_email: string;
  user_name: string;
  points: number;                // pontos atuais
  lifetime_points: number;       // total histórico
  tier?: string;                 // 'bronze' | 'silver' | 'gold' | 'platinum'
  created_at?: string;
  updated_at?: string;
}
```

---

### 9️⃣ **LOYALTY_HISTORY** (0 registros)
```typescript
interface LoyaltyHistory {
  id: string;                    // text (PK)
  user_email: string;
  type: string;                  // 'earn' | 'redeem' | 'expire'
  points: number;
  description?: string;
  order_id?: string;
  created_at?: string;
}
```

---

### 🔟 **STOCK_HISTORY** (0 registros)
```typescript
interface StockHistory {
  id: string;                    // text (PK)
  product_id: string;
  product_name: string;
  old_stock: number;
  new_stock: number;
  change_amount: number;
  reason?: string;
  order_id?: string;
  created_by?: string;
  created_at?: string;
}
```

---

### 1️⃣1️⃣ **ANALYTICS_EVENTS** (0 registros)
```typescript
interface AnalyticsEvent {
  id: string;                    // uuid (PK)
  event_type: string;
  event_category?: string;
  session_id: string;
  user_email?: string;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  order_id?: string;
  order_value?: number;
  cart_value?: number;
  search_query?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  metadata?: object;             // jsonb
  created_at?: string;
}
```

---

## 🎯 RESUMO DE MUDANÇAS

### ✅ **CAMPOS REMOVIDOS:**
1. **COUPONS:** `active`, `max_uses`, `min_purchase` (3 campos)
2. **FLASH_SALES:** `active`, `quantity_available`, `quantity_sold` (3 campos)
3. **REVIEWS:** `customer_name`, `customer_email` (2 campos)

**Total:** 8 campos duplicados removidos

### ✅ **CAMPOS MANTIDOS:**
1. **COUPONS:** `is_active`, `usage_limit`, `minimum_order_value`
2. **FLASH_SALES:** `is_active`, `stock_limit`, `stock_sold`
3. **REVIEWS:** `user_name`, `user_email`

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Estrutura limpa e documentada
2. 🔄 Atualizar código do servidor (backend)
3. 🔄 Atualizar código do frontend
4. 🔄 Criar helpers para Supabase
5. 🔄 Testar todas as funcionalidades

---

**Data de conclusão da limpeza:** 22/11/2025  
**Status:** ✅ PRONTO PARA DESENVOLVIMENTO
