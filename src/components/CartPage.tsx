import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Package, Truck, Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { FlashSaleBanner } from './FlashSaleBanner';

type CartPageProps = {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onViewProduct?: (productId: string) => void;
};

export function CartPage({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onContinueShopping, onViewProduct }: CartPageProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.preco_aoa * item.quantity), 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.product.peso_kg * item.quantity), 0);
  
  // Calculate shipping cost based on products (same logic as CheckoutPage)
  const shippingCost = cart.reduce((total, item) => {
    const product = item.product;
    
    // Se shipping_type não está definido (produtos antigos), considerar frete pago com custo 0
    const shippingType = product?.shipping_type || 'paid';
    const shippingCostAoa = product?.shipping_cost_aoa || 0;
    
    if (shippingType === 'free') {
      return total; // Frete grátis
    }
    
    // Se tem frete pago, somar o custo (0 se não definido)
    const itemShipping = shippingCostAoa * item.quantity;
    return total + itemShipping;
  }, 0);
  
  const total = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
        <div className="max-w-md mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center justify-center size-24 sm:size-32 rounded-full bg-gray-100 text-gray-400 mb-6">
            <ShoppingBag className="size-12 sm:size-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Parece que você ainda não adicionou nenhum produto ao carrinho.
          </p>
          <Button
            onClick={onContinueShopping}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold group"
          >
            Explorar Produtos
            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-10 sm:size-12 rounded-xl bg-blue-100 text-blue-600 mb-2">
                <Truck className="size-5 sm:size-6" />
              </div>
              <p className="text-xs text-gray-600">Entrega Rápida</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-10 sm:size-12 rounded-xl bg-green-100 text-green-600 mb-2">
                <Shield className="size-5 sm:size-6" />
              </div>
              <p className="text-xs text-gray-600">Compra Segura</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-10 sm:size-12 rounded-xl bg-yellow-100 text-yellow-600 mb-2">
                <Package className="size-5 sm:size-6" />
              </div>
              <p className="text-xs text-gray-600">Ofertas Especiais</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">
                Carrinho de Compras
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {cart.length} {cart.length === 1 ? 'produto' : 'produtos'} no carrinho
              </p>
            </div>
            <button
              onClick={onContinueShopping}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group flex-shrink-0"
            >
              <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Continuar Comprando</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <FlashSaleBanner onViewProduct={onViewProduct} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items - Mobile Optimized */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-red-200 transition-all animate-slide-in-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-3 sm:gap-6">
                  {/* Product Image - Mobile Optimized */}
                  <div className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden group">
                    <img
                      src={item.product.imagem_url}
                      alt={item.product.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.product.estoque < 10 && item.product.estoque > 0 && (
                      <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-orange-500 text-white text-[10px] sm:text-xs font-bold">
                          Últimas {item.product.estoque}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - Mobile Optimized */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <span className="inline-block px-2 py-0.5 sm:py-1 rounded-md bg-red-50 text-red-700 text-[10px] sm:text-xs font-semibold uppercase">
                            {item.product.categoria}
                          </span>
                          {(item.product as any).is_flash_sale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold uppercase animate-pulse">
                              ⚡ FLASH SALE -{(item.product as any).discount_percentage}%
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-1 line-clamp-2 leading-tight">
                          {item.product.nome}
                        </h3>
                        {(item.product as any).is_flash_sale && (item.product as any).original_price && (
                          <p className="text-xs sm:text-sm text-gray-500 line-through">
                            Preço original: {((item.product as any).original_price).toLocaleString('pt-AO')} Kz
                          </p>
                        )}
                        <p className="hidden sm:block text-sm text-gray-600 line-clamp-1">
                          {item.product.descricao}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="size-8 sm:size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                        title="Remover produto"
                      >
                        <Trash2 className="size-4 sm:size-5" />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity > item.product.estoque && (
                      <div className="flex items-start gap-2 mb-3 p-2 sm:p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="size-4 sm:size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-red-700">
                          Apenas {item.product.estoque} unidades disponíveis
                        </p>
                      </div>
                    )}

                    {/* Quantity & Price - Mobile Optimized */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Quantity Selector - Mobile Optimized */}
                      <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="size-3 sm:size-4" />
                        </button>
                        <span className="px-3 py-1.5 sm:px-4 sm:py-2 font-bold min-w-[40px] sm:min-w-[50px] text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.estoque}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="size-3 sm:size-4" />
                        </button>
                      </div>

                      {/* Price - Mobile Optimized */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                          {item.product.preco_aoa.toLocaleString('pt-AO')} × {item.quantity}
                        </p>
                        <p className="text-base sm:text-2xl font-bold text-red-600 whitespace-nowrap">
                          {(item.product.preco_aoa * item.quantity).toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Continue Shopping */}
            <button
              onClick={onContinueShopping}
              className="md:hidden w-full flex items-center justify-center gap-2 py-4 text-gray-600 hover:text-red-600 transition-colors font-medium border-2 border-gray-200 rounded-xl hover:border-red-200"
            >
              <ArrowLeft className="size-5" />
              Continuar Comprando
            </button>
          </div>

          {/* Order Summary - Mobile Optimized with Fixed Bottom */}
          <div className="lg:col-span-1">
            <div className="fixed bottom-0 left-0 right-0 lg:sticky lg:top-24 bg-white border-t-2 lg:border-2 lg:border-gray-100 lg:rounded-2xl z-40 lg:z-0 shadow-2xl lg:shadow-none">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {subtotal.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="size-3.5 sm:size-4 text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-600">Frete</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {shippingCost === 0 ? '🎁 GRÁTIS' : `${shippingCost.toLocaleString('pt-AO')} Kz`}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-gray-200 pt-3 sm:pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">
                        {total.toLocaleString('pt-AO')} Kz
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={onCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 sm:py-6 rounded-xl text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all group mb-3 sm:mb-4"
                >
                  Finalizar Compra
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Guest checkout info */}
                <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 border border-green-200">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Shield className="size-4 sm:size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-green-700">
                        💡 <strong>Compra sem cadastro:</strong> Você pode finalizar seu pedido sem criar uma conta. Basta preencher seus dados na próxima etapa.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Info Message */}
                <p className="text-xs text-center text-gray-500 mb-4">
                  Você poderá aplicar cupons na próxima etapa
                </p>

                {/* Trust Badges - Desktop Only */}
                <div className="hidden lg:grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center size-10 rounded-lg bg-blue-100 text-blue-600 mb-2">
                      <Truck className="size-5" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Entrega Rápida</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center size-10 rounded-lg bg-green-100 text-green-600 mb-2">
                      <Shield className="size-5" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Seguro</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center size-10 rounded-lg bg-yellow-100 text-yellow-600 mb-2">
                      <Package className="size-5" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Garantia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
