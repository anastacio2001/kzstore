/**
 * Configuração centralizada da API
 */

// URL base da API
// Use a relative path by default (''), so we rely on the Vite proxy in development and
// the same origin in production. Optionally load from VITE_API_URL if provided.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Endpoints da API
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  AUTH_VALIDATE: `${API_BASE_URL}/api/auth/validate`,
  AUTH_QUICK_LOGIN: `${API_BASE_URL}/api/auth/quick-login`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCTS_BY_ID: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCTS_INITIALIZE: `${API_BASE_URL}/api/products/initialize`,

  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDERS_BY_ID: (id: string) => `${API_BASE_URL}/api/orders/${id}`,

  // Reviews
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  REVIEWS_BY_PRODUCT: (productId: string) => `${API_BASE_URL}/api/reviews?product_id=${productId}`,

  // Coupons
  COUPONS: `${API_BASE_URL}/api/coupons`,
  COUPONS_VALIDATE: (code: string) => `${API_BASE_URL}/api/coupons/code/${code}`,

  // Flash Sales
  FLASH_SALES: `${API_BASE_URL}/api/flash-sales`,

  // Customers
  CUSTOMERS: `${API_BASE_URL}/api/customers`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  SUBCATEGORIES: `${API_BASE_URL}/api/subcategories`,

  // Favorites/Wishlist
  FAVORITES: `${API_BASE_URL}/api/favorites`,

  // Tickets
  TICKETS: `${API_BASE_URL}/api/tickets`,

  // Analytics
  ANALYTICS: `${API_BASE_URL}/api/analytics`,

  // Upload
  UPLOAD: `${API_BASE_URL}/api/upload`,
};

// Helper para fazer requisições autenticadas
export async function fetchAPI(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Sempre incluir cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

console.log('🔧 API Config loaded:', API_BASE_URL);
