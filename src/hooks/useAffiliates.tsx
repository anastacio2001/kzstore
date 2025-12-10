/**
 * Hook para gerenciar afiliados usando Backend PostgreSQL
 */

import { useState, useCallback } from 'react';

export type Affiliate = {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  affiliate_code: string;
  commission_rate: number;
  total_clicks: number;
  total_sales: number;
  total_commission: number;
  pending_commission: number;
  paid_commission: number;
  bank_name?: string | null;
  account_holder?: string | null;
  account_number?: string | null;
  iban?: string | null;
  status: 'active' | 'suspended' | 'inactive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  _count?: {
    clicks: number;
    commissions: number;
  };
};

export type AffiliateClick = {
  id: string;
  affiliate_id: string;
  product_id?: string | null;
  product_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  converted: boolean;
  order_id?: string | null;
  created_at: string;
  product?: {
    nome: string;
    imagem_url?: string | null;
  };
};

export type AffiliateCommission = {
  id: string;
  affiliate_id: string;
  order_id: string;
  order_total: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paid_at?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_notes?: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    user_name: string;
    created_at: string;
  };
};

const API_URL = import.meta.env.VITE_API_URL || 'https://kzstore-backend.fly.dev';

export function useAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.token || parsed.accessToken;
    }
    return null;
  };

  const fetchAffiliates = useCallback(async (): Promise<Affiliate[]> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/affiliates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar afiliados');
      }

      const data = await response.json();
      setAffiliates(data.affiliates || []);
      return data.affiliates || [];
    } catch (err) {
      console.error('[useAffiliates] Error fetching affiliates:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAffiliate = useCallback(async (affiliateData: {
    name: string;
    email: string;
    phone?: string;
    commission_rate: number;
    bank_name?: string;
    account_holder?: string;
    account_number?: string;
    iban?: string;
  }): Promise<Affiliate | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/affiliates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(affiliateData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar afiliado');
      }

      const data = await response.json();
      await fetchAffiliates();
      return data.affiliate;
    } catch (err) {
      console.error('[useAffiliates] Error creating affiliate:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAffiliates]);

  const updateAffiliate = useCallback(async (
    id: string,
    updates: Partial<Omit<Affiliate, 'id' | 'created_at' | 'updated_at' | '_count'>>
  ): Promise<Affiliate | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/affiliates/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar afiliado');
      }

      const data = await response.json();
      await fetchAffiliates();
      return data.affiliate;
    } catch (err) {
      console.error('[useAffiliates] Error updating affiliate:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAffiliates]);

  const deleteAffiliate = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/affiliates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar afiliado');
      }

      await fetchAffiliates();
      return true;
    } catch (err) {
      console.error('[useAffiliates] Error deleting affiliate:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAffiliates]);

  const payCommission = useCallback(async (
    commissionId: string,
    paymentData: {
      payment_method: string;
      payment_reference?: string;
      payment_notes?: string;
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/affiliates/commissions/${commissionId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Erro ao pagar comissão');
      }

      return true;
    } catch (err) {
      console.error('[useAffiliates] Error paying commission:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAffiliateCommissions = useCallback(async (
    affiliateId: string,
    status?: string
  ): Promise<AffiliateCommission[]> => {
    try {
      const token = getAuthToken();
      const url = status 
        ? `${API_URL}/api/affiliates/${affiliateId}/commissions?status=${status}`
        : `${API_URL}/api/affiliates/${affiliateId}/commissions`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar comissões');
      }

      const data = await response.json();
      return data.commissions || [];
    } catch (err) {
      console.error('[useAffiliates] Error fetching commissions:', err);
      return [];
    }
  }, []);

  const getAffiliateClicks = useCallback(async (
    affiliateId: string,
    converted?: boolean
  ): Promise<AffiliateClick[]> => {
    try {
      const token = getAuthToken();
      const url = converted !== undefined
        ? `${API_URL}/api/affiliates/${affiliateId}/clicks?converted=${converted}`
        : `${API_URL}/api/affiliates/${affiliateId}/clicks`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar cliques');
      }

      const data = await response.json();
      return data.clicks || [];
    } catch (err) {
      console.error('[useAffiliates] Error fetching clicks:', err);
      return [];
    }
  }, []);

  return {
    affiliates,
    loading,
    error,
    fetchAffiliates,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    payCommission,
    getAffiliateCommissions,
    getAffiliateClicks,
  };
}
