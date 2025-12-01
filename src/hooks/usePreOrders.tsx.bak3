/**
 * Hook para gerenciar pré-vendas usando API REST
 */

import { useState, useCallback } from 'react';

const API_BASE = '/api';

export type PreOrder = {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  estimatedDelivery: string;
  status: 'pending' | 'confirmed' | 'arrived' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  paymentProof?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export function usePreOrders() {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreOrders = useCallback(async (userEmail?: string): Promise<PreOrder[]> => {
    setLoading(true);
    setError(null);
    try {
      const url = userEmail 
        ? `${API_BASE}/pre-orders?user_email=${encodeURIComponent(userEmail)}`
        : `${API_BASE}/pre-orders`;
      
      console.log('[usePreOrders] Fetching from:', url);
      const response = await fetch(url);
      console.log('[usePreOrders] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log('[usePreOrders] Raw data:', data);
      
      // Converter campos para camelCase
      const orders: PreOrder[] = data.map((order: any) => ({
        id: order.id,
        userId: order.user_id,
        userEmail: order.user_email,
        userName: order.user_name,
        productId: order.product_id,
        productName: order.product_name,
        quantity: order.quantity,
        price: Number(order.price),
        total: Number(order.total),
        estimatedDelivery: order.estimated_delivery,
        status: order.status,
        paymentStatus: order.payment_status,
        paidAmount: Number(order.paid_amount),
        paymentProof: order.payment_proof,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }));
      
      console.log('[usePreOrders] Converted orders:', orders);
      setPreOrders(orders);
      return orders;
    } catch (err) {
      console.error('[usePreOrders] Error fetching pre-orders:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPreOrder = useCallback(async (orderData: Omit<PreOrder, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'paidAmount'>): Promise<PreOrder | null> => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        user_id: orderData.userId,
        user_email: orderData.userEmail,
        user_name: orderData.userName,
        product_id: orderData.productId,
        product_name: orderData.productName,
        quantity: orderData.quantity,
        price: orderData.price,
        total: orderData.total,
        estimated_delivery: orderData.estimatedDelivery,
        payment_proof: orderData.paymentProof,
        notes: orderData.notes,
      };

      const response = await fetch(`${API_BASE}/pre-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      const newOrder: PreOrder = {
        id: data.id,
        userId: data.user_id,
        userEmail: data.user_email,
        userName: data.user_name,
        productId: data.product_id,
        productName: data.product_name,
        quantity: data.quantity,
        price: Number(data.price),
        total: Number(data.total),
        estimatedDelivery: data.estimated_delivery,
        status: data.status,
        paymentStatus: data.payment_status,
        paidAmount: Number(data.paid_amount),
        paymentProof: data.payment_proof,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      await fetchPreOrders();
      return newOrder;
    } catch (err) {
      console.error('[usePreOrders] Error creating pre-order:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPreOrders]);

  const updatePreOrderStatus = useCallback(async (id: string, status: PreOrder['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/pre-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      await fetchPreOrders();
      return true;
    } catch (err) {
      console.error('[usePreOrders] Error updating status:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPreOrders]);

  const updatePayment = useCallback(async (id: string, paidAmount: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/pre-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_amount: paidAmount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      await fetchPreOrders();
      return true;
    } catch (err) {
      console.error('[usePreOrders] Error updating payment:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPreOrders]);

  const deletePreOrder = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/pre-orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      await fetchPreOrders();
      return true;
    } catch (err) {
      console.error('[usePreOrders] Error deleting pre-order:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPreOrders]);

  const getPreOrdersByUser = useCallback(async (userEmail: string): Promise<PreOrder[]> => {
    try {
      return await fetchPreOrders(userEmail);
    } catch (err) {
      console.error('[usePreOrders] Error getting user pre-orders:', err);
      return [];
    }
  }, [fetchPreOrders]);

  return {
    preOrders,
    loading,
    error,
    fetchPreOrders,
    createPreOrder,
    updatePreOrderStatus,
    updatePayment,
    deletePreOrder,
    getPreOrdersByUser
  };
}
