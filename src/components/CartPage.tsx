import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Package, Truck, Shield, Tag, Gift, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { useState } from 'react';
import { useFlashSales } from '../hooks/useFlashSales';

type CartPageProps = {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
};

export function CartPage({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onContinueShopping }: CartPageProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  
  const { flashSales } = useFlashSales();

  // Helper: calcula preço com desconto de flash sale
  const getItemPrice = (item: CartItem) => {
    const flashSale = flashSales.find(sale => 
      sale.product_id === item.product.id && sale.is_active
    );
    
    if (flashSale) {
      return item.product.preco_aoa * (1 - flashSale.discount_percentage / 100);
    }
    
    return item.product.preco_aoa;
  };

  const subtotal = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.product.peso_kg * item.quantity), 0);
  
  // Simulação de frete baseado no peso
  const shippingCost = totalWeight > 0 ? Math.max(5000, totalWeight * 2000) : 0;
  
  // Discount calculation
  const discount = appliedCoupon ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'kzstore10') {
      setAppliedCoupon(couponCode);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center size-32 rounded-full bg-gray-100 text-gray-400 mb-6">
            <ShoppingBag className="size-16" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Parece que você ainda não adicionou nenhum produto ao carrinho.
          </p>
          <Button
            onClick={onContinueShopping}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl text-lg font-semibold group"
          >
            Explorar Produtos
            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-blue-100 text-blue-600 mb-2">
                <Truck className="size-6" />
              </div>
              <p className="text-xs text-gray-600">Entrega Rápida</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-green-100 text-green-600 mb-2">
                <Shield className="size-6" />
              </div>
              <p className="text-xs text-gray-600">Compra Segura</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-yellow-100 text-yellow-600 mb-2">
                <Gift className="size-6" />
              </div>
              <p className="text-xs text-gray-600">Ofertas Especiais</p>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Carrinho de Compras
              </h1>
              <p className="text-gray-600">
                {cart.length} {cart.length === 1 ? 'produto' : 'produtos'} no carrinho
              </p>
            </div>
            <button
              onClick={onContinueShopping}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
            >
              <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Continuar Comprando</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-red-200 transition-all animate-slide-in-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden group">
                    <img
                      src={item.product.imagem_url}
                      alt={item.product.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.product.estoque < 10 && item.product.estoque > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 rounded-md bg-orange-500 text-white text-xs font-bold">
                          Últimas {item.product.estoque}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-semibold uppercase mb-2">
                          {item.product.categoria}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                          {item.product.nome}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {item.product.descricao}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Remover produto"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity > item.product.estoque && (
                      <div className="flex items-center gap-2 mb-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">
                          Apenas {item.product.estoque} unidades disponíveis em estoque
                        </p>
                      </div>
                    )}

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="px-4 py-2 font-bold min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.estoque}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">
                          {getItemPrice(item).toLocaleString('pt-AO')} AOA × {item.quantity}
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {(getItemPrice(item) * item.quantity).toLocaleString('pt-AO')} AOA
                        </p>
                        {getItemPrice(item) < item.product.preco_aoa && (
                          <p className="text-xs text-gray-400 line-through">
                            {(item.product.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Continue Shopping */}
            <button
              onClick={onContinueShopping}
              className="md:hidden w-full flex items-center justify-center gap-2 py-4 text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              <ArrowLeft className="size-5" />
              Continuar Comprando
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 animate-slide-in-right">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>

                <div className="space-y-4 mb-6">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {subtotal.toLocaleString('pt-AO')} AOA
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-gray-400" />
                      <span className="text-gray-600">Frete</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {shippingCost.toLocaleString('pt-AO')} AOA
                    </span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 text-green-600" />
                        <span className="text-green-600">Desconto</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        -{discount.toLocaleString('pt-AO')} AOA
                      </span>
                    </div>
                  )}

                  <div className="divider" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {total.toLocaleString('pt-AO')} AOA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coupon */}
                {!appliedCoupon && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cupom de Desconto
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Digite o código"
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        variant="outline"
                        className="px-4"
                      >
                        Aplicar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Experimente: <code className="px-2 py-1 bg-gray-100 rounded text-red-600 font-mono">KZSTORE10</code>
                    </p>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          Cupom aplicado: {appliedCoupon}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={onCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold group"
                >
                  Finalizar Compra
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Compre com Segurança</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Pagamento Seguro</p>
                      <p className="text-xs text-gray-600">SSL e criptografia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Truck className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Entrega Rápida</p>
                      <p className="text-xs text-gray-600">24-48h em Luanda</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Produtos Originais</p>
                      <p className="text-xs text-gray-600">100% autênticos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Truck className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1 text-sm">Frete Calculado</p>
                    <p className="text-xs text-blue-700">
                      Baseado em {totalWeight.toFixed(2)}kg de peso total
                    </p>
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
