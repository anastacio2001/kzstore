/**
 * Reviews Service - Gerenciamento de Avaliações usando API Local
 * @author KZSTORE
 */

const API_BASE = '/api';

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase?: boolean;
  helpful_count?: number;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Buscar todas as avaliações
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    
    const response = await fetch(`${API_BASE}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error('❌ [REVIEWS] Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Buscar avaliações de um produto
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    
    const response = await fetch(`${API_BASE}/reviews?product_id=${productId}&status=approved`);
    if (!response.ok) throw new Error('Failed to fetch product reviews');
    
    const data = await response.json();
    return data.reviews || [];
  } catch (error) {
    console.error(`❌ [REVIEWS] Error fetching product reviews:`, error);
    throw error;
  }
}

/**
 * Buscar avaliação por ID
 */
export async function getReviewById(id: string): Promise<Review | null> {
  try {
    const response = await fetch(`${API_BASE}/reviews/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch review');
    }
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error(`❌ [REVIEWS] Error fetching review ${id}:`, error);
    return null;
  }
}

/**
 * Criar avaliação
 */
export async function createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
  try {
    
    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reviewData,
        status: 'approved',
        helpful_count: 0,
      }),
    });

    if (!response.ok) throw new Error('Failed to create review');
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error('❌ [REVIEWS] Error creating review:', error);
    throw error;
  }
}

/**
 * Atualizar avaliação
 */
export async function updateReview(id: string, updates: Partial<Review>): Promise<Review> {
  try {

    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update review');
    
    const data = await response.json();
    return data.review;
  } catch (error) {
    console.error(`❌ [REVIEWS] Error updating review ${id}:`, error);
    throw error;
  }
}

/**
 * Deletar avaliação
 */
export async function deleteReview(id: string): Promise<void> {
  try {
    
    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete review');
    
  } catch (error) {
    console.error(`❌ [REVIEWS] Error deleting review ${id}:`, error);
    throw error;
  }
}

/**
 * Marcar avaliação como útil
 */
export async function markReviewHelpful(id: string): Promise<Review> {
  try {
    const review = await getReviewById(id);
    if (!review) throw new Error('Review not found');

    return await updateReview(id, {
      helpful_count: (review.helpful_count || 0) + 1
    });
  } catch (error) {
    console.error('❌ [REVIEWS] Error marking review as helpful:', error);
    throw error;
  }
}

/**
 * Calcular estatísticas de avaliações de um produto
 */
export async function getProductReviewStats(productId: string) {
  try {
    const reviews = await getProductReviews(productId);
    
    const stats = {
      total: reviews.length,
      average: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      rating_distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }
    };
    
    return stats;
  } catch (error) {
    console.error('❌ [REVIEWS] Error calculating stats:', error);
    throw error;
  }
}

/**
 * Verificar se usuário já avaliou produto
 */
export async function hasUserReviewedProduct(productId: string, userEmail: string): Promise<boolean> {
  try {
    // Use `mine=true` to check if the current authenticated user reviewed this product
    const response = await fetch(`${API_BASE}/reviews?product_id=${productId}&mine=true`, { credentials: 'include' });
    if (!response.ok) return false;
    
    const data = await response.json();
    return (data.reviews?.length || 0) > 0;
  } catch (error) {
    console.error('❌ [REVIEWS] Error checking user review:', error);
    return false;
  }
}
