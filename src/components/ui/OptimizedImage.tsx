import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Se true, não usa lazy loading
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizado com:
 * - Lazy loading (carrega apenas quando visível)
 * - Placeholder blur enquanto carrega
 * - Suporte a WebP com fallback
 * - Tratamento de erro
 * - Compressão automática via query params
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority); // Se priority, já começa visível
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority) return; // Sem lazy loading se for prioridade

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Começa a carregar 50px antes de aparecer
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Gerar URL otimizada (se for Supabase Storage)
  const getOptimizedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Se for Supabase Storage, adicionar parâmetros de otimização
      if (urlObj.hostname.includes('supabase')) {
        const params = new URLSearchParams();
        if (width) params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        params.set('quality', '80'); // Qualidade 80% (boa compressão)
        params.set('format', 'webp'); // Formato WebP
        
        return `${url}?${params.toString()}`;
      }
      
      return url;
    } catch {
      return url;
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: width && height ? `${width}/${height}` : undefined 
      }}
    >
      {/* Placeholder enquanto carrega */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Imagem otimizada */}
      {isVisible && !hasError && (
        <picture>
          {/* WebP com fallback */}
          <source 
            srcSet={optimizedSrc} 
            type="image/webp" 
          />
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            width={width}
            height={height}
          />
        </picture>
      )}

      {/* Estado de erro */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <ImageOff className="size-8 mb-2" />
          <span className="text-xs">Imagem não disponível</span>
        </div>
      )}
    </div>
  );
}
