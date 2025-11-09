import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { Product } from '../App';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd`;

// Store the auth token globally to be used by all requests
let authToken: string | undefined;

export function setAuthToken(token: string | undefined) {
  authToken = token;
}

const getHeaders = () => ({
  'Authorization': `Bearer ${authToken || publicAnonKey}`,
  'Content-Type': 'application/json',
});

export type Order = {
  id: string;
  customer: {
    nome: string;
    telefone: string;
    email?: string;
    endereco: string;
    cidade: string;
    observacoes?: string;
  };
  items: Array<{
    product_id: string;
    product_nome: string;
    quantity: number;
    preco_aoa: number;
  }>;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
};

export type Customer = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  created_at: string;
};

export function useKZStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products - usando Supabase SDK diretamente
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
      console.log('✅ Products loaded:', data?.length || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Create product - usando Supabase SDK diretamente
  const createProduct = async (product: Omit<Product, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔵 Creating product:', product);
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Product created successfully:', data);
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('❌ Error creating product:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update product - usando Supabase SDK diretamente
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔵 Updating product:', id, updates);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Product updated successfully:', data);
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete product - usando Supabase SDK diretamente
  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔵 Deleting product:', id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Product deleted successfully');
      await fetchProducts();
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create order - usando Supabase SDK diretamente
  const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...orderData, status: 'pending' }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Order created:', data);
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders - usando Supabase SDK diretamente
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
      console.log('✅ Orders loaded:', data?.length || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Update order status - usando Supabase SDK diretamente
  const updateOrderStatus = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Order status updated:', data);
      await fetchOrders();
      return data;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize products (seed data) - usando Supabase SDK diretamente
  const initializeProducts = async (productsData: Product[]) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productsData)
        .select();
      
      if (error) throw error;
      
      console.log('✅ Products initialized:', data?.length || 0);
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Error initializing products:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers - usando Supabase SDK diretamente
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
      console.log('✅ Customers loaded:', data?.length || 0);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    orders,
    customers,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    fetchOrders,
    updateOrderStatus,
    initializeProducts,
    fetchCustomers,
  };
}