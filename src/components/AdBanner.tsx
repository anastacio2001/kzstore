import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Advertisement, AdPosition } from '../types/ads';
import { supabase } from '../utils/supabase/client';

interface AdBannerProps {
  position: AdPosition;
  className?: string;
}

export function AdBanner({ position, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    loadAds();
  }, [position]);

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
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .eq('position', position)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .lte('start_date', now)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`📢 AdBanner [${position}]: Carregados ${data?.length || 0} anúncios`, data);
      setAds(data || []);
    } catch (error) {
      console.error(`❌ AdBanner [${position}]: Erro ao carregar anúncios:`, error);
    }
  };

  const trackView = async (adId: string) => {
    try {
      // Primeiro buscar o valor atual
      const { data: currentAd, error: fetchError } = await supabase
        .from('ads')
        .select('impressions')
        .eq('id', adId)
        .single();

      if (fetchError) throw fetchError;

      // Depois atualizar com o valor incrementado
      const { error } = await supabase
        .from('ads')
        .update({
          impressions: (currentAd.impressions || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId);

      if (error) {
        console.error('Error tracking view:', error);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      // Primeiro buscar o valor atual
      const { data: currentAd, error: fetchError } = await supabase
        .from('ads')
        .select('clicks')
        .eq('id', adId)
        .single();

      if (fetchError) throw fetchError;

      // Depois atualizar com o valor incrementado
      const { error } = await supabase
        .from('ads')
        .update({
          clicks: (currentAd.clicks || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId);

      if (error) {
        console.error('Error tracking click:', error);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = (ad: Advertisement) => {
    trackClick(ad.id);
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Different layouts based on position
  if (position === 'home-hero-banner') {
    return (
      <div className={`relative group ${className}`}>
        <div
          className="relative overflow-hidden rounded-2xl cursor-pointer shadow-xl hover:shadow-2xl transition-shadow"
          onClick={() => handleAdClick(currentAd)}
        >
          <img
            src={currentAd.image_urls?.[0]}
            alt={currentAd.title}
            className="w-full h-[400px] object-cover"
            onError={(e) => {
              console.error(`❌ AdBanner [${position}]: Erro ao carregar imagem:`, currentAd.image_urls?.[0]);
              // Evitar loop infinito - só definir fallback se não for já uma imagem de erro
              const currentSrc = e.currentTarget.src;
              if (!currentSrc.includes('data:image') && !currentSrc.includes('Erro+ao+Carregar')) {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gYW8gQ2FycmVnYXIgSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
              } else {
                // Se já tentou o fallback, remover o handler para evitar loop
                e.currentTarget.onerror = null;
              }
            }}
            onLoad={() => {
              console.log(`✅ AdBanner [${position}]: Imagem carregada com sucesso:`, currentAd.image_urls?.[0]);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {(currentAd.title || currentAd.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              {currentAd.title && (
                <h3 className="text-3xl font-bold mb-2">{currentAd.title}</h3>
              )}
              {currentAd.description && (
                <p className="text-lg text-white/90">{currentAd.description}</p>
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
            src={currentAd.image_urls?.[0]}
            alt={currentAd.title}
            className="w-full h-auto object-cover"
            onError={(e) => {
              console.error(`❌ AdBanner [${position}]: Erro ao carregar imagem:`, currentAd.image_urls?.[0]);
              // Evitar loop infinito - só definir fallback se não for já uma imagem de erro
              const currentSrc = e.currentTarget.src;
              if (!currentSrc.includes('data:image') && !currentSrc.includes('Erro+ao+Carregar')) {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gYW8gQ2FycmVnYXIgSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
              } else {
                // Se já tentou o fallback, remover o handler para evitar loop
                e.currentTarget.onerror = null;
              }
            }}
            onLoad={() => {
              console.log(`✅ AdBanner [${position}]: Imagem carregada com sucesso:`, currentAd.image_urls?.[0]);
            }}
          />
          {(currentAd.title || currentAd.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
              {currentAd.title && (
                <h4 className="font-bold mb-1">{currentAd.title}</h4>
              )}
              {currentAd.description && (
                <p className="text-sm text-white/90">{currentAd.description}</p>
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
          src={currentAd.image_urls?.[0]}
          alt={currentAd.title}
          className="w-full h-[200px] md:h-[250px] object-cover"
          onError={(e) => {
            console.error(`❌ AdBanner [${position}]: Erro ao carregar imagem:`, currentAd.image_urls?.[0]);
            // Evitar loop infinito - só definir fallback se não for já uma imagem de erro
            const currentSrc = e.currentTarget.src;
            if (!currentSrc.includes('data:image') && !currentSrc.includes('Erro+ao+Carregar')) {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm8gYW8gQ2FycmVnYXIgSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
            } else {
              // Se já tentou o fallback, remover o handler para evitar loop
              e.currentTarget.onerror = null;
            }
          }}
          onLoad={() => {
            console.log(`✅ AdBanner [${position}]: Imagem carregada com sucesso:`, currentAd.image_urls?.[0]);
          }}
        />
        {(currentAd.title || currentAd.description) && (
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-transparent to-transparent text-white">
            {currentAd.title && (
              <h4 className="text-xl font-bold mb-1">{currentAd.title}</h4>
            )}
            {currentAd.description && (
              <p className="text-sm text-white/90">{currentAd.description}</p>
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
