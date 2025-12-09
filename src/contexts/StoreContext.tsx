/**
 * Context Global para partilhar estado dos produtos e pedidos
 * Resolve o problema de múltiplas instâncias do useKZStore
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '../types';
import * as api from '../utils/api';
import { Order } from '../hooks/useOrders';

interface StoreContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<Product[]>;
  setProducts: (products: Product[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      const productsArray = await api.getProducts();
      setProducts(productsArray);
      return productsArray;
    } catch (err) {
      console.error('❌ [StoreContext] Error fetching products:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <StoreContext.Provider value={{ products, loading, error, fetchProducts, setProducts }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
