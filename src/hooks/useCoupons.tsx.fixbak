/**
 * Hook para gerenciar cupons usando API Local (Prisma/MySQL)
 * Migrado do Supabase
 */

import { useState, useCallback } from 'react';
import * as couponsService from '../services/couponsService';
import type { Coupon } from '../services/couponsService';

// Re-exportar tipo para compatibilidade
export type { Coupon };

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar todos os cupons
   */
  const fetchCoupons = useCallback(async (): Promise<Coupon[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎫 [useCoupons] Fetching coupons from API...');
      
      const couponsArray = await couponsService.getAllCoupons();
      
      console.log(`🎫 [useCoupons] Loaded ${couponsArray.length} coupons`);
      setCoupons(couponsArray);
      return couponsArray;
    } catch (err) {
      console.error('❌ [useCoupons] Error fetching coupons:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar cupons ativos
   */
  const fetchActiveCoupons = useCallback(async (): Promise<Coupon[]> => {
    setLoading(true);
    setError(null);
    try {
      const activeCoupons = await couponsService.getActiveCoupons();
      setCoupons(activeCoupons);
      return activeCoupons;
    } catch (err) {
      console.error('❌ [useCoupons] Error fetching active coupons:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Criar cupom
   */
  const createCoupon = useCallback(async (couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>): Promise<Coupon | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('➕ [useCoupons] Creating coupon...');
      
      const newCoupon = await couponsService.createCoupon(couponData);

      console.log('✅ [useCoupons] Coupon created:', newCoupon.code);
      await fetchCoupons();
      return newCoupon;
    } catch (err) {
      console.error('❌ [useCoupons] Error creating coupon:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  /**
   * Atualizar cupom
   */
  const updateCoupon = useCallback(async (id: string, updates: Partial<Coupon>): Promise<Coupon | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('✏️ [useCoupons] Updating coupon:', id);
      
      const updated = await couponsService.updateCoupon(id, updates);

      console.log('✅ [useCoupons] Coupon updated:', id);
      await fetchCoupons();
      return updated;
    } catch (err) {
      console.error('❌ [useCoupons] Error updating coupon:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  /**
   * Deletar cupom
   */
  const deleteCoupon = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ [useCoupons] Deleting coupon:', id);
      
      await couponsService.deleteCoupon(id);

      console.log('✅ [useCoupons] Coupon deleted:', id);
      await fetchCoupons();
      return true;
    } catch (err) {
      console.error('❌ [useCoupons] Error deleting coupon:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  /**
   * Validar cupom
   */
  const validateCoupon = useCallback(async (
    code: string, 
    orderTotal: number,
    productIds?: string[],
    categories?: string[]
  ): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> => {
    try {
      console.log('🔍 [useCoupons] Validating coupon:', code);
      
      const result = await couponsService.validateCoupon(code, orderTotal, productIds, categories);
      
      if (result.valid && result.coupon) {
        const discount = couponsService.calculateDiscount(result.coupon, orderTotal);
        return { 
          valid: true, 
          discount, 
          message: result.message,
          coupon: result.coupon 
        };
      }
      
      return { valid: false, discount: 0, message: result.message };
    } catch (err) {
      console.error('❌ [useCoupons] Error validating coupon:', err);
      return { valid: false, discount: 0, message: 'Erro ao validar cupom' };
    }
  }, []);

  /**
   * Usar cupom (incrementar contador)
   */
  const useCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      await couponsService.incrementCouponUsage(code);
      await fetchCoupons();
      return true;
    } catch (err) {
      console.error('❌ [useCoupons] Error using coupon:', err);
      return false;
    }
  }, [fetchCoupons]);

  /**
   * Ativar cupom
   */
  const activateCoupon = useCallback(async (id: string): Promise<boolean> => {
    try {
      await couponsService.activateCoupon(id);
      await fetchCoupons();
      return true;
    } catch (err) {
      console.error('❌ [useCoupons] Error activating coupon:', err);
      return false;
    }
  }, [fetchCoupons]);

  /**
   * Desativar cupom
   */
  const deactivateCoupon = useCallback(async (id: string): Promise<boolean> => {
    try {
      await couponsService.deactivateCoupon(id);
      await fetchCoupons();
      return true;
    } catch (err) {
      console.error('❌ [useCoupons] Error deactivating coupon:', err);
      return false;
    }
  }, [fetchCoupons]);

  return {
    coupons,
    loading,
    error,
    fetchCoupons,
    fetchActiveCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    useCoupon,
    activateCoupon,
    deactivateCoupon
  };
}
