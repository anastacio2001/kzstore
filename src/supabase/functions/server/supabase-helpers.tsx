/**
 * 🗄️ SUPABASE HELPERS - KZSTORE
 * Helpers otimizados para interação com as tabelas do Supabase
 * Estrutura limpa após migração concluída em 22/11/2025
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ============ TYPES ============

export interface Product {
  id: string;
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
  imagens?: string[];
  especificacoes?: Record<string, any>;
  marca?: string;
  modelo?: string;
  sku?: string;
  codigo_barras?: string;
  peso_kg?: number;
  dimensoes?: Record<string, any>;
  ativo?: boolean;
  destaque?: boolean;
  is_featured?: boolean;
  featured_order?: number;
  fornecedor?: string;
  condicao?: string;
  tags?: string[];
  category_id?: string;
  subcategory_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_type?: string;
  discount_details?: string;
  shipping_cost: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: Address;
  status: string;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export interface OrderItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export interface Address {
  nome: string;
  telefone: string;
  provincia: string;
  municipio: string;
  bairro: string;
  rua: string;
  casa?: string;
  referencia?: string;
}

export interface Review {
  id?: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment?: string;
  is_approved?: boolean;
  is_verified_purchase?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
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

export interface FlashSale {
  id?: string;
  product_id: string;
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

export interface PriceAlert {
  id?: string;
  product_id: string;
  user_name: string;
  user_email: string;
  target_price: number;
  notified?: boolean;
  notified_at?: string;
  created_at?: string;
}

export interface CustomerProfile {
  id: string;
  auth_user_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: Address;
  preferences?: Record<string, any>;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoyaltyAccount {
  id: string;
  user_email: string;
  user_name: string;
  points: number;
  lifetime_points: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at?: string;
  updated_at?: string;
}

export interface LoyaltyHistory {
  id: string;
  user_email: string;
  type: 'earn' | 'redeem' | 'expire';
  points: number;
  description?: string;
  order_id?: string;
  created_at?: string;
}

export interface StockHistory {
  id: string;
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

export interface AnalyticsEvent {
  id?: string;
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
  metadata?: Record<string, any>;
  created_at?: string;
}

// ============ PRODUCTS ============

export async function getAllProducts(filters?: {
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  ativo?: boolean;
  destaque?: boolean;
  search?: string;
}) {
  try {
    let query = supabase.from('products').select('*');

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }
    if (filters?.subcategoria) {
      query = query.eq('subcategoria', filters.subcategoria);
    }
    if (filters?.marca) {
      query = query.eq('marca', filters.marca);
    }
    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }
    if (filters?.destaque !== undefined) {
      query = query.eq('destaque', filters.destaque);
    }
    if (filters?.search) {
      query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error);
    throw error;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Remove o ID se vier com um (deixa o Supabase gerar UUID)
    const { id, ...productWithoutId } = product as any;
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productWithoutId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (error) {
    console.error(`❌ Error updating product ${id}:`, error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`❌ Error deleting product ${id}:`, error);
    throw error;
  }
}

export async function updateProductStock(id: string, newStock: number, reason?: string) {
  try {
    // Buscar produto atual
    const product = await getProductById(id);
    const oldStock = product.estoque;

    // Atualizar estoque
    await updateProduct(id, { estoque: newStock });

    // Registrar histórico
    await supabase.from('stock_history').insert([{
      id: crypto.randomUUID(),
      product_id: id,
      product_name: product.nome,
      old_stock: oldStock,
      new_stock: newStock,
      change_amount: newStock - oldStock,
      reason: reason || 'Manual update',
      created_at: new Date().toISOString()
    }]);

    return true;
  } catch (error) {
    console.error(`❌ Error updating product stock ${id}:`, error);
    throw error;
  }
}

// ============ ORDERS ============

export async function getAllOrders(filters?: {
  user_email?: string;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
}) {
  try {
    let query = supabase.from('orders').select('*');

    if (filters?.user_email) {
      query = query.eq('user_email', filters.user_email);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderById(id: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`❌ Error fetching order ${id}:`, error);
    throw error;
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`❌ Error fetching order by number ${orderNumber}:`, error);
    throw error;
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Atualizar estoque dos produtos
    for (const item of order.items) {
      const product = await getProductById(item.id);
      const newStock = product.estoque - item.quantidade;
      await updateProductStock(item.id, newStock, `Pedido ${order.order_number}`);
    }

    return data as Order;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`❌ Error updating order ${id}:`, error);
    throw error;
  }
}

// ============ REVIEWS ============

export async function getReviewsByProductId(productId: string, approved_only = true) {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId);

    if (approved_only) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  } catch (error) {
    console.error(`❌ Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
}

export async function getAllReviews(filters?: { is_approved?: boolean; status?: string }) {
  try {
    let query = supabase.from('reviews').select('*');

    if (filters?.is_approved !== undefined) {
      query = query.eq('is_approved', filters.is_approved);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Review[];
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    throw error;
  }
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  try {
    console.log('📝 [REVIEWS] Creating review for product:', review.product_id);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...review,
        is_approved: false,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ [REVIEWS] Supabase error:', error.message);
      throw error;
    }
    
    console.log('✅ [REVIEWS] Review created successfully:', data.id);
    return data as Review;
  } catch (error) {
    console.error('❌ [REVIEWS] Error creating review:', error);
    throw error;
  }
}

export async function updateReview(id: string, updates: Partial<Review>) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  } catch (error) {
    console.error(`❌ Error updating review ${id}:`, error);
    throw error;
  }
}

// ============ COUPONS ============

export async function getAllCoupons(active_only = false) {
  try {
    let query = supabase.from('coupons').select('*');

    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Coupon[];
  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
    throw error;
  }
}

export async function getCouponByCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    return data as Coupon;
  } catch (error) {
    console.error(`❌ Error fetching coupon ${code}:`, error);
    throw error;
  }
}

export async function validateCoupon(code: string, orderValue: number) {
  try {
    const coupon = await getCouponByCode(code);

    // Verificar se está ativo
    if (!coupon.is_active) {
      return { valid: false, error: 'Cupom inativo' };
    }

    // Verificar validade
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'Cupom ainda não válido' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'Cupom expirado' };
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.used_count && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, error: 'Limite de uso atingido' };
    }

    // Verificar valor mínimo
    if (coupon.minimum_order_value && orderValue < coupon.minimum_order_value) {
      return { 
        valid: false, 
        error: `Valor mínimo de ${coupon.minimum_order_value} AOA não atingido` 
      };
    }

    // Calcular desconto
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderValue * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return { valid: true, coupon, discount };
  } catch (error) {
    console.error(`❌ Error validating coupon ${code}:`, error);
    return { valid: false, error: 'Cupom não encontrado' };
  }
}

export async function useCoupon(code: string) {
  try {
    const coupon = await getCouponByCode(code);
    
    await supabase
      .from('coupons')
      .update({
        used_count: (coupon.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('code', code);

    return true;
  } catch (error) {
    console.error(`❌ Error using coupon ${code}:`, error);
    throw error;
  }
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        ...coupon,
        code: coupon.code.toUpperCase(),
        used_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    throw error;
  }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  } catch (error) {
    console.error(`❌ Error updating coupon ${id}:`, error);
    throw error;
  }
}

// ============ FLASH SALES ============

export async function getAllFlashSales(active_only = false) {
  try {
    let query = supabase.from('flash_sales').select('*');

    if (active_only) {
      const now = new Date().toISOString();
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);
    }

    const { data, error } = await query.order('start_date', { ascending: false });

    if (error) throw error;
    return data as FlashSale[];
  } catch (error) {
    console.error('❌ Error fetching flash sales:', error);
    throw error;
  }
}

export async function getFlashSaleById(id: string) {
  try {
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as FlashSale;
  } catch (error) {
    console.error(`❌ Error fetching flash sale ${id}:`, error);
    throw error;
  }
}

export async function getFlashSaleByProductId(productId: string) {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    return data as FlashSale;
  } catch (error) {
    console.error(`❌ Error fetching flash sale for product ${productId}:`, error);
    return null;
  }
}

export async function createFlashSale(flashSale: Omit<FlashSale, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('flash_sales')
      .insert([{
        ...flashSale,
        stock_sold: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as FlashSale;
  } catch (error) {
    console.error('❌ Error creating flash sale:', error);
    throw error;
  }
}

export async function updateFlashSale(id: string, updates: Partial<FlashSale>) {
  try {
    const { data, error } = await supabase
      .from('flash_sales')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FlashSale;
  } catch (error) {
    console.error(`❌ Error updating flash sale ${id}:`, error);
    throw error;
  }
}

export async function incrementFlashSaleSold(id: string, quantity: number) {
  try {
    const flashSale = await getFlashSaleById(id);
    const newSold = flashSale.stock_sold + quantity;

    await updateFlashSale(id, {
      stock_sold: newSold,
      is_active: newSold < flashSale.stock_limit
    });

    return true;
  } catch (error) {
    console.error(`❌ Error incrementing flash sale sold ${id}:`, error);
    throw error;
  }
}

// ============ PRICE ALERTS ============

export async function createPriceAlert(alert: Omit<PriceAlert, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert([{
        ...alert,
        notified: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as PriceAlert;
  } catch (error) {
    console.error('❌ Error creating price alert:', error);
    throw error;
  }
}

export async function getPriceAlertsByProductId(productId: string) {
  try {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('product_id', productId)
      .eq('notified', false);

    if (error) throw error;
    return data as PriceAlert[];
  } catch (error) {
    console.error(`❌ Error fetching price alerts for product ${productId}:`, error);
    throw error;
  }
}

export async function markPriceAlertNotified(id: string) {
  try {
    const { error } = await supabase
      .from('price_alerts')
      .update({
        notified: true,
        notified_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`❌ Error marking price alert notified ${id}:`, error);
    throw error;
  }
}

// ============ ANALYTICS ============

export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        ...event,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as AnalyticsEvent;
  } catch (error) {
    console.error('❌ Error tracking event:', error);
    // Não fazer throw para não quebrar fluxo principal
    return null;
  }
}

export async function getAnalyticsEvents(filters?: {
  event_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  try {
    let query = supabase.from('analytics_events').select('*');

    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as AnalyticsEvent[];
  } catch (error) {
    console.error('❌ Error fetching analytics events:', error);
    throw error;
  }
}

// ============ CUSTOMER PROFILES ============

export async function getCustomerProfile(id: string) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  } catch (error) {
    console.error(`❌ Error fetching customer profile ${id}:`, error);
    throw error;
  }
}

export async function getCustomerByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    return data as CustomerProfile;
  } catch (error) {
    console.error(`❌ Error fetching customer by email ${email}:`, error);
    return null;
  }
}

export async function createCustomerProfile(customer: Omit<CustomerProfile, 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .insert([{
        ...customer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  } catch (error) {
    console.error('❌ Error creating customer profile:', error);
    throw error;
  }
}

export async function updateCustomerProfile(id: string, updates: Partial<CustomerProfile>) {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerProfile;
  } catch (error) {
    console.error(`❌ Error updating customer profile ${id}:`, error);
    throw error;
  }
}

// ============ LOYALTY ============

export async function getLoyaltyAccount(email: string) {
  try {
    const { data, error } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    return data as LoyaltyAccount;
  } catch (error) {
    console.error(`❌ Error fetching loyalty account for ${email}:`, error);
    return null;
  }
}

export async function createLoyaltyAccount(account: Omit<LoyaltyAccount, 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('loyalty_accounts')
      .insert([{
        ...account,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data as LoyaltyAccount;
  } catch (error) {
    console.error('❌ Error creating loyalty account:', error);
    throw error;
  }
}

export async function addLoyaltyPoints(
  email: string,
  points: number,
  description: string,
  orderId?: string
) {
  try {
    let account = await getLoyaltyAccount(email);

    if (!account) {
      // Criar conta se não existir
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_name')
        .eq('user_email', email)
        .limit(1)
        .single();

      account = await createLoyaltyAccount({
        id: crypto.randomUUID(),
        user_email: email,
        user_name: orderData?.user_name || email,
        points: 0,
        lifetime_points: 0,
        tier: 'bronze'
      });
    }

    // Atualizar pontos
    const newPoints = account.points + points;
    const newLifetimePoints = account.lifetime_points + points;

    // Calcular tier
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (newLifetimePoints >= 50000) tier = 'platinum';
    else if (newLifetimePoints >= 20000) tier = 'gold';
    else if (newLifetimePoints >= 5000) tier = 'silver';

    await supabase
      .from('loyalty_accounts')
      .update({
        points: newPoints,
        lifetime_points: newLifetimePoints,
        tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    // Adicionar histórico
    await supabase.from('loyalty_history').insert([{
      id: crypto.randomUUID(),
      user_email: email,
      type: 'earn',
      points,
      description,
      order_id: orderId,
      created_at: new Date().toISOString()
    }]);

    return { success: true, newPoints, tier };
  } catch (error) {
    console.error(`❌ Error adding loyalty points for ${email}:`, error);
    throw error;
  }
}

export async function redeemLoyaltyPoints(email: string, points: number, description: string) {
  try {
    const account = await getLoyaltyAccount(email);

    if (!account) {
      throw new Error('Conta de fidelidade não encontrada');
    }

    if (account.points < points) {
      throw new Error('Pontos insuficientes');
    }

    const newPoints = account.points - points;

    await supabase
      .from('loyalty_accounts')
      .update({
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id);

    // Adicionar histórico
    await supabase.from('loyalty_history').insert([{
      id: crypto.randomUUID(),
      user_email: email,
      type: 'redeem',
      points,
      description,
      created_at: new Date().toISOString()
    }]);

    return { success: true, newPoints };
  } catch (error) {
    console.error(`❌ Error redeeming loyalty points for ${email}:`, error);
    throw error;
  }
}

export async function getLoyaltyHistory(email: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('loyalty_history')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as LoyaltyHistory[];
  } catch (error) {
    console.error(`❌ Error fetching loyalty history for ${email}:`, error);
    throw error;
  }
}

console.log('✅ Supabase helpers loaded successfully');