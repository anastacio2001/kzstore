/**
 * Hook para gerenciar orçamentos usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/kv';

export type Quote = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  company?: string;
  productType: string;
  specifications: string;
  quantity: number;
  budget?: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'rejected';
  proposedPrice?: number;
  proposedDelivery?: string;
  proposalNotes?: string;
  createdAt: string;
  updatedAt?: string;
};

const QUOTES_PREFIX = 'quote:';
const QUOTES_LIST_KEY = 'quotes:list';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async (): Promise<Quote[]> => {
    setLoading(true);
    setError(null);
    try {
      const quotesData = await kvGetByPrefix<Quote>(QUOTES_PREFIX);
      const quotesArray = quotesData
        .map(item => item.value)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuotes(quotesArray);
      return quotesArray;
    } catch (err) {
      console.error('[useQuotes] Error fetching quotes:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuote = useCallback(async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>): Promise<Quote | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newQuote: Quote = {
        ...quoteData,
        id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await kvSet(`${QUOTES_PREFIX}${id}`, newQuote);

      const quoteIds = await kvGet<string[]>(QUOTES_LIST_KEY) || [];
      quoteIds.push(id);
      await kvSet(QUOTES_LIST_KEY, quoteIds);

      await fetchQuotes();
      return newQuote;
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
    proposedPrice: number,
    proposedDelivery: string,
    proposalNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const quote = await kvGet<Quote>(`${QUOTES_PREFIX}${id}`);
      if (!quote) throw new Error('Quote not found');

      const updated: Quote = {
        ...quote,
        status: 'quoted',
        proposedPrice,
        proposedDelivery,
        proposalNotes,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${QUOTES_PREFIX}${id}`, updated);

      await fetchQuotes();
      return true;
    } catch (err) {
      console.error('[useQuotes] Error responding to quote:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes]);

  const updateQuoteStatus = useCallback(async (id: string, status: Quote['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const quote = await kvGet<Quote>(`${QUOTES_PREFIX}${id}`);
      if (!quote) throw new Error('Quote not found');

      const updated: Quote = {
        ...quote,
        status,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${QUOTES_PREFIX}${id}`, updated);

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
      return allQuotes.filter(q => q.userId === userId);
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
