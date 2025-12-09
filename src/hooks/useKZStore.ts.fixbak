import { useState, useEffect } from 'react';
import type { Product, Order, Customer } from '../types';
import { getAuthHeaders } from '../utils/api';

// API Local - Prisma/MySQL (via Vite Proxy)
const API_BASE = '/api';

export function useKZStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching products from:', `${API_BASE}/products`);
      // Buscar apenas produtos normais (excluir pré-vendas)
      const response = await fetch(`${API_BASE}/products?pre_order=false`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Products fetched successfully:', data.products?.length || 0);
      
      // Filtrar produtos inválidos
      const validProducts = (data.products || []).filter((p: any) => {
        if (!p || !p.id) {
          console.warn('⚠️ Invalid product detected (no id):', p);
          return false;
        }
        if (typeof p.preco_aoa !== 'number') {
          console.warn('⚠️ Invalid product detected (preco_aoa is not a number):', p);
          return false;
        }
        return true;
      });
      
      if (validProducts.length !== (data.products || []).length) {
        console.warn(`⚠️ Filtered out ${(data.products || []).length - validProducts.length} invalid products`);
      }
      
      setProducts(validProducts);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('API URL:', `${API_BASE}/products`);
      console.error('Error details:', err instanceof Error ? err.message : String(err));
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (product: Omit<Product, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error creating product:', data);
        throw new Error(data.error || 'Failed to create product');
      }
      
      console.log('✅ Product created successfully');
      await fetchProducts();
      return data.product;
    } catch (err) {
      console.error('❌ Error creating product:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error updating product:', data);
        throw new Error(data.error || 'Failed to update product');
      }
      
      console.log('✅ Product updated successfully');
      await fetchProducts();
      return data.product;
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting product:', data);
        throw new Error(data.error || 'Failed to delete product');
      }
      
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

  // Create order
  const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      return data.order;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }
      
      await fetchOrders();
      return data.order;
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize products (seed data)
  const initializeProducts = async (productsData: Product[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/products/initialize`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ products: productsData }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize products');
      }
      
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

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers');
      }
      
      setCustomers(data.customers || []);
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