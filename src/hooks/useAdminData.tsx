import { useProducts } from './useProducts';
import { useOrders } from './useOrders';
import { Product } from '../types';
import { Order, Customer } from './useOrders';
import { useState, useCallback } from 'react';
// Supabase removed. Use backend endpoints instead.

export type { Order };

/**
 * Hook legado para compatibilidade
 * Usa os novos hooks internamente
 */
export function useAdminData() {
  const productsHook = useProducts();
  const ordersHook = useOrders();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes do backend
  const fetchCustomers = useCallback(async () => {
    console.log('📋 [useAdminData] fetchCustomers called');
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/customers', {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [useAdminData] Customers fetched:', data.customers?.length || 0);
      setCustomers(data.customers || []);
      setError(null);
    } catch (err) {
      console.error('❌ [useAdminData] Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products: productsHook.products,
    orders: ordersHook.orders,
    customers,
    loading: productsHook.loading || ordersHook.loading || loading,
    error: productsHook.error || ordersHook.error || error,
    fetchProducts: productsHook.fetchProducts,
    createProduct: productsHook.createProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,
    fetchOrders: ordersHook.fetchOrders,
    createOrder: ordersHook.createOrder,
    updateOrderStatus: ordersHook.updateOrderStatus,
    fetchCustomers, // Agora exporta a função
  };
}

// Manter funções de auth token para compatibilidade
let authToken: string | undefined;

export function setAuthToken(token: string | undefined) {
  authToken = token;
}

export function getAuthToken() {
  // Se não tem token na variável global, tentar pegar do localStorage
  if (!authToken) {
    try {
      const savedUser = localStorage.getItem('kzstore_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.access_token) {
          authToken = parsed.access_token;
        }
      }
    } catch (e) {
      // Ignorar erro
    }
  }
  return authToken;
}