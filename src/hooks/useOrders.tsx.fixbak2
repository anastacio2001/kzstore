/**
 * Hook para gerenciar pedidos usando API Local (Prisma/MySQL)
 * Migrado do Supabase para API local
 */

import { useState, useCallback } from 'react';
import { getAllOrders, getUserOrders, updateOrderStatus, Order as OrderType } from '../services/ordersService';

export type Customer = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
};

// Usar o tipo Order do ordersService
export type Order = OrderType;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all orders
   */
  const fetchOrders = useCallback(async (): Promise<Order[]> => {
    setLoading(true);
    setError(null);
    try {
      
      const ordersArray = await getAllOrders();
      
      setOrders(ordersArray);
      return ordersArray;
    } catch (err) {
      console.error('❌ [useOrders] Error fetching orders:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new order - NÃO IMPLEMENTADO (use ordersService.createOrder diretamente)
   */
  const createOrder = useCallback(async (orderData: any): Promise<Order | null> => {
    return null;
  }, []);

  /**
   * Update order status
   */
  const updateStatus = useCallback(async (id: string, status: Order['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      
      await updateOrderStatus(id, status);

      await fetchOrders();
      return true;
    } catch (err) {
      console.error('❌ [useOrders] Error updating order status:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  /**
   * Get order by ID
   */
  const getOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const order = orders.find(o => o.id === id);
      return order || null;
    } catch (err) {
      console.error('❌ [useOrders] Error getting order:', err);
      return null;
    }
  }, [orders]);

  /**
   * Get orders by customer email
   */
  const getOrdersByCustomer = useCallback(async (email: string): Promise<Order[]> => {
    try {
      const allOrders = orders.length > 0 ? orders : await fetchOrders();
      return allOrders.filter(o => o.user_email?.toLowerCase() === email.toLowerCase());
    } catch (err) {
      console.error('❌ [useOrders] Error getting customer orders:', err);
      return [];
    }
  }, [orders, fetchOrders]);

  /**
   * Get orders by status
   */
  const getOrdersByStatus = useCallback(async (status: string): Promise<Order[]> => {
    try {
      const allOrders = orders.length > 0 ? orders : await fetchOrders();
      return allOrders.filter(o => o.status === status);
    } catch (err) {
      console.error('❌ [useOrders] Error getting orders by status:', err);
      return [];
    }
  }, [orders, fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus: updateStatus,
    getOrderById,
    getOrdersByCustomer,
    getOrdersByStatus
  };
}