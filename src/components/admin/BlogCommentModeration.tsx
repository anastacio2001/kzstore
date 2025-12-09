import { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Trash2, Eye, ThumbsUp, Reply, AlertTriangle, User, Calendar, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { buildAPIURL } from '../../utils/api';

type Comment = {
  id: string;
  post_id: string;
  post_title?: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  ip_address?: string;
};

type CommentStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
};

export function BlogCommentModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats>({ total: 0, pending: 0, approved: 0, rejected: 0, spam: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  useEffect(() => {
    loadComments();
    loadStats();
  }, [filter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildAPIURL('/admin/blog/comments?status=${filter}'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(buildAPIURL('/admin/blog/comments/stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateCommentStatus = async (commentId: string, status: string) => {
    try {
      const response = await fetch(buildAPIURL('/admin/blog/comments/${commentId}/status'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadComments();
        loadStats();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
      const response = await fetch(buildAPIURL('/admin/blog/comments/${commentId}'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadComments();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'spam': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'spam': return 'Spam';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Moderação de Comentários</h2>
        <p className="text-gray-600 mt-1">Gerir todos os comentários do blog</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('pending')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pendentes</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('approved')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 mt-1">Aprovados</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('rejected')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600 mt-1">Rejeitados</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('spam')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.spam}</div>
              <div className="text-sm text-gray-600 mt-1">Spam</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'spam', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-[#E31E24] hover:bg-[#C01920]' : ''}
          >
            {getStatusLabel(status === 'all' ? 'Todos' : status)}
          </Button>
        ))}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando comentários...</p>
        </div>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="size-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum comentário encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#E31E24] text-white flex items-center justify-center font-semibold text-lg">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.author_name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comment.status)}`}>
                            {getStatusLabel(comment.status)}
                          </span>
                          {comment.parent_id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <Reply className="size-3" />
                              Resposta
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {comment.author_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.post_title && (
                            <span className="text-gray-400">em "{comment.post_title}"</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comment Text */}
                    <p className="text-gray-700 whitespace-pre-wrap mb-4 bg-gray-50 p-3 rounded-lg">
                      {comment.content}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-4" />
                        {comment.likes_count} {comment.likes_count === 1 ? 'like' : 'likes'}
                      </span>
                      {comment.replies_count > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-4" />
                          {comment.replies_count} {comment.replies_count === 1 ? 'resposta' : 'respostas'}
                        </span>
                      )}
                      {comment.ip_address && (
                        <span className="text-xs text-gray-400">
                          IP: {comment.ip_address}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {comment.status !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => updateCommentStatus(comment.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="size-4 mr-1" />
                          Aprovar
                        </Button>
                      )}
                      {comment.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommentStatus(comment.id, 'rejected')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="size-4 mr-1" />
                          Rejeitar
                        </Button>
                      )}
                      {comment.status !== 'spam' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommentStatus(comment.id, 'spam')}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <AlertTriangle className="size-4 mr-1" />
                          Marcar Spam
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteComment(comment.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                      >
                        <Trash2 className="size-4 mr-1" />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
