import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, CheckCircle, Minus, Plus, Star, MessageCircle, Package, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../App';
import { AdBanner } from './AdBanner';
import { ProductReviews } from './ProductReviews';
import { PriceAlertButton } from './PriceAlertButton';
import { formatKz } from '../utils/formatCurrency';

type ProductDetailPageProps = {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
  userEmail?: string;
  userName?: string;
  accessToken?: string;
};

export function ProductDetailPage({ product, onAddToCart, onBack, userEmail, userName, accessToken }: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Safety check - if product is not loaded, show loading or error
  if (!product || !product.preco_aoa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
          <button 
            onClick={onBack}
            className="mt-4 text-[#E31E24] hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product.estoque, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nome,
          text: product.descricao,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  // Usar array de imagens do produto ou fallback para a imagem principal
  const images = product.imagens && product.imagens.length > 0 
    ? product.imagens 
    : [product.imagem_url];

  const discountPercentage = 15; // Simulated discount
  const originalPrice = Math.floor(product.preco_aoa * 1.15);

  const features = [
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Entrega em 24-48h para Luanda',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Garantia 12 Meses',
      description: 'Garantia oficial do fabricante',
      color: 'green'
    },
    {
      icon: RefreshCw,
      title: 'Troca Grátis',
      description: 'Até 7 dias após recebimento',
      color: 'yellow'
    },
    {
      icon: CheckCircle,
      title: 'Produto Original',
      description: '100% autêntico e certificado',
      color: 'red'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - Mobile Optimized */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-red-600 transition-colors group"
          >
            <ArrowLeft className="size-4 sm:size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
          {/* Left Column - Images - Mobile Optimized */}
          <div className="space-y-2 sm:space-y-4 animate-slide-in-left">
            {/* Main Image - Reduced Height on Mobile */}
            <div className="relative aspect-square sm:aspect-square bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 sm:border-2 group">
              <img
                src={images[selectedImage]}
                alt={product.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badges - Compact on Mobile */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
                {product.estoque < 10 && product.estoque > 0 && (
                  <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg">
                    Últimas {product.estoque}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-red-600 text-white text-xs sm:text-sm font-bold shadow-lg">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Quick Actions - Smaller on Mobile */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`size-9 sm:size-12 rounded-lg sm:rounded-xl ${
                    isLiked ? 'bg-red-600 text-white' : 'bg-white text-gray-600'
                  } shadow-lg hover:scale-110 transition-all flex items-center justify-center`}
                >
                  <Heart className={`size-4 sm:size-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="size-9 sm:size-12 rounded-lg sm:rounded-xl bg-white text-gray-600 shadow-lg hover:scale-110 transition-all flex items-center justify-center hover:bg-red-600 hover:text-white"
                >
                  <Share2 className="size-4 sm:size-5" />
                </button>
              </div>

              {/* Out of Stock Overlay */}
              {product.estoque === 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center px-4">
                    <Package className="size-12 sm:size-16 text-white mx-auto mb-2 sm:mb-4" />
                    <p className="text-white font-bold text-lg sm:text-2xl mb-1 sm:mb-2">Esgotado</p>
                    <p className="text-gray-300 text-xs sm:text-base">Entre em contato</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Compact on Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border transition-all ${
                    selectedImage === index
                      ? 'border-red-600 ring-1 sm:ring-2 ring-red-200'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.nome} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-6 animate-slide-in-right">
            {/* Category Badge - Compact */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-block px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-md sm:rounded-lg bg-red-50 text-red-700 text-xs sm:text-sm font-semibold uppercase tracking-wide">
                {product.categoria}
              </span>
              {product.condicao && (
                <span className={`inline-block px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wide ${
                  product.condicao === 'Novo' ? 'bg-green-50 text-green-700' :
                  product.condicao === 'Usado' ? 'bg-orange-50 text-orange-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {product.condicao}
                </span>
              )}
            </div>

            {/* Title - Smaller on Mobile */}
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                {product.nome}
              </h1>
              
              {/* Rating - Compact */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-base">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="size-3.5 sm:size-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">5.0 (248 avaliações)</span>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <span className="text-gray-600">1.2k vendidos</span>
              </div>
            </div>

            {/* Price - Compact on Mobile */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 sm:border-2">
              <div className="flex items-baseline gap-2 sm:gap-3 mb-1 sm:mb-2">
                <span className="text-2xl sm:text-4xl font-bold text-red-600">
                  {formatKz(product.preco_aoa)}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-sm sm:text-xl text-gray-400 line-through">
                    {formatKz(originalPrice)}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Economize</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {formatKz(originalPrice - product.preco_aoa)}
                  </p>
                </div>
              )}
            </div>

            {/* Stock Status - Compact */}
            <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base ${
              product.estoque > 10
                ? 'bg-green-50 text-green-700'
                : product.estoque > 0
                ? 'bg-orange-50 text-orange-700'
                : 'bg-red-50 text-red-700'
            }`}>
              <Package className="size-4 sm:size-5 flex-shrink-0" />
              <span className="font-semibold">
                {product.estoque > 10
                  ? `${product.estoque} em estoque`
                  : product.estoque > 0
                  ? `Apenas ${product.estoque} restantes`
                  : 'Esgotado'}
              </span>
            </div>

            {/* Quantity Selector - Compact */}
            {product.estoque > 0 && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Quantidade
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center bg-white border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="size-4 sm:size-5" />
                    </button>
                    <span className="px-4 py-2 sm:px-6 sm:py-3 font-bold text-base sm:text-lg min-w-[50px] sm:min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.estoque}
                      className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="size-4 sm:size-5" />
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Máx: {product.estoque}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons - Compact */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {product.estoque > 0 ? (
                <>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:px-8 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-lg font-semibold group"
                  >
                    <ShoppingCart className="mr-2 size-4 sm:size-5 group-hover:scale-110 transition-transform" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    variant="outline"
                    className="px-6 py-3 sm:px-8 sm:py-6 rounded-lg sm:rounded-xl border-2 text-sm sm:text-lg font-semibold hover:bg-gray-50"
                    onClick={() => {
                      handleAddToCart();
                      // Navigate to checkout
                    }}
                  >
                    Comprar Agora
                  </Button>
                </>
              ) : (
                <a
                  href={`https://wa.me/244931054015?text=${encodeURIComponent(`Olá! Gostaria de encomendar o produto:\n\n*${product.name}*\n\nPor favor, me informe sobre disponibilidade e formas de pagamento.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="size-5" />
                  Encomendar via WhatsApp
                </a>
              )}
            </div>

            {/* Price Alert Button */}
            <PriceAlertButton
              product={product}
              userEmail={userEmail}
              userName={userName}
              accessToken={accessToken}
            />

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-red-200 transition-all"
                >
                  <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    feature.color === 'green' ? 'bg-green-100 text-green-600' :
                    feature.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <feature.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Time */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Entrega Estimada</p>
                  <p className="text-sm text-blue-700">
                    Receba em <span className="font-bold">24-48 horas</span> em Luanda
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specs */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do Produto</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.descricao}
              </p>
            </div>

            {/* Specifications */}
            {product.especificacoes && Object.keys(product.especificacoes).length > 0 && (
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificações Técnicas</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.especificacoes).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <CheckCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">{key}</p>
                        <p className="text-gray-600">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-primary text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Dúvidas sobre o produto?</h3>
              <p className="text-white/90 mb-6">
                Nossa equipe está pronta para ajudar você com qualquer dúvida.
              </p>
              <a
                href={`https://wa.me/244931054015?text=${encodeURIComponent(`Olá! Tenho dúvidas sobre o produto:\\n\\n*${product.name}*\\n\\nPoderia me ajudar?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-red-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <MessageCircle className="size-5" />
                Falar no WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Compre com Confiança</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <span className="text-sm text-gray-700">100% Original</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <span className="text-sm text-gray-700">Garantia do Fabricante</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <span className="text-sm text-gray-700">Troca Grátis 7 Dias</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-green-600" />
                  <span className="text-sm text-gray-700">Pagamento Seguro</span>
                </div>
              </div>
            </div>

            {/* Ad Banner */}
            <AdBanner position="product-sidebar" />
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews
            productId={product.id}
            userEmail={userEmail}
            userName={userName}
            accessToken={accessToken}
          />
        </div>

        {/* Produtos Relacionados / Também Foram Vistos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Também foram vistos</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {products
                .filter(p => 
                  p.id !== product.id && 
                  (p.categoria === product.categoria || p.marca === product.marca)
                )
                .slice(0, 8)
                .map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    onClick={() => onViewProduct(relatedProduct.id)}
                    className="flex-shrink-0 w-48 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <img
                      src={relatedProduct.imagem}
                      alt={relatedProduct.nome}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                        {relatedProduct.nome}
                      </p>
                      <p className="text-lg font-bold text-[#E31E24]">
                        AOA {relatedProduct.preco.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}