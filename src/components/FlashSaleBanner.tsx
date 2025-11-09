import { Zap, ArrowRight } from 'lucide-react';
import { useFlashSales } from '../hooks/useFlashSales';
import { useCountdown } from '../hooks/useCountdown';
import { Product } from '../App';

interface FlashSaleBannerProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export function FlashSaleBanner({ products, onProductClick }: FlashSaleBannerProps) {
  const { flashSales, loading } = useFlashSales();

  if (loading || flashSales.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-600 to-red-700 rounded-2xl overflow-hidden shadow-2xl mb-8">
      <div className="relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm animate-pulse">
                <Zap className="size-10 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white mb-1 tracking-tight">
                  ⚡ FLASH SALES
                </h2>
                <p className="text-white/90 text-lg">
                  Ofertas relâmpago por tempo limitado!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSales.slice(0, 3).map((sale) => {
              const product = products.find(p => p.id === sale.product_id);
              if (!product) return null;

              return (
                <FlashSaleCard
                  key={sale.id}
                  sale={sale}
                  product={product}
                  onClick={() => onProductClick(product.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlashSaleCardProps {
  sale: any;
  product: Product;
  onClick: () => void;
}

function FlashSaleCard({ sale, product, onClick }: FlashSaleCardProps) {
  const { formatTime, isExpired } = useCountdown(sale.end_date);

  if (isExpired) return null;

  const originalPrice = Math.round(product.preco_aoa / (1 - sale.discount_percentage / 100));
  const remainingStock = sale.stock_limit - sale.stock_sold;
  const stockPercentage = (sale.stock_sold / sale.stock_limit) * 100;

  return (
    <button
      onClick={onClick}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all group border-2 border-white/20 hover:border-white/40 text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg font-bold text-lg">
          -{sale.discount_percentage}%
        </div>
        <div className="text-white text-right">
          <p className="text-xs opacity-80">Termina em</p>
          <p className="font-bold text-lg">{formatTime()}</p>
        </div>
      </div>

      <div className="aspect-square bg-white rounded-xl mb-4 overflow-hidden">
        <img 
          src={product.imagem_url} 
          alt={product.nome}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
        {product.nome}
      </h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">
            {product.preco_aoa.toLocaleString('pt-AO')} AOA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60 line-through text-sm">
            {originalPrice.toLocaleString('pt-AO')} AOA
          </span>
          <span className="text-green-300 font-semibold text-sm">
            Economize {(originalPrice - product.preco_aoa).toLocaleString('pt-AO')} AOA
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/80">
          <span>Restam {remainingStock} unidades</span>
          <span>{Math.round(100 - stockPercentage)}% disponível</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${100 - stockPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-white group-hover:text-yellow-300 transition-colors">
        <span className="font-semibold">Ver produto</span>
        <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
