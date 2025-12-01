# 🚀 MIGRAÇÃO COMPLETA: KV STORE → SUPABASE

## 📊 ANÁLISE COMPLETA DO CÓDIGO

### ✅ JÁ MIGRADO (Usando Supabase)
1. **Orders (Pedidos)** - ✅ Tabela `orders` criada e em uso
2. **Products Service** - ✅ `/services/productsService.ts` criado

### ❌ AINDA USANDO KV STORE (102+ ocorrências encontradas)

#### 1️⃣ **Products** (Produtos) - ALTA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 165, 213, 230, 253, 287, 305, 325, 340, 345, 358, 386, 455, 462, 508, 513, 793, 906, 979, 1028, 1101, 1445, 1503, 1770
- `/supabase/functions/server/index.tsx` - Linhas 305

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/products` - Buscar todos os produtos
- `GET /make-server-d8a4dffd/products/:id` - Buscar produto por ID
- `POST /make-server-d8a4dffd/products` - Criar produto
- `PUT /make-server-d8a4dffd/products/:id` - Atualizar produto
- `DELETE /make-server-d8a4dffd/products/:id` - Deletar produto
- `GET /make-server-d8a4dffd/products/low-stock` - Produtos com estoque baixo
- `GET /make-server-d8a4dffd/products/debug/ids` - Debug de IDs

**Ação:** Substituir todas as chamadas `kv.get('product:*')` por queries Supabase

---

#### 2️⃣ **Customers** (Clientes) - ALTA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 36, 71, 103, 142
- `/supabase/functions/server/index.tsx` - Linhas 329, 421, 433, 930, 1001, 1042
- `/hooks/useAdminData.tsx` - Linha 27

**Rotas afetadas:**
- `POST /make-server-d8a4dffd/auth/setup-admin` - Setup inicial do admin
- `POST /make-server-d8a4dffd/auth/signup` - Cadastro de clientes
- `GET /make-server-d8a4dffd/customers` - Buscar todos os clientes
- `POST /make-server-d8a4dffd/customers` - Criar cliente (legacy)

**Ação:** Criar service `/services/customersService.ts` ou usar Supabase Auth diretamente

---

#### 3️⃣ **Reviews** (Avaliações) - MÉDIA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 1062, 1091, 1101, 1123, 1144, 1155, 1171, 1176, 1191
- `/components/ProductReviews.tsx` - Linhas 50, 110

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/reviews/product/:productId` - Reviews de um produto
- `POST /make-server-d8a4dffd/reviews` - Criar review
- `PATCH /make-server-d8a4dffd/reviews/:id/status` - Aprovar/rejeitar review
- `DELETE /make-server-d8a4dffd/reviews/:id` - Deletar review
- `GET /make-server-d8a4dffd/reviews/user/:email` - Reviews do usuário

**Ação:** O arquivo `/services/reviewsService.ts` já existe, mas precisa ser atualizado

---

#### 4️⃣ **Coupons** (Cupons) - MÉDIA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 1213, 1231, 1297, 1321, 1338, 1352, 1368, 1373, 1389, 1400
- `/components/admin/CouponManagement.tsx` - Linha 125

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/coupons` - Listar cupons
- `GET /make-server-d8a4dffd/coupons/validate/:code` - Validar cupom
- `POST /make-server-d8a4dffd/coupons` - Criar cupom
- `PUT /make-server-d8a4dffd/coupons/:id` - Atualizar cupom
- `DELETE /make-server-d8a4dffd/coupons/:id` - Deletar cupom
- `POST /make-server-d8a4dffd/coupons/:id/use` - Incrementar uso

**Ação:** O arquivo `/services/couponsService.ts` já existe, mas precisa ser atualizado

---

#### 5️⃣ **Price Alerts** (Alertas de Preço) - MÉDIA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 1419, 1445, 1466, 1482, 1487, 1503, 1508, 1528

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/price-alerts/user/:email` - Alertas do usuário
- `POST /make-server-d8a4dffd/price-alerts` - Criar alerta
- `DELETE /make-server-d8a4dffd/price-alerts/:id` - Deletar alerta
- `GET /make-server-d8a4dffd/price-alerts/check/:product_id` - Verificar alertas

**Ação:** Criar service `/services/priceAlertsService.ts`

---

#### 6️⃣ **Loyalty** (Programa de Fidelidade) - BAIXA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 1555, 1568, 1582, 1607, 1638, 1653, 1677, 1692, 1706
- `/components/LoyaltyWidget.tsx` - Linha 69
- `/components/MyLoyaltyPage.tsx` - Linhas 100, 116, 160

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/loyalty/user/:email` - Conta de fidelidade
- `GET /make-server-d8a4dffd/loyalty/history/:email` - Histórico
- `POST /make-server-d8a4dffd/loyalty/add-points` - Adicionar pontos
- `POST /make-server-d8a4dffd/loyalty/redeem-points` - Resgatar pontos

**Ação:** Criar service `/services/loyaltyService.ts`

---

#### 7️⃣ **Flash Sales** (Vendas Relâmpago) - BAIXA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 1729, 1748, 1770, 1799, 1816, 1829, 1845, 1850

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/flash-sales/active` - Vendas ativas
- `GET /make-server-d8a4dffd/flash-sales` - Todas as vendas (admin)
- `POST /make-server-d8a4dffd/flash-sales` - Criar venda
- `PUT /make-server-d8a4dffd/flash-sales/:id` - Atualizar venda
- `DELETE /make-server-d8a4dffd/flash-sales/:id` - Deletar venda

