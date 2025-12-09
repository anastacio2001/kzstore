/**
 * Hook para gerenciar contas B2B usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/kv';

export type B2BAccount = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  discountPercent: number;
  creditLimit: number;
  currentCredit: number;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt?: string;
};

const B2B_PREFIX = 'b2b:';
const B2B_LIST_KEY = 'b2b:list';

export function useB2B() {
  const [accounts, setAccounts] = useState<B2BAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (): Promise<B2BAccount[]> => {
    setLoading(true);
    setError(null);
    try {
      const accountsData = await kvGetByPrefix<B2BAccount>(B2B_PREFIX);
      const accountsArray = accountsData.map(item => item.value);
      setAccounts(accountsArray);
      return accountsArray;
    } catch (err) {
      console.error('[useB2B] Error fetching accounts:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (accountData: Omit<B2BAccount, 'id' | 'createdAt' | 'status' | 'currentCredit'>): Promise<B2BAccount | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = `b2b_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newAccount: B2BAccount = {
        ...accountData,
        id,
        status: 'pending',
        currentCredit: 0,
        createdAt: new Date().toISOString()
      };

      await kvSet(`${B2B_PREFIX}${id}`, newAccount);

      const accountIds = await kvGet<string[]>(B2B_LIST_KEY) || [];
      accountIds.push(id);
      await kvSet(B2B_LIST_KEY, accountIds);

      await fetchAccounts();
      return newAccount;
    } catch (err) {
      console.error('[useB2B] Error creating account:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  const updateAccount = useCallback(async (id: string, updates: Partial<B2BAccount>): Promise<B2BAccount | null> => {
    setLoading(true);
    setError(null);
    try {
      const current = await kvGet<B2BAccount>(`${B2B_PREFIX}${id}`);
      if (!current) throw new Error('Account not found');

      const updated: B2BAccount = {
        ...current,
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${B2B_PREFIX}${id}`, updated);

      await fetchAccounts();
      return updated;
    } catch (err) {
      console.error('[useB2B] Error updating account:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount
  };
}
