import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Advertisement, AdPosition } from '../types/ads';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
  onNavigateToProduct?: (product: any) => void;
  preloadedAds?: Advertisement[];
}

export function AdBanner({ position, className = '', onNavigateToProduct, preloadedAds }: AdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>(preloadedAds || []);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    // Use preloaded ads if available, otherwise fetch
    if (preloadedAds && preloadedAds.length > 0) {
      setAds(preloadedAds);
    } else {
      loadAds();
    }
  }, [position, preloadedAds]);

  useEffect(() => {
    // Rotate ads every 10 seconds if multiple ads
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
        setHasTrackedView(false); // Reset tracking for new ad
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ads]);

  useEffect(() => {
    // Track view when ad is displayed
    if (ads[currentAdIndex] && isVisible && !hasTrackedView) {
      trackView(ads[currentAdIndex].id);
      setHasTrackedView(true);
    }
  }, [currentAdIndex, ads, isVisible, hasTrackedView]);

  const loadAds = async () => {
    try {
      const response = await fetch(`/api/ads?posicao=${position}&ativo=true`);

      if (!response.ok) {
        // Silently fail if no ads found - this is not an error condition
        if (response.status === 404) {
          setAds([]);
          return;
        }
        console.warn('⚠️ Could not load ads:', response.status);
        setAds([]);
        return;
      }

      const data = await response.json();
      console.log(`📢 Loaded ${data.length} ads for position:`, position);
      setAds(data || []);
    } catch (error) {
      // Silently handle errors - ads are optional feature
      console.warn('Error loading ads:', error);
      setAds([]);
    }
  };

  const trackView = async (adId: string) => {
    try {
      await fetch(`/api/ads/${adId}/impression`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await fetch(`/api/ads/${adId}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = async (ad: Advertisement) => {
    trackClick(ad.id);
    if (ad.link_url) {
      console.log('🎯 [AdBanner] Clicking ad, link:', ad.link_url);
      
      // Se link é interno (/produto/) E temos callback de navegação
      if (ad.link_url.includes('/produto/') && onNavigateToProduct) {
        try {
          // Extrair UUID do link
          const uuidMatch = ad.link_url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          
          if (uuidMatch) {
            const productId = uuidMatch[0];
            console.log('🎯 [AdBanner] Extracted product ID:', productId);
            
            // Buscar produto via API
            const response = await fetch(`/api/products/${productId}`);
            if (response.ok) {
              const data = await response.json();
              // API retorna { product: {...} }
              const product = data.product || data;
              console.log('✅ [AdBanner] Product found:', product.nome);
              
              // Chamar callback direto do App
              onNavigateToProduct(product);
              return;
            } else {
              console.error('❌ [AdBanner] API response not OK:', response.status);
            }
          }
        } catch (e) {
          console.error('❌ [AdBanner] Error loading product:', e);
        }
      }
      
      // Links externos: navegação normal
      console.log('🎯 [AdBanner] External link, using direct navigation');
      window.location.href = ad.link_url;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Loading skeleton
  if (!isVisible) {
    return null;
  }

  if (ads.length === 0) {
    // Show skeleton loader for hero banner while loading
    if (position === 'home-hero-banner') {
      return (
        <div className={`relative ${className}`}>
          <div className="relative overflow-hidden shadow-lg animate-pulse">
            <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] bg-gradient-to-br from-gray-200 to-gray-300" />
          </div>
        </div>
      );
    }
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Different layouts based on position
  if (position === 'home-hero-banner') {
    return (
      <div className={`relative group ${className}`}>
        <div
          className="relative overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => handleAdClick(currentAd)}
        >
          <img
            src={currentAd.imagem_url}
            alt={currentAd.titulo}
            className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          {(currentAd.titulo || currentAd.descricao) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              {currentAd.titulo && (
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{currentAd.titulo}</h3>
              )}
              {currentAd.descricao && (
                <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-2">{currentAd.descricao}</p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 size-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="size-4" />
        </button>
        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`size-2 rounded-full transition-all ${
                  index === currentAdIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (position === 'home-sidebar' || position === 'product-sidebar') {
    return (
      <div className={`relative group ${className}`}>
        <div
          className="relative overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => handleAdClick(currentAd)}
        >
          <img
            src={currentAd.imagem_url}
            alt={currentAd.titulo}
            className="w-full h-auto object-cover"
          />
          {(currentAd.titulo || currentAd.descricao) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
              {currentAd.titulo && (
                <h4 className="font-bold mb-1">{currentAd.titulo}</h4>
              )}
              {currentAd.descricao && (
                <p className="text-sm text-white/90">{currentAd.descricao}</p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 size-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="size-3" />
        </button>
      </div>
    );
  }

  // Default banner layout (category-top, home-middle-banner, checkout-banner, footer-banner)
  return (
    <div className={`relative group ${className}`}>
      <div
        className="relative overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow"
        onClick={() => handleAdClick(currentAd)}
      >
        <img
          src={currentAd.imagem_url}
          alt={currentAd.titulo}
          className="w-full h-[200px] md:h-[250px] object-cover"
        />
        {(currentAd.titulo || currentAd.descricao) && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-transparent to-transparent text-white">
            {currentAd.titulo && (
              <h4 className="text-xl font-bold mb-1">{currentAd.titulo}</h4>
            )}
            {currentAd.descricao && (
              <p className="text-sm text-white/90">{currentAd.descricao}</p>
            )}
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 size-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="size-4" />
      </button>
      {ads.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`size-1.5 rounded-full transition-all ${
                index === currentAdIndex ? 'bg-white w-4' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}