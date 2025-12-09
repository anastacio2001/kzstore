import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Clock, Eye, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useReviews, Review } from '../../hooks/useReviews';
import { Button } from '../ui/button';

export function ReviewManagement() {
  const { reviews, loading, fetchReviews, updateReviewStatus, deleteReview } = useReviews();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    await fetchReviews();
  };

  const handleApprove = async (id: string) => {
    const success = await updateReviewStatus(id, 'approved');
    if (success) {
      toast.success('Avaliação aprovada!');
    } else {
      toast.error('Erro ao aprovar avaliação');
    }
  };

  const handleReject = async (id: string) => {
    const success = await updateReviewStatus(id, 'rejected');
    if (success) {
      toast.success('Avaliação rejeitada!');
    } else {
      toast.error('Erro ao rejeitar avaliação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta avaliação?')) return;
    
    const success = await deleteReview(id);
    if (success) {
      toast.success('Avaliação eliminada!');
    } else {
      toast.error('Erro ao eliminar avaliação');
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
    return review.status === filter;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
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
              className="bg-white rounded-lg shadow p-6 border-l-4 border-l-gray-300 hover:shadow-md transition-shadow"
              style={{
                borderLeftColor:
                  review.status === 'pending' ? '#FDD835' :
                  review.status === 'approved' ? '#10B981' :
                  '#EF4444'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                    {renderStars(review.rating)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span>{review.userName}</span>
                    <span>•</span>
                    <span>{review.userEmail}</span>
                    <span>•</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('pt-AO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        review.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : review.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.status === 'pending' && <Clock className="size-3" />}
                      {review.status === 'approved' && <CheckCircle className="size-3" />}
                      {review.status === 'rejected' && <XCircle className="size-3" />}
                      {review.status === 'pending' ? 'Pendente' : 
                       review.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {review.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(review.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 size-4" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleReject(review.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="mr-1 size-4" />
                        Rejeitar
                      </Button>
                    </>
                  )}

                  {review.status === 'approved' && (
                    <Button
                      onClick={() => handleReject(review.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-1 size-4" />
                      Rejeitar
                    </Button>
                  )}

                  {review.status === 'rejected' && (
                    <Button
                      onClick={() => handleApprove(review.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 size-4" />
                      Aprovar
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDelete(review.id)}
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