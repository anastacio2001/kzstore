import { ShoppingCart, Eye, Heart, TrendingUp } from 'lucide-react';
import { Product } from '../App';
import { useState } from 'react';
import { useFlashSales } from '../hooks/useFlashSales';
import { FlashSaleBadge } from './FlashSaleBadge';

type ProductCardProps = {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
};

export function ProductCard({ product, onViewDetails, onAddToCart, isInWishlist = false, onToggleWishlist }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { flashSales } = useFlashSales();

  const isNew = Math.random() > 0.7; // Randomly mark some as new
  const isBestSeller = Math.random() > 0.8; // Randomly mark some as best sellers

  // Check if product is in flash sale
  const flashSale = flashSales.find(sale => sale.product_id === product.id && sale.is_active);
  
  // Calculate prices based on flash sale
  const hasFlashSale = !!flashSale;
  const discountPercentage = hasFlashSale ? flashSale.discount_percentage : Math.floor(Math.random() * 20) + 5;
  const finalPrice = hasFlashSale 
    ? product.preco_aoa * (1 - flashSale.discount_percentage / 100)
    : product.preco_aoa;
  const originalPrice = product.preco_aoa;

  return (
    <div className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-red-200 overflow-hidden transition-all hover-lift animate-fade-in">
      {/* Flash Sale Badge */}
      {flashSale && (
        <FlashSaleBadge
          endDate={flashSale.end_date}
          discountPercentage={flashSale.discount_percentage}
          stockLimit={flashSale.stock_limit}
          stockSold={flashSale.stock_sold}
          size="small"
        />
      )}

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.estoque === 0 && (
          <span className="px-3 py-1 rounded-full bg-gray-800 text-white text-xs font-bold shadow-md">
            ESGOTADO
          </span>
        )}
        {product.estoque > 0 && product.estoque < 5 && (
          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md animate-pulse">
            ÚLTIMAS {product.estoque}
          </span>
        )}
        {product.estoque >= 5 && product.estoque <= 10 && (
          <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-md">
            ESTOQUE BAIXO
          </span>
        )}
        {isNew && product.estoque > 0 && (
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
            NOVO
          </span>
        )}
        {isBestSeller && product.estoque > 0 && (
          <span className="px-3 py-1 rounded-full bg-gradient-accent text-gray-900 text-xs font-bold shadow-md flex items-center gap-1">
            <TrendingUp className="size-3" />
            POPULAR
          </span>
        )}
      </div>

      {/* Discount Badge */}
      {product.estoque > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="size-14 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-lg font-bold">
            <span className="text-lg leading-none">-{discountPercentage}%</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="absolute top-20 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product);
            }
          }}
          className={`size-10 rounded-full ${
            isInWishlist ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
          } shadow-lg hover:scale-110 transition-all flex items-center justify-center`}
          title="Adicionar aos favoritos"
        >
          <Heart className={`size-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="size-10 rounded-full bg-white text-gray-600 shadow-lg hover:scale-110 transition-all flex items-center justify-center hover:bg-red-600 hover:text-white"
          title="Ver detalhes"
        >
          <Eye className="size-5" />
        </button>
      </div>

      {/* Image */}
      <button
        onClick={() => onViewDetails(product)}
        className="relative w-full aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={product.imagem_url}
          alt={product.nome}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Out of Stock Overlay */}
        {product.estoque === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-2">Esgotado</p>
              <p className="text-gray-300 text-sm">Volte em breve</p>
            </div>
          </div>
        )}
      </button>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wide">
              {product.categoria}
            </span>
            {product.condicao && (
              <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                product.condicao === 'Novo' ? 'bg-green-50 text-green-700' :
                product.condicao === 'Usado' ? 'bg-orange-50 text-orange-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {product.condicao}
              </span>
            )}
          </div>
          
          {product.estoque > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <div className="size-2 rounded-full bg-green-600 animate-pulse" />
              Em estoque
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <div className="size-2 rounded-full bg-red-600" />
              Indisponível
            </span>
          )}
        </div>

        {/* Product Name */}
        <button
          onClick={() => onViewDetails(product)}
          className="text-left w-full mb-3 group/title"
        >
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] group-hover/title:text-red-600 transition-colors leading-snug">
            {product.nome}
          </h3>
        </button>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {product.descricao}
        </p>

        {/* Price & Action */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            {hasFlashSale && (
              <p className="text-xs text-gray-500 line-through mb-1">
                {originalPrice.toLocaleString('pt-AO')} AOA
              </p>
            )}
            <p className={`text-2xl font-bold ${hasFlashSale ? 'text-red-600' : 'text-gray-900'}`}>
              {Math.floor(finalPrice).toLocaleString('pt-AO')} Kz
            </p>
            {hasFlashSale && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                Economize {Math.floor(originalPrice - finalPrice).toLocaleString('pt-AO')} Kz
              </p>
            )}
          </div>

          {product.estoque > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="size-12 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center group/btn"
              title="Adicionar ao carrinho"
            >
              <ShoppingCart className="size-5 group-hover/btn:scale-110 transition-transform" />
            </button>
          ) : (
            <button
              disabled
              className="size-12 rounded-xl bg-gray-200 text-gray-400 cursor-not-allowed flex items-center justify-center"
              title="Produto esgotado"
            >
              <ShoppingCart className="size-5" />
            </button>
          )}
        </div>

        {/* Specs Preview (if available) */}
        {product.especificacoes && Object.keys(product.especificacoes).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {Object.entries(product.especificacoes).slice(0, 2).map(([key, value]) => (
                <span key={key} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  <span className="font-medium">{key}:</span> {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover Shadow Effect */}
      <div className="absolute inset-0 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}