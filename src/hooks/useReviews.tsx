/**
 * Hook para gerenciar avaliações usando APENAS Supabase
 * Migrado completamente - SEM KV Store
 */

import { useState, useCallback } from 'react';
import * as reviewsService from '../services/reviewsService';
import type { Review } from '../services/reviewsService';

// Re-exportar tipo para compatibilidade
export type { Review };

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar todas as avaliações
   */
  const fetchReviews = useCallback(async (): Promise<Review[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('⭐ [useReviews] Fetching reviews from Supabase...');
      
      const reviewsArray = await reviewsService.getAllReviews();
      
      console.log(`⭐ [useReviews] Loaded ${reviewsArray.length} reviews`);
      setReviews(reviewsArray);
      return reviewsArray;
    } catch (err) {
      console.error('❌ [useReviews] Error fetching reviews:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Criar avaliação
   */
  const createReview = useCallback(async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('➕ [useReviews] Creating review...');
      
      const newReview = await reviewsService.createReview(reviewData);

      console.log('✅ [useReviews] Review created:', newReview.id);
      await fetchReviews();
      return newReview;
    } catch (err) {
      console.error('❌ [useReviews] Error creating review:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Atualizar status da avaliação
   */
  const updateReviewStatus = useCallback(async (id: string, status: Review['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('✏️ [useReviews] Updating review status:', id, status);
      
      await reviewsService.updateReview(id, { status });

      console.log('✅ [useReviews] Review status updated:', id);
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('❌ [useReviews] Error updating review status:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Deletar avaliação
   */
  const deleteReview = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ [useReviews] Deleting review:', id);
      
      await reviewsService.deleteReview(id);

      console.log('✅ [useReviews] Review deleted:', id);
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('❌ [useReviews] Error deleting review:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Buscar avaliações de um produto
   */
  const getReviewsByProduct = useCallback(async (productId: string): Promise<Review[]> => {
    try {
      return await reviewsService.getProductReviews(productId);
    } catch (err) {
      console.error('❌ [useReviews] Error getting product reviews:', err);
      return [];
    }
  }, []);

  /**
   * Marcar avaliação como útil
   */
  const markReviewHelpful = useCallback(async (id: string): Promise<boolean> => {
    try {
      await reviewsService.markReviewHelpful(id);
      await fetchReviews();
      return true;
    } catch (err) {
      console.error('❌ [useReviews] Error marking review as helpful:', err);
      return false;
    }
  }, [fetchReviews]);

  /**
   * Buscar estatísticas de avaliações de um produto
   */
  const getProductReviewStats = useCallback(async (productId: string) => {
    try {
      return await reviewsService.getProductReviewStats(productId);
    } catch (err) {
      console.error('❌ [useReviews] Error getting review stats:', err);
      return null;
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReviewStatus,
    deleteReview,
    getReviewsByProduct,
    markReviewHelpful,
    getProductReviewStats
  };
}
