import { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';

type Comment = {
  id: string;
  post_id: string;
  post_title: string;
  author_name: string;
  author_email: string;
  author_website: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  created_at: string;
  replies_count: number;
};

export function BlogCommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'spam'>('pending');

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/comments?status=${filter}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PUT',
      });
      loadComments();
    } catch (error) {
      console.error('Error approving comment:', error);
    }
  };

  const markAsSpam = async (commentId: string) => {
    try {
      await fetch(`/api/admin/comments/${commentId}/spam`, {
        method: 'PUT',
      });
      loadComments();
    } catch (error) {
      console.error('Error marking as spam:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;
    
    try {
      await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">💬 Moderação de Comentários</h2>
        <p className="text-gray-600">Gerencie comentários e interações do blog</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'spam'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-[#E31E24]' : ''}
          >
            {status === 'pending' && '⏳ Pendentes'}
            {status === 'approved' && '✅ Aprovados'}
            {status === 'spam' && '🚫 Spam'}
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {comments.filter(c => c.status === status).length}
            </span>
          </Button>
        ))}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageCircle className="size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum comentário {filter}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#E31E24] text-white flex items-center justify-center font-bold">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{comment.author_name}</div>
                      <div className="text-sm text-gray-500">{comment.author_email}</div>
                    </div>
                  </div>
                  {comment.author_website && (
                    <a 
                      href={comment.author_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      🌐 {comment.author_website}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString('pt-AO')}
                  </div>
                  {comment.status === 'pending' && (
                    <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Pendente
                    </span>
                  )}
                  {comment.status === 'approved' && (
                    <span className="inline-block mt-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Aprovado
                    </span>
                  )}
                  {comment.status === 'spam' && (
                    <span className="inline-block mt-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      Spam
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700">{comment.content}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Post:</span> {comment.post_title}
                  {comment.replies_count > 0 && (
                    <span className="ml-3">
                      💬 {comment.replies_count} {comment.replies_count === 1 ? 'resposta' : 'respostas'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {comment.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveComment(comment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="size-4 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  {comment.status !== 'spam' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsSpam(comment.id)}
                    >
                      <X className="size-4 mr-1" />
                      Marcar Spam
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
