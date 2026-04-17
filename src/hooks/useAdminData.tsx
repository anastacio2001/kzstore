import { useProducts } from './useProducts';
import { useOrders } from './useOrders';
import { Product } from '../types';
import { Order, Customer } from './useOrders';
import { useState, useCallback } from 'react';
import { getAPIBaseURL } from '../utils/api';
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
      const response = await fetch(`${getAPIBaseURL()}/customers`, {
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
      // Tentar chave 'token' direta (usada pelo AuthProvider para admin/equipa)
      const directToken = localStorage.getItem('token');
      if (directToken) {
        authToken = directToken;
        return authToken;
      }
      // Tentar chave 'user' (AuthProvider - nova chave)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.access_token) {
          authToken = parsed.access_token;
          return authToken;
        }
      }
      // Fallback: chave 'kzstore_user' (antiga)
      const oldSavedUser = localStorage.getItem('kzstore_user');
      if (oldSavedUser) {
        const parsed = JSON.parse(oldSavedUser);
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