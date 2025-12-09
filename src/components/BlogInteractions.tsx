import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, X } from 'lucide-react';
import { Button } from './ui/button';

type BlogInteractionsProps = {
  postId: string;
  postTitle: string;
  postUrl?: string;
};

export function BlogInteractions({ postId, postTitle, postUrl }: BlogInteractionsProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');

  useEffect(() => {
    loadLikes();
    loadComments();
    trackView();
  }, [postId]);

  const trackView = async () => {
    try {
      await fetch(`/api/blog/${postId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionStorage.getItem('sessionId') || Math.random().toString(36)
        })
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const loadLikes = async () => {
    try {
      const response = await fetch(`/api/blog/${postId}/likes`);
      if (response.ok) {
        const data = await response.json();
        setLikes(Number(data.count) || 0);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
    const hasLikedBefore = localStorage.getItem(`blog-liked-${postId}`);
    setHasLiked(hasLikedBefore === 'true');
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/blog/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async () => {
    const userEmail = localStorage.getItem('userEmail') || 'guest@kzstore.ao';
    
    try {
      const response = await fetch(`/api/blog/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.liked);
        localStorage.setItem(`blog-liked-${postId}`, data.liked ? 'true' : 'false');
        loadLikes(); // Reload count from server
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentName.trim() || !commentEmail.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await fetch(`/api/blog/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentName,
          authorEmail: commentEmail,
          content: newComment
        })
      });
      
      if (response.ok) {
        alert('Comentário enviado para moderação!');
        setNewComment('');
        setCommentName('');
        setCommentEmail('');
        // Reload comments
        loadComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erro ao enviar comentário. Tente novamente.');
    }
  };

  const currentUrl = postUrl || window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/blog/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const handleShare = (platform: string, url: string) => {
    trackShare(platform);
    window.open(url, '_blank', 'width=600,height=400');
    setShowSharePopup(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    trackShare('copy');
    alert('Link copiado para a área de transferência!');
    setShowSharePopup(false);
  };

  return (
    <div className="border-t border-b py-6 my-8">
      {/* Interaction Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant={hasLiked ? "default" : "outline"}
          onClick={handleLike}
          className={`gap-2 ${hasLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
        >
          <Heart className={`size-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
          <span className="hidden sm:inline">Gostei</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowComments(!showComments)}
          className="gap-2"
        >
          <MessageCircle className="size-4" />
          <span>{comments.length}</span>
          <span className="hidden sm:inline">Comentários</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowSharePopup(true)}
          className="gap-2"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Comentários ({comments.length})</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Seu nome *"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                  required
                />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                />
              </div>
              <textarea
                placeholder="Escreva seu comentário... *"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E24]"
                required
              />
              <Button type="submit" className="bg-[#E31E24] hover:bg-[#c01920]">
                Enviar Comentário
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E31E24] text-white flex items-center justify-center font-bold">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.date).toLocaleDateString('pt-AO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSharePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">Compartilhar Artigo</h3>
            <p className="text-gray-600 text-sm mb-6">{postTitle}</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  trackShare('facebook');
                  window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#1877F2] text-white hover:bg-[#1864D9] transition-colors"
              >
                <Facebook className="size-5" />
                <span className="font-medium">Compartilhar no Facebook</span>
              </button>

              <button
                onClick={() => {
                  trackShare('twitter');
                  window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1A8CD8] transition-colors"
              >
                <Twitter className="size-5" />
                <span className="font-medium">Compartilhar no Twitter</span>
              </button>

              <button
                onClick={() => {
                  trackShare('linkedin');
                  window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#0A66C2] text-white hover:bg-[#095196] transition-colors"
              >
                <Linkedin className="size-5" />
                <span className="font-medium">Compartilhar no LinkedIn</span>
              </button>

              <button
                onClick={() => {
                  trackShare('whatsapp');
                  window.open(shareLinks.whatsapp, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#25D366] text-white hover:bg-[#1FB855] transition-colors"
              >
                <MessageCircle className="size-5" />
                <span className="font-medium">Compartilhar no WhatsApp</span>
              </button>

              <button
                onClick={copyLink}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <LinkIcon className="size-5" />
                <span className="font-medium">Copiar Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
