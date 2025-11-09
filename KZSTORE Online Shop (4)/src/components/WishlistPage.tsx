import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../App';

type WishlistPageProps = {
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onBack: () => void;
};

export function WishlistPage({ 
  wishlist, 
  onRemoveFromWishlist, 
  onAddToCart, 
  onViewProduct,
  onBack 
}: WishlistPageProps) {
  
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center size-32 rounded-full bg-gray-100 text-gray-400 mb-6">
            <Heart className="size-16" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sua lista está vazia
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Adicione produtos aos favoritos para acessá-los rapidamente depois.
          </p>
          <Button
            onClick={onBack}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold"
          >
            Explorar Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group mb-3"
              >
                <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Voltar</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="size-8 text-red-600 fill-current" />
                Meus Favoritos
              </h1>
              <p className="text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'produto' : 'produtos'} na lista
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-red-200 overflow-hidden transition-all hover-lift animate-slide-in-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <button
                  onClick={() => onViewProduct(product)}
                  className="w-full h-full"
                >
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </button>

                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => onRemoveFromWishlist(product)}
                  className="absolute top-3 right-3 size-10 rounded-full bg-white text-red-600 shadow-lg hover:scale-110 transition-all flex items-center justify-center z-10"
                  title="Remover dos favoritos"
                >
                  <Heart className="size-5 fill-current" />
                </button>

                {/* Stock Badge */}
                {product.estoque === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">
                      Esgotado
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="inline-block px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wide mb-2">
                  {product.categoria}
                </span>

                <button
                  onClick={() => onViewProduct(product)}
                  className="text-left w-full mb-3 group/title"
                >
                  <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] group-hover/title:text-red-600 transition-colors">
                    {product.nome}
                  </h3>
                </button>

                <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {product.preco_aoa.toLocaleString('pt-AO')}
                      <span className="text-sm font-normal text-gray-600 ml-1">AOA</span>
                    </p>
                    {product.estoque > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        <div className="size-2 rounded-full bg-green-600 animate-pulse" />
                        {product.estoque} em estoque
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1">
                        <div className="size-2 rounded-full bg-red-600" />
                        Indisponível
                      </span>
                    )}
                  </div>

                  {product.estoque > 0 ? (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="size-12 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center group/btn"
                      title="Adicionar ao carrinho"
                    >
                      <ShoppingCart className="size-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="size-12 rounded-xl bg-gray-200 text-gray-400 cursor-not-allowed flex items-center justify-center"
                    >
                      <ShoppingCart className="size-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl p-8 border-2 border-gray-100 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Gostou de algum produto?
          </h3>
          <p className="text-gray-600 mb-6">
            Adicione todos os seus favoritos ao carrinho de uma vez!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                wishlist.forEach(product => {
                  if (product.estoque > 0) {
                    onAddToCart(product);
                  }
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <ShoppingCart className="mr-2 size-5" />
              Adicionar Todos ao Carrinho
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="px-8 py-4 rounded-xl border-2 text-lg font-semibold"
            >
              <Package className="mr-2 size-5" />
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}