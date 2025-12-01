/**
 * Hook para gerenciar orçamentos usando API REST
 */

import { useState, useCallback } from 'react';

export type Quote = {
  id: string;
  quote_number: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  company?: string;
  requirements: string;
  budget?: number;
  status: 'pending' | 'in_progress' | 'sent' | 'accepted' | 'rejected';
  priority: string;
  admin_proposal?: string;
  proposed_items?: Array<{ name: string; quantity: number; unit_price: number; subtotal: number }>;
  total_amount?: number;
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  responded_at?: string;
  accepted_at?: string;
  rejected_at?: string;
};

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    let token = localStorage.getItem('token');
    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          token = userData.access_token || userData.token;
        } catch (e) {
          // ignore
        }
      }
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const fetchQuotes = useCallback(async (): Promise<Quote[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/quotes', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamentos');
      }
      
      const data = await response.json();
      setQuotes(data.quotes || []);
      return data.quotes || [];
    } catch (err) {
      console.error('[useQuotes] Error fetching quotes:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuote = useCallback(async (quoteData: {
    user_name: string;
    user_email: string;
    user_phone: string;
    company?: string;
    requirements: string;
    budget?: number;
  }): Promise<Quote | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar orçamento');
      }

      const data = await response.json();
      await fetchQuotes();
      return data.quote;
    } catch (err) {
      console.error('[useQuotes] Error creating quote:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes]);

  const respondToQuote = useCallback(async (
    id: string,
    responseData: {
      proposal?: string;
      proposedItems?: Array<{ name: string; quantity: number; unit_price: number }>;
      totalAmount?: number;
      adminNotes?: string;
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'sent',
          admin_proposal: responseData.proposal,
          proposed_items: responseData.proposedItems,
          total_amount: responseData.totalAmount,
          admin_notes: responseData.adminNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao responder orçamento');
      }

      await fetchQuotes();
      return true;
    } catch (err) {
      console.error('[useQuotes] Error responding to quote:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const updateQuoteStatus = useCallback(async (id: string, status: Quote['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      await fetchQuotes();
      return true;
    } catch (err) {
      console.error('[useQuotes] Error updating status:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes]);

  const getQuotesByUser = useCallback(async (userId: string): Promise<Quote[]> => {
    try {
      const allQuotes = await fetchQuotes();
      return allQuotes.filter(q => q.user_id === userId);
    } catch (err) {
      console.error('[useQuotes] Error getting user quotes:', err);
      return [];
    }
  }, [fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    createQuote,
    respondToQuote,
    updateQuoteStatus,
    getQuotesByUser
  };
}
