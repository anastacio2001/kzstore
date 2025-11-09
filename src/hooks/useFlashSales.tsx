import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  stock_limit: number;
  stock_sold: number;
  is_active: boolean;
  created_at: string;
}

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlashSales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar Supabase SDK diretamente em vez de Edge Function
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFlashSales(data || []);
      console.log('✅ Flash Sales carregadas:', data?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar flash sales:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setFlashSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashSales();

    // Recarregar a cada 60 segundos para verificar novos flash sales
    const interval = setInterval(loadFlashSales, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    flashSales,
    loading,
    error,
    reload: loadFlashSales
  };
}
