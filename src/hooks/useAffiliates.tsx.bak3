/**
 * Hook para gerenciar afiliados usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/kv';

export type Affiliate = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  code: string;
  commissionPercent: number;
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string;
  updatedAt?: string;
};

const AFFILIATES_PREFIX = 'affiliate:';
const AFFILIATES_LIST_KEY = 'affiliates:list';

export function useAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = useCallback(async (): Promise<Affiliate[]> => {
    setLoading(true);
    setError(null);
    try {
      const affiliatesData = await kvGetByPrefix<Affiliate>(AFFILIATES_PREFIX);
      const affiliatesArray = affiliatesData.map(item => item.value);
      setAffiliates(affiliatesArray);
      return affiliatesArray;
    } catch (err) {
      console.error('[useAffiliates] Error fetching affiliates:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAffiliate = useCallback(async (affiliateData: Omit<Affiliate, 'id' | 'createdAt' | 'totalSales' | 'totalCommission' | 'pendingCommission' | 'paidCommission'>): Promise<Affiliate | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = `affiliate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newAffiliate: Affiliate = {
        ...affiliateData,
        id,
        totalSales: 0,
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
        createdAt: new Date().toISOString()
      };

      await kvSet(`${AFFILIATES_PREFIX}${id}`, newAffiliate);

      const affiliateIds = await kvGet<string[]>(AFFILIATES_LIST_KEY) || [];
      affiliateIds.push(id);
      await kvSet(AFFILIATES_LIST_KEY, affiliateIds);

      await fetchAffiliates();
      return newAffiliate;
    } catch (err) {
      console.error('[useAffiliates] Error creating affiliate:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAffiliates]);

  const recordSale = useCallback(async (affiliateId: string, saleAmount: number): Promise<boolean> => {
    try {
      const affiliate = await kvGet<Affiliate>(`${AFFILIATES_PREFIX}${affiliateId}`);
      if (!affiliate) return false;

      const commission = (saleAmount * affiliate.commissionPercent) / 100;

      const updated: Affiliate = {
        ...affiliate,
        totalSales: affiliate.totalSales + saleAmount,
        totalCommission: affiliate.totalCommission + commission,
        pendingCommission: affiliate.pendingCommission + commission,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${AFFILIATES_PREFIX}${affiliateId}`, updated);
      return true;
    } catch (err) {
      console.error('[useAffiliates] Error recording sale:', err);
      return false;
    }
  }, []);

  const payCommission = useCallback(async (affiliateId: string, amount: number): Promise<boolean> => {
    try {
      const affiliate = await kvGet<Affiliate>(`${AFFILIATES_PREFIX}${affiliateId}`);
      if (!affiliate) return false;

      const updated: Affiliate = {
        ...affiliate,
        pendingCommission: affiliate.pendingCommission - amount,
        paidCommission: affiliate.paidCommission + amount,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${AFFILIATES_PREFIX}${affiliateId}`, updated);
      await fetchAffiliates();
      return true;
    } catch (err) {
      console.error('[useAffiliates] Error paying commission:', err);
      return false;
    }
  }, [fetchAffiliates]);

  return {
    affiliates,
    loading,
    error,
    fetchAffiliates,
    createAffiliate,
    recordSale,
    payCommission
  };
}