**Ação:** Criar service `/services/flashSalesService.ts`

---

#### 8️⃣ **Stock History** (Histórico de Estoque) - BAIXA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/routes.tsx` - Linhas 413, 531

**Rotas afetadas:**
- `GET /make-server-d8a4dffd/products/:id/stock-history` - Histórico de estoque

**Ação:** Criar tabela `stock_history` e atualizar rotas

---

#### 9️⃣ **Backups** - BAIXA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/index.tsx` - Linhas 379, 386, 364, 941
- `/supabase/functions/server/routes.tsx` - Linhas 941, 979, 990, 1001, 1028, 1035, 1042

**Rotas afetadas:**
- `POST /make-server-d8a4dffd/backup/create` - Criar backup
- `POST /make-server-d8a4dffd/backup/restore` - Restaurar backup

**Ação:** Usar Supabase Storage para backups ou desabilitar temporariamente

---

#### 🔟 **Analytics** (Analíticas) - BAIXA PRIORIDADE
**Arquivos afetados:**
- `/supabase/functions/server/index.tsx` - Linha 260

**Rotas afetadas:**
- `POST /make-server-d8a4dffd/analytics/track` - Track de eventos

**Ação:** Criar tabela `analytics_events` ou usar serviço externo

---

## 📋 SQL: CRIAR TODAS AS TABELAS NECESSÁRIAS

Execute este script no **Supabase Dashboard → SQL Editor**:

```sql
-- ============================================
-- TABELAS NECESSÁRIAS PARA MIGRAÇÃO COMPLETA
-- ============================================

-- 1️⃣ PRODUCTS (se ainda não existir)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_aoa NUMERIC NOT NULL,
  preco_usd NUMERIC,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  marca TEXT,
  modelo TEXT,
  estoque INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 5,
  imagem_url TEXT,
  imagens JSONB,
  especificacoes JSONB,
  tags TEXT[],
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  peso_kg NUMERIC,
  dimensoes JSONB,
  sku TEXT,
  codigo_barras TEXT,
  fornecedor TEXT,
  custo_aoa NUMERIC,
  margem_lucro NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_marca ON products(marca);
CREATE INDEX IF NOT EXISTS idx_products_ativo ON products(ativo);
CREATE INDEX IF NOT EXISTS idx_products_destaque ON products(destaque);

-- 2️⃣ REVIEWS (Avaliações)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_email ON reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- 3️⃣ COUPONS (Cupons)
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  minimum_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);

-- 4️⃣ PRICE ALERTS (Alertas de Preço)
CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_email ON price_alerts(user_email);
CREATE INDEX IF NOT EXISTS idx_price_alerts_notified ON price_alerts(notified);

-- 5️⃣ LOYALTY (Programa de Fidelidade)
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_email TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_email ON loyalty_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON loyalty_accounts(tier);

-- 6️⃣ LOYALTY HISTORY (Histórico de Pontos)
CREATE TABLE IF NOT EXISTS loyalty_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_email TEXT NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'adjustment')),
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_history_email ON loyalty_history(user_email);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_created_at ON loyalty_history(created_at);

-- 7️⃣ FLASH SALES (Vendas Relâmpago)
CREATE TABLE IF NOT EXISTS flash_sales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  sale_price NUMERIC NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_sales_product_id ON flash_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_flash_sales_active ON flash_sales(active);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON flash_sales(start_date, end_date);

-- 8️⃣ STOCK HISTORY (Histórico de Estoque)
CREATE TABLE IF NOT EXISTS stock_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  old_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason TEXT,
  order_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created_at ON stock_history(created_at);

-- 9️⃣ ANALYTICS EVENTS (Eventos de Analítica)
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_email TEXT,
  user_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ✅ MIGRAÇÃO CONCLUÍDA
-- Todas as tabelas foram criadas com sucesso!
```

---

## 🎯 PLANO DE MIGRAÇÃO EM ETAPAS

### ETAPA 1: ALTA PRIORIDADE (CRÍTICO) ⚡
1. ✅ **Orders** - JÁ MIGRADO
2. 🔄 **Products** - Migrar rotas do servidor
3. 🔄 **Customers** - Usar Supabase Auth + profiles

### ETAPA 2: MÉDIA PRIORIDADE (IMPORTANTE) 🔶
4. **Reviews** - Migrar sistema de avaliações
5. **Coupons** - Migrar sistema de cupons
6. **Price Alerts** - Migrar alertas de preço

### ETAPA 3: BAIXA PRIORIDADE (BÔNUS) 🔵
7. **Loyalty** - Programa de fidelidade
8. **Flash Sales** - Vendas relâmpago
9. **Stock History** - Histórico de estoque
10. **Analytics** - Eventos de rastreamento

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

1. **Executar o SQL** acima no Supabase para criar todas as tabelas
2. **Migrar Products** (rotas do servidor)
3. **Migrar Customers** (usar Supabase Auth)
4. **Testar cada funcionalidade** após migração

---

**Status Atual:** 🟡 20% Completo (Orders e Products Service criados)  
**Meta:** 🟢 100% Completo (Zero dependências do KV Store)  
**Prazo Estimado:** 2-3 horas de trabalho

