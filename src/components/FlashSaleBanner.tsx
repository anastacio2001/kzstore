import { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/button';

type FlashSale = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  original_price: number;
  sale_price: number; // API retorna sale_price, não discounted_price
  discount_percentage: number;
  stock_limit: number;
  stock_sold: number;
  start_date: string;
  end_date: string;
  title: string;
  description: string;
  is_active: boolean;
};

type FlashSaleBannerProps = {
  onViewProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
};

export function FlashSaleBanner({ onViewProduct, onAddToCart }: FlashSaleBannerProps) {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadFlashSales();
    const interval = setInterval(loadFlashSales, 60000); // Reload every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (flashSales.length > 0) {
      const timer = setInterval(() => {
        updateTimeLeft();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [flashSales, currentIndex]);

  const loadFlashSales = async () => {
    try {
      const response = await fetch('/api/flash-sales');

      if (response.ok) {
        const data = await response.json();
        setFlashSales(data.flashSales || []);
      }
    } catch (error) {
      console.error('Error loading flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (flashSales.length === 0) return;
    
    const sale = flashSales[currentIndex];
    const endDate = new Date(sale.end_date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      loadFlashSales(); // Reload to get updated sales
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || flashSales.length === 0 || dismissed) {
    return null;
  }

  const currentSale = flashSales[currentIndex];
  const stockPercentage = ((currentSale.stock_limit - currentSale.stock_sold) / currentSale.stock_limit) * 100;
  const stockRemaining = currentSale.stock_limit - currentSale.stock_sold;

  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white shadow-xl">
      <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-4">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="size-5 fill-white" />
              <div>
                <h3 className="font-bold text-sm">⚡ FLASH SALE</h3>
                <p className="text-xs opacity-90 line-clamp-1">{currentSale.title}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white p-1"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </button>
          </div>
          
          <button
            onClick={() => onViewProduct?.(currentSale.product_id)}
            className="w-full flex items-center gap-2 bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors"
          >
            {currentSale.product_image && (
              <img 
                src={currentSale.product_image} 
                alt={currentSale.product_name}
                className="size-12 rounded object-cover bg-white flex-shrink-0"
              />
            )}
            <div className="flex-1 text-left min-w-0">
              <h4 className="font-semibold text-sm line-clamp-1">{currentSale.product_name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs line-through opacity-75">{formatPrice(currentSale.original_price)}</span>
                <span className="text-base font-bold">{formatPrice(currentSale.sale_price)}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  -{currentSale.discount_percentage}%
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">Restam apenas {stockRemaining}!</p>
            </div>
            <ShoppingCart className="size-5 flex-shrink-0" />
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Icon & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Zap className="size-6 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">⚡ FLASH SALE</h3>
              <p className="text-sm opacity-90">{currentSale.title}</p>
            </div>
          </div>

          {/* Center: Product Info */}
          <div className="flex items-center gap-4 flex-1">
            {currentSale.product_image && (
              <img 
                src={currentSale.product_image} 
                alt={currentSale.product_name}
                className="size-16 rounded-lg object-cover bg-white"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold line-clamp-1">{currentSale.product_name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm line-through opacity-75">{formatPrice(currentSale.original_price)}</span>
                <span className="text-2xl font-bold">{formatPrice(currentSale.sale_price)}</span>
                <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-sm font-medium">
                  -{currentSale.discount_percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Right: Timer & CTA */}
          <div className="flex items-center gap-4">
            {/* Timer */}
            {timeLeft && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Clock className="size-4" />
                <div className="flex items-center gap-1 font-mono text-lg font-bold">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="opacity-50">:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="opacity-50">:</span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            )}

            {/* Stock Indicator */}
            <div className="hidden lg:block">
              <p className="text-xs opacity-90 mb-1">Restam apenas {stockRemaining}!</p>
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => onViewProduct?.(currentSale.product_id)}
              className="bg-white text-orange-600 hover:bg-white/90 font-bold gap-2 shrink-0"
            >
              <ShoppingCart className="size-4" />
              Ver Oferta
            </Button>

            {/* Dismiss Button */}
            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white shrink-0"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
