import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Link as LinkIcon, X } from 'lucide-react';
import { Button } from './ui/button';

type BlogInteractionsProps = {
  postId: string;
  postTitle: string;
  postUrl?: string;
};

// Custom SVG icons for social media
const FacebookIcon = () => (
  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

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
                  setShowSharePopup(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#1877F2] text-white hover:bg-[#1864D9] transition-colors"
              >
                <FacebookIcon />
                <span className="font-medium">Compartilhar no Facebook</span>
              </button>

              <button
                onClick={() => {
                  trackShare('twitter');
                  window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer');
                  setShowSharePopup(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1A8CD8] transition-colors"
              >
                <TwitterIcon />
                <span className="font-medium">Compartilhar no Twitter</span>
              </button>

              <button
                onClick={() => {
                  trackShare('linkedin');
                  window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer');
                  setShowSharePopup(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#0A66C2] text-white hover:bg-[#095196] transition-colors"
              >
                <LinkedinIcon />
                <span className="font-medium">Compartilhar no LinkedIn</span>
              </button>

              <button
                onClick={() => {
                  trackShare('whatsapp');
                  window.open(shareLinks.whatsapp, '_blank', 'noopener,noreferrer');
                  setShowSharePopup(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#25D366] text-white hover:bg-[#1FB855] transition-colors"
              >
                <WhatsAppIcon />
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
