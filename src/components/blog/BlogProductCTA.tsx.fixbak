import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

type Product = {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  desconto?: number;
};

type BlogProductCTAProps = {
  products: Product[];
  couponCode?: string;
  ctaText?: string;
  onNavigateToProduct?: (productId: string) => void;
};

export function BlogProductCTA({ products, couponCode, ctaText, onNavigateToProduct }: BlogProductCTAProps) {
  if (!products || products.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-[#E31E24]/5 to-orange-50 rounded-xl border-2 border-[#E31E24]/20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-5 text-[#E31E24]" />
        <h3 className="text-lg font-bold text-gray-900">
          {ctaText || 'Produtos Mencionados Neste Artigo'}
        </h3>
      </div>

      {/* Products Grid */}
      <div className={`grid ${products.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'} gap-4 mb-4`}>
        {products.map((product) => {
          const finalPrice = calculateDiscountedPrice(product.preco, product.desconto);
          const hasDiscount = product.desconto && product.desconto > 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onNavigateToProduct?.(product.id)}
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img
                    src={product.imagem_url || '/placeholder-product.jpg'}
                    alt={product.nome}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">
                    {product.nome}
                  </h4>
                  
                  <div className="flex items-baseline gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-lg font-bold text-[#E31E24]">
                          {formatPrice(finalPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.preco)}
                        </span>
                        <span className="text-xs bg-[#E31E24] text-white px-2 py-0.5 rounded-full font-medium">
                          -{product.desconto}%
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-[#E31E24]">
                        {formatPrice(product.preco)}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="mt-2 bg-[#E31E24] hover:bg-[#C01920] text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToProduct?.(product.id);
                    }}
                  >
                    <ShoppingCart className="size-3 mr-1" />
                    Ver Produto
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Code */}
      {couponCode && (
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-[#E31E24]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                💝 Cupom Exclusivo Para Leitores
              </p>
              <p className="text-xs text-gray-500">
                Use o código abaixo e ganhe desconto adicional
              </p>
            </div>
            <div className="bg-[#E31E24] text-white px-4 py-2 rounded font-mono font-bold text-lg">
              {couponCode}
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-4 text-center">
        <Button
          onClick={() => window.location.href = '/produtos'}
          className="bg-[#E31E24] hover:bg-[#C01920]"
        >
          Ver Todos Produtos
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
