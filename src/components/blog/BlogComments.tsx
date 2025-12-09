import { useState, useEffect } from 'react';
import { Send, ThumbsUp, Reply, AlertCircle, Trash2, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { buildAPIURL } from '../../utils/api';

type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string | null;
  author_name: string;
  author_email: string;
  author_avatar: string | null;
  content: string;
  status: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  replies?: Comment[];
  isLiked?: boolean;
};

type BlogCommentsProps = {
  postId: string;
  allowComments?: boolean;
};

export function BlogComments({ postId, allowComments = true }: BlogCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    if (allowComments) {
      loadComments();
    }
  }, [postId, allowComments]);

  const loadComments = async () => {
    try {
      const response = await fetch(buildAPIURL('/blog/${postId}/comments'));
      if (response.ok) {
        const data = await response.json();
        setComments(organizeComments(data.comments || []));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Organizar comentários em árvore (parents e replies)
  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Primeiro, criar mapa de todos comentários
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Depois, organizar em árvore
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      alert('Por favor, preencha seu nome e email');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(buildAPIURL('/blog/${postId}/comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          content: newComment,
          author_name: user ? user.name : guestName,
          author_email: user ? user.email : guestEmail,
        })
      });

      if (response.ok) {
        setNewComment('');
        setGuestName('');
        setGuestEmail('');
        
        // Mostrar mensagem de sucesso
        alert('✅ Comentário enviado! Será publicado após moderação.');
        
        // Recarregar comentários
        loadComments();
      } else {
        alert('Erro ao enviar comentário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      alert('Por favor, preencha seu nome e email');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(buildAPIURL('/blog/${postId}/comments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          content: replyContent,
          parent_id: parentId,
          author_name: user ? user.name : guestName,
          author_email: user ? user.email : guestEmail,
        })
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        alert('✅ Resposta enviada! Será publicada após moderação.');
        loadComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(buildAPIURL('/blog/comments/${commentId}/like'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        loadComments(); // Recarregar para atualizar contador
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays}d`;
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' });
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-12 mt-4' : 'mb-6'}`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author_avatar ? (
              <img 
                src={comment.author_avatar} 
                alt={comment.author_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E31E24] text-white flex items-center justify-center font-semibold">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{comment.author_name}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
              {comment.status === 'pending' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Aguardando moderação
                </span>
              )}
            </div>

            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#E31E24] transition-colors"
              >
                <ThumbsUp className={`size-4 ${comment.isLiked ? 'fill-[#E31E24] text-[#E31E24]' : ''}`} />
                <span>{comment.likes_count > 0 ? comment.likes_count : 'Curtir'}</span>
              </button>

              {depth < 2 && ( // Limitar profundidade de respostas
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#E31E24] transition-colors"
                >
                  <Reply className="size-4" />
                  <span>Responder</span>
                </button>
              )}

              {comment.replies_count > 0 && (
                <span className="text-sm text-gray-500">
                  {comment.replies_count} {comment.replies_count === 1 ? 'resposta' : 'respostas'}
                </span>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Responder a ${comment.author_name}...`}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                  rows={3}
                />
                {!user && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="p-2 border border-gray-200 rounded text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Seu email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="p-2 border border-gray-200 rounded text-sm"
                    />
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting}
                    size="sm"
                    className="bg-[#E31E24] hover:bg-[#C01920]"
                  >
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (!allowComments) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <AlertCircle className="size-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Comentários desativados para este artigo.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comentários {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* New Comment Form */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSubmitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Deixe seu comentário..."
            className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
            rows={4}
            required
          />

          {!user && (
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input
                type="text"
                placeholder="Seu nome *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Seu email *"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              {user ? (
                `Comentando como ${user.name}`
              ) : (
                'Seu comentário será publicado após moderação.'
              )}
            </p>
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-[#E31E24] hover:bg-[#C01920]"
            >
              <Send className="size-4 mr-2" />
              {submitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31E24] mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando comentários...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Seja o primeiro a comentar! 💬</p>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
