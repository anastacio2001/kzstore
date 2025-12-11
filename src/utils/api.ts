/**
 * 🌐 API HELPERS - KZSTORE FRONTEND
 * Helpers para chamadas da API local (Prisma/MySQL)
 * Atualizado em 28/11/2025 - Authorization Bearer Token
 */

// API Base URL - usa variável de ambiente ou fallback para /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Export API_BASE_URL for use in other components
export function getAPIBaseURL(): string {
  return API_BASE_URL;
}

// Helper para construir URL completa do endpoint
export function buildAPIURL(endpoint: string): string {
  // Remove /api/ do início se existir para evitar duplicação
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
  // Remove / do início se existir
  const path = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
  return `${API_BASE_URL}${path}`;
}

// Helper para obter token do localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.access_token || null;
    }
  } catch (e) {
    console.error('❌ [API] Error reading auth token:', e);
  }
  return null;
}

// Helper para criar headers com Authorization
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============ TYPES ============

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  preco_aoa: number;
  preco_usd?: number;
  estoque: number;
  imagem_url?: string;
  imagens?: string[];
  especificacoes?: Record<string, any>;
  marca?: string;
  modelo?: string;
  sku?: string;
  ativo?: boolean;
  destaque?: boolean;
  shipping_type?: string;
  shipping_cost_aoa?: number;
  shipping_cost_usd?: number;
  flash_sale?: FlashSale | null;
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
  discount_amount?: number;
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
}

export interface LoyaltyAccount {
  id: string;
  user_email: string;
  user_name: string;
  points: number;
  lifetime_points: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at?: string;
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

// ============ API HELPERS ============

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Sempre incluir Authorization header se token disponível
  const authHeaders = getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ainda inclui cookies por compatibilidade
    });
    
    const data = await response.json();

    if (!response.ok) {
      console.error('API request failed:', data.error || data.message);
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`❌ [fetchAPI] Error [${endpoint}]:`, error);
    throw error;
  }
}

// Helper para fazer fetch sem parsear JSON automaticamente (para casos especiais)
export async function fetchAPIRaw(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const authHeaders = getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// ============ PRODUCTS ============

export async function getProducts(filters?: {
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  search?: string;
  pre_order?: string | boolean; // Adicionar filtro de pré-venda
}) {
  const params = new URLSearchParams();
  if (filters?.categoria) params.append('categoria', filters.categoria);
  if (filters?.subcategoria) params.append('subcategoria', filters.subcategoria);
  if (filters?.marca) params.append('marca', filters.marca);
  if (filters?.search) params.append('search', filters.search);
  
  // Para o admin, buscar TODOS os produtos (incluindo pré-vendas)
  // Se pre_order não for especificado, adicionar 'all' para mostrar tudo
  if (filters?.pre_order !== undefined) {
    params.append('pre_order', String(filters.pre_order));
  } else {
    // Por padrão no admin, mostrar TODOS os produtos
    params.append('pre_order', 'all');
  }
  
  // Buscar TODOS os produtos (limite alto para obter todos)
  params.append('limit', '1000');
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchAPI(`/products${query}`);
  
  const result = (response.data || response.products || []) as Product[];
  return result;
}

export async function getProductById(id: string) {
  const data = await fetchAPI(`/products/${id}`);
  return {
    product: data.product as Product,
    reviews: data.reviews as Review[]
  };
}

export async function createProduct(product: Partial<Product>) {
  const data = await fetchAPI('/products', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(product),
  });
  return data.product as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const data = await fetchAPI(`/products/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return data.product as Product;
}

export async function deleteProduct(id: string) {
  await fetchAPI(`/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

export async function updateProductStock(id: string, stock: number, reason: string) {
  const data = await fetchAPI(`/products/${id}/stock`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify({ stock, reason }),
  });
  return data;
}

// ============ ORDERS ============

export async function getOrders(filters?: {
  user_email?: string;
  status?: string;
  payment_status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.user_email) params.append('user_email', filters.user_email);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.payment_status) params.append('payment_status', filters.payment_status);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await fetchAPI(`/orders${query}`);
  return data.orders as Order[];
}

export async function getOrderById(id: string) {
  const data = await fetchAPI(`/orders/${id}`);
  return data.order as Order;
}

export async function getOrderByNumber(orderNumber: string) {
  const data = await fetchAPI(`/orders/number/${orderNumber}`);
  return data.order as Order;
}

