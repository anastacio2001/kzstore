/**
 * KZSTORE Database Hooks
 * React hooks para operações de banco de dados usando APENAS Supabase
 * @description Hooks modernizados sem dependência de KV Store
 */

import { useState, useEffect } from 'react';

// Importar novos serviços do Supabase
import * as productsService from '../services/productsService';
import * as ordersService from '../services/ordersService';
import * as reviewsService from '../services/reviewsService';
import * as couponsService from '../services/couponsService';
import * as customersService from '../services/customersService';
import * as categoriesService from '../services/categoriesService';

// Exportar tipos dos serviços
export type { Product } from '../services/productsService';
export type { Order, OrderItem } from '../services/ordersService';
export type { Review } from '../services/reviewsService';
export type { Coupon } from '../services/couponsService';
export type { Customer } from '../services/customersService';
export type { Category } from '../services/categoriesService';

// ============================================
// USE PRODUCTS
// ============================================

export function useProducts() {
  const [products, setProducts] = useState<productsService.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<productsService.Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await productsService.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<productsService.Product>) => {
    try {
      const updated = await productsService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  };
}

// ============================================
// USE ORDERS
// ============================================

export function useOrders(customerEmail?: string) {
  const [orders, setOrders] = useState<ordersService.Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [customerEmail]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = customerEmail 
        ? await ordersService.getOrdersByCustomerEmail(customerEmail)
        : await ordersService.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<ordersService.Order, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const newOrder = await ordersService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: ordersService.Order['status']) => {
    try {
      const updated = await ordersService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      return updated;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refreshOrders: loadOrders
  };
}

// ============================================
// USE REVIEWS
// ============================================

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<reviewsService.Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.getProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (review: Omit<reviewsService.Review, 'id' | 'created_at' | 'verified'>) => {
    try {
      const newReview = await reviewsService.createReview(review);
      setReviews(prev => [newReview, ...prev]);
      return newReview;
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await reviewsService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      throw err;
    }
  };

  return {
    reviews,
    loading,
    createReview,
    deleteReview,
    refreshReviews: loadReviews
  };
}

// ============================================
// USE COUPONS
// ============================================

export function useCoupons() {
  const [coupons, setCoupons] = useState<couponsService.Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsService.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code: string) => {
    return await couponsService.validateCoupon(code);
  };

  const createCoupon = async (coupon: Omit<couponsService.Coupon, 'id' | 'used_count' | 'created_at'>) => {
    try {
      const newCoupon = await couponsService.createCoupon(coupon);
      setCoupons(prev => [...prev, newCoupon]);
      return newCoupon;
    } catch (err) {
      console.error('Error creating coupon:', err);
      throw err;
    }
  };

  return {
    coupons,
    loading,
    validateCoupon,
    createCoupon,
    refreshCoupons: loadCoupons
  };
}

// ============================================
// USE CUSTOMERS
// ============================================

export function useCustomers() {
  const [customers, setCustomers] = useState<customersService.Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customer: Omit<customersService.Customer, 'id' | 'created_at'>) => {
    try {
      const newCustomer = await customersService.createCustomer(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    refreshCustomers: loadCustomers
  };
}

// ============================================
// USE CATEGORIES
// ============================================

export function useCategories() {
  const [categories, setCategories] = useState<categoriesService.Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<categoriesService.Category, 'id' | 'created_at'>) => {
    try {
      const newCategory = await categoriesService.createCategory(category);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  return {
    categories,
    loading,
    createCategory,
    refreshCategories: loadCategories
  };
}

console.log('✅ Database Hooks initialized (Supabase only)');
