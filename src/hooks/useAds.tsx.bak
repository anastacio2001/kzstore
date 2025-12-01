/**
 * Hook para gerenciar anúncios usando API REST
 */

import { useState, useCallback } from 'react';
import { Advertisement } from '../types/ads';

const API_BASE = '/api';

export function useAds() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async (): Promise<Advertisement[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ads`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setAds(data);
      return data;
    } catch (err) {
      console.error('[useAds] Error fetching ads:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAd = useCallback(async (adData: any): Promise<Advertisement | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: adData.title || adData.titulo,
          descricao: adData.description || adData.descricao || '',
          imagem_url: adData.imageUrl || adData.imagem_url,
          link_url: adData.linkUrl || adData.link_url || '',
          posicao: adData.position || adData.posicao,
          tipo: 'banner',
          ativo: adData.isActive !== undefined ? adData.isActive : (adData.ativo !== undefined ? adData.ativo : true),
          data_inicio: adData.startDate || adData.data_inicio || new Date().toISOString(),
          data_fim: adData.endDate || adData.data_fim || null,
          criado_por: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const newAd = await response.json();
      await fetchAds();
      return newAd;
    } catch (err) {
      console.error('[useAds] Error creating ad:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAds]);

  const updateAd = useCallback(async (id: string, updates: any): Promise<Advertisement | null> => {
    setLoading(true);
    setError(null);
    try {
      const data: any = {};
      
      // Converter campos em inglês para português se necessário
      if (updates.title !== undefined) data.titulo = updates.title;
      if (updates.description !== undefined) data.descricao = updates.description;
      if (updates.imageUrl !== undefined) data.imagem_url = updates.imageUrl;
      if (updates.linkUrl !== undefined) data.link_url = updates.linkUrl;
      if (updates.position !== undefined) data.posicao = updates.position;
      if (updates.isActive !== undefined) data.ativo = updates.isActive;
      if (updates.startDate !== undefined) data.data_inicio = updates.startDate;
      if (updates.endDate !== undefined) data.data_fim = updates.endDate;
      
      // Permitir atualizações diretas em português também
      if (updates.titulo !== undefined) data.titulo = updates.titulo;
      if (updates.descricao !== undefined) data.descricao = updates.descricao;
      if (updates.imagem_url !== undefined) data.imagem_url = updates.imagem_url;
      if (updates.link_url !== undefined) data.link_url = updates.link_url;
      if (updates.posicao !== undefined) data.posicao = updates.posicao;
      if (updates.ativo !== undefined) data.ativo = updates.ativo;
      if (updates.data_inicio !== undefined) data.data_inicio = updates.data_inicio;
      if (updates.data_fim !== undefined) data.data_fim = updates.data_fim;

      const response = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const updatedAd = await response.json();
      await fetchAds();
      return updatedAd;
    } catch (err) {
      console.error('[useAds] Error updating ad:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAds]);

  const deleteAd = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      await fetchAds();
      return true;
    } catch (err) {
      console.error('[useAds] Error deleting ad:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAds]);

  const trackImpression = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/ads/${id}/impression`, {
        method: 'POST',
      });
      return response.ok;
    } catch (err) {
      console.error('[useAds] Error tracking impression:', err);
      return false;
    }
  }, []);

  const trackClick = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/ads/${id}/click`, {
        method: 'POST',
      });
      return response.ok;
    } catch (err) {
      console.error('[useAds] Error tracking click:', err);
      return false;
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/ads/stats`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      return await response.json();
    } catch (err) {
      console.error('[useAds] Error getting stats:', err);
      return null;
    }
  }, []);

  return {
    ads,
    loading,
    error,
    fetchAds,
    createAd,
    updateAd,
    deleteAd,
    trackImpression,
    trackClick,
    getStats
  };
}