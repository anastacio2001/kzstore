/**
 * Hook principal da KZSTORE
 * Gerencia produtos e pedidos usando Supabase SDK
 */

import { useProducts } from './useProducts';
import { useOrders, Order } from './useOrders';
import { Product } from '../types';

// Manter authToken para compatibilidade
let authToken: string | undefined;

export function setAuthToken(token: string | undefined) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function useKZStore() {
  const productsHook = useProducts();
  const ordersHook = useOrders();

  return {
    // Products
    products: productsHook.products,
    fetchProducts: productsHook.fetchProducts,
    initializeProducts: productsHook.initializeProducts,
    createProduct: productsHook.createProduct,
    updateProduct: productsHook.updateProduct,
    deleteProduct: productsHook.deleteProduct,
    getProductById: productsHook.getProductById,
    getLowStockProducts: productsHook.getLowStockProducts,
    updateStock: productsHook.updateStock,
    
    // Orders
    orders: ordersHook.orders,
    fetchOrders: ordersHook.fetchOrders,
    createOrder: ordersHook.createOrder,
    updateOrderStatus: ordersHook.updateOrderStatus,
    getOrderById: ordersHook.getOrderById,
    getOrdersByCustomer: ordersHook.getOrdersByCustomer,
    getOrdersByStatus: ordersHook.getOrdersByStatus,
    
    // Loading states
    loading: productsHook.loading || ordersHook.loading,
    error: productsHook.error || ordersHook.error,
  };
}

export type { Product, Order };
