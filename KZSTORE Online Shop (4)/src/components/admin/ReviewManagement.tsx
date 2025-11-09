import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Clock, Trash2, Shield, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

type Review = {
  id: string;
  product_id: string;
  product_name?: string;
  rating: number;
  comment: string;
  user_name: string;
  user_email: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

type ReviewManagementProps = {
  accessToken: string;
};

export function ReviewManagement({ accessToken }: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Reviews loaded:', data);
      setReviews(data || []);
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: approved })
        .eq('id', reviewId);

      if (error) throw error;

      console.log('✅ Review status updated:', reviewId);
      toast.success(`Avaliação ${approved ? 'aprovada' : 'rejeitada'}!`);
      loadReviews();
    } catch (error) {
      console.error('❌ Error updating review:', error);
      toast.error('Erro ao atualizar avaliação');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      console.log('✅ Review deleted:', reviewId);
      toast.success('Avaliação excluída!');
      loadReviews();
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      toast.error('Erro ao excluir avaliação');
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`size-4 ${
              index <= count
                ? 'fill-[#FDD835] text-[#FDD835]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'approved') return review.is_approved === true;
    if (filter === 'rejected') return review.is_approved === false;
    return true; // pending filter not applicable with boolean field
  });

  const stats = {
    total: reviews.length,
    pending: 0, // Not tracked with is_approved boolean
    approved: reviews.filter(r => r.is_approved === true).length,
    rejected: reviews.filter(r => r.is_approved === false).length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Aprovadas</p>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-sm text-red-700 mb-1">Rejeitadas</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Média</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-blue-900">{stats.avgRating}</p>
            <Star className="size-5 fill-[#FDD835] text-[#FDD835]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-[#E31E24] hover:bg-[#C41E1E]' : ''}
          >
            Todas ({stats.total})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            <Clock className="mr-2 size-4" />
            Pendentes ({stats.pending})
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'default' : 'outline'}
            className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <CheckCircle className="mr-2 size-4" />
            Aprovadas ({stats.approved})
          </Button>
          <Button
            onClick={() => setFilter('rejected')}
            variant={filter === 'rejected' ? 'default' : 'outline'}
            className={filter === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <XCircle className="mr-2 size-4" />
            Rejeitadas ({stats.rejected})
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Eye className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all' ? 'Nenhuma avaliação encontrada' : `Nenhuma avaliação ${filter}`}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow p-6 border-l-4 hover:shadow-md transition-shadow"
              style={{
                borderLeftColor: review.is_approved ? '#10B981' : '#EF4444'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">Produto ID: {review.product_id}</h3>
                    {renderStars(review.rating)}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span>{review.user_name}</span>
                    <span>•</span>
                    <span>{review.user_email}</span>
                    <span>•</span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString('pt-AO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {review.is_verified_purchase && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Shield className="size-3" />
                          Compra Verificada
                        </span>
                      </>
                    )}
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.is_approved ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
                      {review.is_approved ? 'Aprovada' : 'Rejeitada'}
                    </span>

                    {review.order_id && (
                      <span className="text-xs text-gray-500">
                        Pedido: #{review.order_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {review.is_approved ? (
                    <Button
                      onClick={() => updateReviewStatus(review.id, false)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-1 size-4" />
                      Rejeitar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => updateReviewStatus(review.id, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 size-4" />
                      Aprovar
                    </Button>
                  )}

                  <Button
                    onClick={() => deleteReview(review.id)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Trash2 className="mr-1 size-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
