import { Share2, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { buildAPIURL } from '../../utils/api';

type ShareButtonsProps = {
  postId: string;
  postTitle: string;
  postUrl: string;
  postExcerpt?: string;
};

export function ShareButtons({ postId, postTitle, postUrl, postExcerpt = '' }: ShareButtonsProps) {
  const [shareCount, setShareCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const trackShare = async (platform: string) => {
    try {
      await fetch(buildAPIURL('/blog/${postId}/share'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `*${postTitle}*\n\n${postExcerpt ? postExcerpt + '\n\n' : ''}${postUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    trackShare('whatsapp');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
    trackShare('facebook');
  };

  const shareOnTwitter = () => {
    const text = `${postTitle}\n\n${postUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    trackShare('twitter');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
    trackShare('linkedin');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(postTitle);
    const body = encodeURIComponent(`Olá,\n\nAchei este artigo interessante e quis partilhar contigo:\n\n${postTitle}\n\n${postExcerpt}\n\nLer mais: ${postUrl}\n\nCumprimentos,\nKZSTORE Angola`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare('email');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      onClick: shareOnWhatsApp,
      color: 'hover:bg-green-50 hover:text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: shareOnFacebook,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      bgColor: 'bg-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      onClick: shareOnTwitter,
      color: 'hover:bg-sky-50 hover:text-sky-600',
      bgColor: 'bg-sky-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      onClick: shareOnLinkedIn,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      bgColor: 'bg-blue-700'
    },
    {
      name: 'Email',
      icon: Mail,
      onClick: shareByEmail,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      bgColor: 'bg-gray-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="size-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Partilhar este artigo</h3>
        {shareCount > 0 && (
          <span className="ml-auto text-sm text-gray-500">
            {shareCount} {shareCount === 1 ? 'partilha' : 'partilhas'}
          </span>
        )}
      </div>

      {/* Share Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {shareButtons.map((button) => (
          <button
            key={button.name}
            onClick={button.onClick}
            className={`flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg transition-all ${button.color}`}
          >
            <button.icon className="size-5" />
            <span className="text-sm font-medium">{button.name}</span>
          </button>
        ))}
      </div>

      {/* Copy Link Button */}
      <button
        onClick={copyLink}
        className={`w-full flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-all ${
          copied
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-300 hover:border-[#E31E24] hover:bg-gray-50'
        }`}
      >
        <LinkIcon className="size-5" />
        <span className="text-sm font-medium">
          {copied ? '✓ Link copiado!' : 'Copiar link'}
        </span>
      </button>

      {/* Mobile Native Share (if available) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={async () => {
            try {
              await navigator.share({
                title: postTitle,
                text: postExcerpt,
                url: postUrl
              });
              trackShare('native');
            } catch (error) {
              console.log('Share cancelled');
            }
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 p-3 bg-[#E31E24] text-white rounded-lg hover:bg-[#C01920] transition-colors"
        >
          <Share2 className="size-5" />
          <span className="text-sm font-medium">Partilhar...</span>
        </button>
      )}
    </div>
  );
}
