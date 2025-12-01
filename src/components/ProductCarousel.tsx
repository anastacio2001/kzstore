import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../App';

type ProductCarouselProps = {
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
};

export function ProductCarousel({ title, products, onProductClick, onAddToCart }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Verificar a posição do scroll para mostrar/esconder setas
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [products]);

  // Função para scroll suave
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
        
        {/* Navigation Arrows - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className={`p-2 rounded-lg border-2 transition-all ${
              showLeftArrow
                ? 'border-red-600 text-red-600 hover:bg-red-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll para esquerda"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className={`p-2 rounded-lg border-2 transition-all ${
              showRightArrow
                ? 'border-red-600 text-red-600 hover:bg-red-50'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll para direita"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[160px] sm:w-[180px] bg-white rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-md transition-all duration-300 group"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="w-full h-[140px] sm:h-[150px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Discount Badge */}
              {product.desconto && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  -{product.desconto}%
                </div>
              )}

              {/* Stock Badge */}
              {product.estoque < 5 && product.estoque > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  Últimas {product.estoque} unidades
                </div>
              )}

              {/* Out of Stock Badge */}
              {product.estoque === 0 && (
                <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                  Esgotado
                </div>
              )}

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Ver detalhes"
                >
                  <Eye className="size-5 text-gray-900" />
                </button>
                {onAddToCart && product.estoque > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    aria-label="Adicionar ao carrinho"
                  >
                    <ShoppingCart className="size-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div 
              className="p-2.5 cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              {/* Category */}
              <p className="text-[10px] text-red-600 font-semibold uppercase mb-1">
                {product.categoria}
              </p>

              {/* Product Name */}
              <h3 className="text-xs font-semibold text-gray-900 mb-1.5 line-clamp-2 min-h-[2rem]">
                {product.nome}
              </h3>

              {/* Price */}
              <div className="mb-2">
                {product.desconto ? (
                  <div>
                    <p className="text-[10px] text-gray-400 line-through">
                      {formatPrice(product.preco_aoa / (1 - product.desconto / 100))}
                    </p>
                    <p className="text-sm font-bold text-red-600">
                      {formatPrice(product.preco_aoa)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-red-600">
                    {formatPrice(product.preco_aoa)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="text-xs">
                {product.estoque > 0 ? (
                  <span className="text-green-600 font-semibold">Em estoque</span>
                ) : (
                  <span className="text-gray-500 font-semibold">Indisponível</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator - Mobile */}
      <div className="flex md:hidden justify-center gap-1 mt-4">
        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, idx) => (
          <div
            key={idx}
            className="w-2 h-2 rounded-full bg-gray-300"
          />
        ))}
      </div>

      {/* CSS para esconder scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
