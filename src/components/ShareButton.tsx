import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  productId?: string;
  className?: string;
}

export function ShareButton({ title, text, url, productId, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  const handleShare = async () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });

        toast.success('Compartilhado com sucesso!');
        
        // Track share event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'share', {
            method: 'web_share_api',
            content_type: productId ? 'product' : 'page',
            item_id: productId || shareUrl
          });
        }
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          fallbackCopyLink();
        }
      }
    } else {
      // Fallback to copy to clipboard
      fallbackCopyLink();
    }
  };

  const fallbackCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copiado para área de transferência!');

      setTimeout(() => setCopied(false), 2000);

      // Track copy event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'share', {
          method: 'clipboard',
          content_type: productId ? 'product' : 'page',
          item_id: productId || shareUrl
        });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span>Copiado!</span>
        </>
      ) : (
        <>
          {navigator.share ? (
            <Share2 className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>Compartilhar</span>
        </>
      )}
    </Button>
  );
}
