/**
 * Hook para gerenciar produtos usando a API Local (Prisma/MySQL)
 * Migrado do Supabase
 */

import { useState, useCallback } from 'react';
import { Product } from '../types';
import * as api from '../utils/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all products from API
   */
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [useProducts] Calling api.getProducts()...');
      const productsArray = await api.getProducts();
      console.log(`📦 [useProducts] Received ${productsArray?.length || 0} products from API`);
      console.log('📊 [useProducts] First product:', productsArray?.[0]?.nome || 'none');
      console.log('🔄 [useProducts] Setting products state...');
      setProducts(productsArray);
      console.log('✅ [useProducts] State updated');
      return productsArray;
    } catch (err) {
      console.error('❌ [useProducts] Error fetching products:', err);
      setError(String(err));
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize products - agora apenas busca os existentes
   */
  const initializeProducts = useCallback(async (initialProducts: Product[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      
      // Buscar produtos existentes
      const existing = await fetchProducts();
      
      if (existing && existing.length > 0) {
        return true;
      }

      // Se não há produtos, usar os dados iniciais fornecidos
      if (initialProducts && initialProducts.length > 0) {
        setProducts(initialProducts);
        return true;
      }

      setProducts([]);
      return true;
    } catch (err) {
      console.error('❌ Error initializing products:', err);
      
      // Em caso de erro, usar dados iniciais se disponíveis
      if (initialProducts && initialProducts.length > 0) {
        setProducts(initialProducts);
        return true;
      }
      
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Create a new product - sem autenticação (API local)
   */
  const createProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {

      const newProduct = await api.createProduct(product);

      await fetchProducts();
      return newProduct;
    } catch (err) {
      console.error('❌ [useProducts] Error creating product:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Update a product - sem autenticação (API local)
   */
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {

      const updated = await api.updateProduct(id, updates);

      await fetchProducts();
      return updated;
    } catch (err) {
      console.error('❌ [useProducts] Error updating product:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Delete a product - sem autenticação (API local)
   */
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {

      await api.deleteProduct(id);

      await fetchProducts();
      return true;
    } catch (err) {
      console.error('❌ [useProducts] Error deleting product:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Get product by ID
   */
  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      // Primeiro tenta encontrar no state
      const cached = products.find(p => p.id === id);
      if (cached) return cached;
      
      // Se não encontrar, busca da API
      const result = await api.getProductById(id);
      return result.product;
    } catch (err) {
      console.error('❌ [useProducts] Error getting product:', err);
      return null;
    }
  }, [products]);

  /**
   * Get low stock products
   */
  const getLowStockProducts = useCallback(async (threshold: number = 10): Promise<Product[]> => {
    try {
      const allProducts = products.length > 0 ? products : await fetchProducts();
      return allProducts.filter(p => (p.estoque || 0) < threshold && (p.estoque || 0) > 0);
    } catch (err) {
      console.error('❌ [useProducts] Error getting low stock products:', err);
      return [];
    }
  }, [products, fetchProducts]);

  /**
   * Update stock
   */
  const updateStock = useCallback(async (id: string, quantity: number, reason: string = 'Manual update'): Promise<boolean> => {
    try {
      await api.updateProductStock(id, quantity, reason);
      await fetchProducts();
      return true;
    } catch (err) {
      console.error('❌ [useProducts] Error updating stock:', err);
      return false;
    }
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    initializeProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getLowStockProducts,
    updateStock
  };
}