export async function createOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) {
  const data = await fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
  return data.order as Order;
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const data = await fetchAPI(`/orders/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return data.order as Order;
}

// ============ REVIEWS ============

export async function getReviews(filters?: {
  product_id?: string;
  approved?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.product_id) params.append('product_id', filters.product_id);
  if (filters?.approved !== undefined) params.append('approved', String(filters.approved));
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await fetchAPI(`/reviews${query}`);
  return data.reviews as Review[];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
  const data = await fetchAPI('/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
  return data.review as Review;
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const data = await fetchAPI(`/reviews/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return data.review as Review;
}

export async function approveReview(id: string) {
  const data = await fetchAPI(`/reviews/${id}/approve`, {
    method: 'PUT',
    credentials: 'include',
  });
  return data.review as Review;
}

// ============ COUPONS ============

export async function getCoupons(activeOnly = false) {
  const query = activeOnly ? '?active=true' : '';
  const data = await fetchAPI(`/coupons${query}`);
  return data.coupons as Coupon[];
}

export async function validateCoupon(code: string, orderValue: number) {
  try {
    const data = await fetchAPI('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderValue }),
    });
    return {
      valid: data.valid,
      coupon: data.coupon as Coupon,
      discount: data.discount as number
    };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}

export async function createCoupon(coupon: Partial<Coupon>) {
  const data = await fetchAPI('/coupons', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(coupon),
  });
  return data.coupon as Coupon;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>) {
  const data = await fetchAPI(`/coupons/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return data.coupon as Coupon;
}

// ============ FLASH SALES ============

export async function getFlashSales(activeOnly = false) {
  const query = activeOnly ? '?active=true' : '';
  const data = await fetchAPI(`/flash-sales${query}`);
  return data.flash_sales as FlashSale[];
}

export async function getFlashSaleById(id: string) {
  const data = await fetchAPI(`/flash-sales/${id}`);
  return data.flash_sale as FlashSale;
}

export async function createFlashSale(flashSale: Partial<FlashSale>) {
  const data = await fetchAPI('/flash-sales', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(flashSale),
  });
  return data.flash_sale as FlashSale;
}

export async function updateFlashSale(id: string, updates: Partial<FlashSale>) {
  const data = await fetchAPI(`/flash-sales/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return data.flash_sale as FlashSale;
}

// ============ PRICE ALERTS ============

export async function createPriceAlert(alert: {
  product_id: string;
  user_name: string;
  user_email: string;
  target_price: number;
}) {
  const data = await fetchAPI('/price-alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
  return data.alert;
}

// ============ LOYALTY ============

export async function getLoyaltyAccount(email: string) {
  try {
    const data = await fetchAPI(`/loyalty/${encodeURIComponent(email)}`);
    return data.account as LoyaltyAccount;
  } catch (error) {
    return null;
  }
}

export async function getLoyaltyHistory(email: string, limit = 50) {
  const data = await fetchAPI(`/loyalty/${encodeURIComponent(email)}/history?limit=${limit}`);
  return data.history as LoyaltyHistory[];
}

export async function redeemLoyaltyPoints(email: string, points: number, description: string) {
  const data = await fetchAPI('/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ email, points, description }),
  });
  return data;
}

// ============ AUTH ============

export async function signUp(userData: {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}) {
  const data = await fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data;
}

export async function setupAdmin() {
  const data = await fetchAPI('/auth/setup-admin', {
    method: 'POST',
  });
  return data;
}

// ============ CHATBOT ============

export async function sendChatMessage(message: string, sessionId?: string) {
  const data = await fetchAPI('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ 
      message, 
      sessionId: sessionId || crypto.randomUUID() 
    }),
  });
  return data.response as string;
}

// ============ ANALYTICS ============

export async function trackEvent(event: {
  event_type: string;
  event_category?: string;
  session_id: string;
  user_email?: string;
  page_url?: string;
  page_title?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  order_id?: string;
  order_value?: number;
  cart_value?: number;
  search_query?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await fetchAPI('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  } catch (error) {
    // Não fazer throw para não quebrar fluxo principal
    console.error('Analytics tracking error:', error);
  }
}

// ============ HEALTH CHECK ============

export async function checkHealth() {
  const data = await fetchAPI('/health');
  return data;
}

// ============ SESSION ID HELPER ============

let sessionId: string | null = null;

export function getSessionId() {
  if (!sessionId) {
    sessionId = localStorage.getItem('kzstore_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('kzstore_session_id', sessionId);
    }
  }
  return sessionId;
}

// ============ CART HELPERS ============

export interface CartItem extends OrderItem {
  flash_sale?: FlashSale | null;
}

export function getCart(): CartItem[] {
  const cart = localStorage.getItem('kzstore_cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem('kzstore_cart', JSON.stringify(items));
  
  // Track analytics
  const total = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  trackEvent({
    event_type: 'cart_updated',
    event_category: 'ecommerce',
    session_id: getSessionId(),
    cart_value: total,
    metadata: { items_count: items.length }
  });
}

export function addToCart(product: Product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantidade += 1;
  } else {
    cart.push({
      id: product.id,
      nome: product.nome,
      preco: product.flash_sale?.sale_price || product.preco_aoa,
      quantidade: 1,
      imagem: product.imagem_url,
      flash_sale: product.flash_sale
    });
  }
  
  saveCart(cart);
  
  // Track analytics
  trackEvent({
    event_type: 'add_to_cart',
    event_category: 'ecommerce',
    session_id: getSessionId(),
    product_id: product.id,
    product_name: product.nome,
    product_price: product.flash_sale?.sale_price || product.preco_aoa
  });
}

export function removeFromCart(productId: string) {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== productId);
  saveCart(newCart);
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantidade = quantity;
      saveCart(cart);
    }
  }
}

export function clearCart() {
  localStorage.removeItem('kzstore_cart');
}

export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantidade, 0);
}

// ============ FAVORITES HELPERS ============

export function getFavorites(): string[] {
  const favorites = localStorage.getItem('kzstore_favorites');
  return favorites ? JSON.parse(favorites) : [];
}

export function saveFavorites(productIds: string[]) {
  localStorage.setItem('kzstore_favorites', JSON.stringify(productIds));
}

export function toggleFavorite(productId: string) {
  const favorites = getFavorites();
  const index = favorites.indexOf(productId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(productId);
  }
  
  saveFavorites(favorites);
  return favorites;
}

export function isFavorite(productId: string) {
  const favorites = getFavorites();
  return favorites.includes(productId);
}

// API helpers loaded
