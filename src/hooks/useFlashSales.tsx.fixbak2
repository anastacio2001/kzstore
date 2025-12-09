/**
 * Hook para gerenciar vendas flash usando API Local
 */

import { useState, useCallback } from 'react';

const API_BASE = '/api';

export type FlashSale = {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  stock: number;
  soldCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashSales = useCallback(async (): Promise<FlashSale[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('⚡ [useFlashSales] Fetching flash sales from API...');
      
      const response = await fetch(`${API_BASE}/flash-sales`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const salesData = data.flashSales || [];
      
      console.log('⚡ [useFlashSales] Raw data from API:', salesData);
      console.log('⚡ [useFlashSales] Data count:', salesData.length);
      
      // Normalizar dados do banco (snake_case → camelCase)
      const salesArray: FlashSale[] = salesData.map((s: any) => ({
        id: s.id,
        productId: s.product_id,
        productName: s.product?.nome || s.product_name || 'Produto',
        originalPrice: Number(s.original_price || 0),
        salePrice: Number(s.sale_price || 0),
        discountPercent: Number(s.discount_percentage || 0),
        stock: s.stock_limit || 0,
        soldCount: s.stock_sold || 0,
        startDate: s.start_date,
        endDate: s.end_date,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));
      
      console.log(`⚡ [useFlashSales] Loaded ${salesArray.length} flash sales`);
      if (salesArray.length > 0) {
        console.log('⚡ [useFlashSales] Sample sale:', salesArray[0]);
      }
      
      setFlashSales(salesArray);
      return salesArray;
    } catch (err) {
      console.error('[useFlashSales] Error fetching flash sales:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createFlashSale = useCallback(async (saleData: Omit<FlashSale, 'id' | 'createdAt' | 'soldCount'>): Promise<FlashSale | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('⚡ [useFlashSales] Creating flash sale:', saleData);
      
      const url = `${API_BASE}/flash-sales`;
      console.log('⚡ [useFlashSales] POST URL:', url);
      
      const body = {
        product_id: saleData.productId,
        title: `Flash Sale - ${saleData.productName}`,
        product_name: saleData.productName,
        original_price: saleData.originalPrice,
        sale_price: saleData.salePrice,
        discount_percentage: saleData.discountPercent,
        stock_limit: saleData.stock,
        start_date: saleData.startDate,
        end_date: saleData.endDate,
        is_active: saleData.isActive,
      };
      
      console.log('⚡ [useFlashSales] Request body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log('⚡ [useFlashSales] Response status:', response.status);
      console.log('⚡ [useFlashSales] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const text = await response.text();
        console.error('⚡ [useFlashSales] Error response:', text);
        throw new Error(`API error: ${response.status} - ${text}`);
      }
      
      const data = await response.json();
      
      const newSale: FlashSale = {
        id: data.id,
        productId: data.product_id,
        productName: saleData.productName,
        originalPrice: Number(data.original_price),
        salePrice: Number(data.sale_price),
        discountPercent: Number(data.discount_percentage),
        stock: data.stock_limit,
        soldCount: data.stock_sold || 0,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      await fetchFlashSales();
      console.log('✅ [useFlashSales] Flash sale created:', newSale);
      return newSale;
    } catch (err) {
      console.error('[useFlashSales] Error creating flash sale:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFlashSales]);

  const updateFlashSale = useCallback(async (id: string, updates: Partial<FlashSale>): Promise<FlashSale | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('⚡ [useFlashSales] Updating flash sale:', id, updates);
      
      const response = await fetch(`${API_BASE}/flash-sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: updates.productId,
          title: updates.productName ? `Flash Sale - ${updates.productName}` : undefined,
          product_name: updates.productName,
          original_price: updates.originalPrice,
          sale_price: updates.salePrice,
          discount_percentage: updates.discountPercent,
          stock_limit: updates.stock,
          stock_sold: updates.soldCount,
          start_date: updates.startDate,
          end_date: updates.endDate,
          is_active: updates.isActive,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const updated: FlashSale = {
        id: data.id,
        productId: data.product_id,
        productName: updates.productName || 'Produto',
        originalPrice: Number(data.original_price),
        salePrice: Number(data.sale_price),
        discountPercent: Number(data.discount_percentage),
        stock: data.stock_limit,
        soldCount: data.stock_sold || 0,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      await fetchFlashSales();
      console.log('✅ [useFlashSales] Flash sale updated:', updated);
      return updated;
    } catch (err) {
      console.error('[useFlashSales] Error updating flash sale:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFlashSales]);

  const deleteFlashSale = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('⚡ [useFlashSales] Deleting flash sale:', id);
      
      const response = await fetch(`${API_BASE}/flash-sales/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      await fetchFlashSales();
      console.log('✅ [useFlashSales] Flash sale deleted');
      return true;
    } catch (err) {
      console.error('[useFlashSales] Error deleting flash sale:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFlashSales]);

  const getActiveFlashSales = useCallback(async (): Promise<FlashSale[]> => {
    try {
      const allSales = await fetchFlashSales();
      const now = new Date();
      return allSales.filter(sale => {
        const startDate = new Date(sale.startDate);
        const endDate = new Date(sale.endDate);
        return sale.isActive && now >= startDate && now <= endDate && sale.stock > sale.soldCount;
      });
    } catch (err) {
      console.error('[useFlashSales] Error getting active sales:', err);
      return [];
    }
  }, [fetchFlashSales]);

  const recordSale = useCallback(async (id: string, quantity: number = 1): Promise<boolean> => {
    try {
      console.log('⚡ [useFlashSales] Recording sale:', id, 'qty:', quantity);
      
      // Buscar flash sale atual
      const allSales = await fetchFlashSales();
      const sale = allSales.find(s => s.id === id);
      
      if (!sale) {
        console.error('Flash sale not found:', id);
        return false;
      }

      // Atualizar soldCount
      const updated = await updateFlashSale(id, {
        soldCount: sale.soldCount + quantity
      });
      
      console.log('✅ [useFlashSales] Sale recorded, new soldCount:', updated?.soldCount);
      return !!updated;
    } catch (err) {
      console.error('[useFlashSales] Error recording sale:', err);
      return false;
    }
  }, []);

  return {
    flashSales,
    loading,
    error,
    fetchFlashSales,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getActiveFlashSales,
    recordSale
  };
}