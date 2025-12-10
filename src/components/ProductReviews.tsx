import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Shield, User, MessageSquare, Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { uploadImage } from '../utils/supabase/storage';
// supabase keys removed; backend endpoints used instead

type Review = {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  user_name: string;
  user_email: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

type ProductReviewsProps = {
  productId: string;
  userEmail?: string;
  userName?: string;
  accessToken?: string;
};

export function ProductReviews({ productId, userEmail, userName, accessToken }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewVideos, setReviewVideos] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?product_id=${productId}&status=approved`);

      if (response.ok) {
        const data = await response.json();
        // Only show approved reviews
        const approvedReviews = data.reviews || [];
        setReviews(approvedReviews);
        
        // Calculate average rating
        if (approvedReviews.length > 0) {
          const avg = approvedReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / approvedReviews.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }
        
        setTotalReviews(approvedReviews.length);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    console.log('🔍 [REVIEWS] Iniciando envio de avaliação...');
    console.log('🔍 [REVIEWS] Dados:', { 
      accessToken: !!accessToken, 
      userEmail, 
      userName, 
      rating, 
      productId 
    });

    if (!userEmail || !userName) {
      console.error('❌ [REVIEWS] Dados de autenticação ausentes');
      toast.error('Por favor, faça login para avaliar este produto');
      return;
    }

    if (rating === 0) {
      console.error('❌ [REVIEWS] Avaliação não selecionada');
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📤 [REVIEWS] Enviando requisição...');
      
      const requestBody = {
        product_id: productId,
        rating,
        comment,
        user_name: userName,
        user_email: userEmail,
        images: reviewImages,
        videos: reviewVideos
      };

      console.log('📤 [REVIEWS] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`/api/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          credentials: 'include'
        }
      );

      console.log('📥 [REVIEWS] Status da resposta:', response.status);

      const data = await response.json();
      console.log('📥 [REVIEWS] Dados da resposta:', data);

      if (response.ok) {
        console.log('✅ [REVIEWS] Avaliação enviada com sucesso!');
        toast.success('Avaliação enviada com sucesso! Será publicada após moderação.');
        setRating(0);
        setComment('');
        setReviewImages([]);
        setReviewVideos([]);
        setShowForm(false);
        // Reload reviews
        loadReviews();
      } else {
        console.error('❌ [REVIEWS] Erro do servidor:', data);
        toast.error(data.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('❌ [REVIEWS] Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
      console.log('🏁 [REVIEWS] Processo finalizado');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limitar a 5 imagens
    if (reviewImages.length + files.length > 5) {
      toast.error('Máximo de 5 imagens permitidas');
      return;
    }

    setUploadingMedia(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          console.error('Arquivo não é uma imagem:', file.name);
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máx. 5MB)`);
          continue;
        }

        // Upload para Supabase
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      setReviewImages(prev => [...prev, ...uploadedUrls]);
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} imagem(ns) adicionada(s)`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploadingMedia(false);
      // Limpar input
      e.target.value = '';
    }
  };

  const handleVideoUrlAdd = () => {
    const url = prompt('Cole o link do vídeo do YouTube:');
    if (!url) return;

    // Validar URL do YouTube
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast.error('Por favor, use um link do YouTube');
      return;
    }

    if (reviewVideos.length >= 2) {
      toast.error('Máximo de 2 vídeos permitidos');
      return;
    }

    setReviewVideos(prev => [...prev, url]);
    toast.success('Vídeo adicionado');
  };

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setReviewVideos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStars = (count: number, interactive = false, onHover?: (index: number) => void, onClick?: (index: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`size-5 ${
              interactive ? 'cursor-pointer transition-colors' : ''
            } ${
              index <= (interactive ? (hoverRating || count) : count)
                ? 'fill-[#FDD835] text-[#FDD835]'
                : 'text-gray-300'
            }`}
            onMouseEnter={() => interactive && onHover?.(index)}
            onMouseLeave={() => interactive && onHover?.(0)}
            onClick={() => interactive && onClick?.(index)}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-2">
          <MessageSquare className="size-6 text-[#E31E24]" />
          Avaliações dos Clientes
        </h2>
        {userEmail && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            className={showForm ? '' : 'bg-[#E31E24] hover:bg-[#C41E1E]'}
          >
            {showForm ? 'Cancelar' : 'Escrever Avaliação'}
          </Button>
        )}
      </div>

      {/* Overall Rating */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </div>
          {renderStars(Math.round(averageRating))}
          <p className="text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-12">{stars} estrela{stars > 1 ? 's' : ''}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FDD835] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-[#E31E24]">
          <h3 className="mb-4">Deixe a sua avaliação</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação *
              </label>
              {renderStars(
                rating,
                true,
                setHoverRating,
                setRating
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos sobre a sua experiência com este produto..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Upload de Imagens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos do Produto (opcional)
              </label>
              
              <div className="space-y-3">
                {/* Upload Button */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#E31E24] transition-colors">
                  <input
                    type="file"
                    id="review-images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingMedia || reviewImages.length >= 5}
                  />
                  <label
                    htmlFor="review-images"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="size-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {uploadingMedia ? 'Enviando...' : 'Adicionar Fotos'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 5 imagens (JPG, PNG - até 5MB cada)
                    </p>
                  </label>
                </div>

                {/* Preview das Imagens */}
                {reviewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {reviewImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vídeos do YouTube */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vídeos (opcional)
              </label>
              
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVideoUrlAdd}
                  disabled={reviewVideos.length >= 2}
                  className="w-full"
                >
                  <Video className="size-4 mr-2" />
                  Adicionar Link do YouTube (máx. 2)
                </Button>

                {/* Lista de Vídeos */}
                {reviewVideos.length > 0 && (
                  <div className="space-y-2">
                    {reviewVideos.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <Video className="size-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                disabled={submitting || rating === 0 || uploadingMedia}
                className="bg-[#E31E24] hover:bg-[#C41E1E]"
              >
                {submitting ? 'Enviando...' : 'Publicar Avaliação'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment('');
                  setReviewImages([]);
                  setReviewVideos([]);
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              * Sua avaliação será analisada pela nossa equipe antes de ser publicada.
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Ainda não há avaliações para este produto.
          </p>
          {accessToken && (
            <p className="text-gray-400 text-sm mt-2">
              Seja o primeiro a avaliar!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="size-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{review.user_name}</p>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          <Shield className="size-3" />
                          Compra Verificada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('pt-AO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}