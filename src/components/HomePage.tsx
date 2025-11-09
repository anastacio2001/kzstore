import { ArrowRight, Package, TrendingUp, Shield, Truck, CreditCard, Headphones, Star, Zap, Award } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import { Product } from '../App';
import { AdBanner } from './AdBanner';
import { FlashSaleBanner } from './FlashSaleBanner';

type HomePageProps = {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateToProducts: () => void;
  onCategorySelect: (category: string) => void;
  isInWishlist?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
};

export function HomePage({ 
  products = [], 
  onViewProduct, 
  onAddToCart, 
  onNavigateToProducts, 
  onCategorySelect,
  isInWishlist,
  onToggleWishlist
}: HomePageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Produtos Originais',
      description: 'Garantia de autenticidade em todos os produtos',
      color: 'red'
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: 'Envios para toda Angola em até 48h',
      color: 'yellow'
    },
    {
      icon: CreditCard,
      title: 'Pagamento Seguro',
      description: 'Multicaixa Express e transferência bancária',
      color: 'blue'
    },
    {
      icon: Headphones,
      title: 'Suporte 24/7',
      description: 'Atendimento via WhatsApp sempre disponível',
      color: 'red'
    }
  ];

  const categories = [
    {
      name: 'Memória RAM',
      icon: '💾',
      count: '150+',
      gradient: 'from-red-500 to-red-600'
    },
    {
      name: 'Hard Disks',
      icon: '💿',
      count: '200+',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    {
      name: 'Mini PCs',
      icon: '🖥️',
      count: '80+',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Câmeras Wi-Fi',
      icon: '📹',
      count: '120+',
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Redes e Internet',
      icon: '🌐',
      count: '300+',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Armazenamento',
      icon: '💽',
      count: '250+',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Software',
      icon: '📀',
      count: '50+',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Telemóveis',
      icon: '📱',
      count: '100+',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { value: '10k+', label: 'Produtos Vendidos', icon: Package },
    { value: '5k+', label: 'Clientes Satisfeitos', icon: Star },
    { value: '99%', label: 'Taxa de Satisfação', icon: Award },
    { value: '24/7', label: 'Suporte Disponível', icon: Zap }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Advertisement Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdBanner position="home-hero-banner" />
      </div>

      {/* Hero Section - Modern & Bold */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white animate-slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-sm font-medium mb-6 animate-pulse">
                <Zap className="size-4" />
                <span>Novidade: Novos produtos a cada semana</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Tecnologia de
                <span className="block mt-2 bg-gradient-to-r from-red-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
                  Ponta em Angola
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                A maior loja online de produtos eletrônicos especializados. 
                RAM para servidores, SSD, Mini PCs e muito mais com os melhores preços.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onNavigateToProducts}
                  className="group bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg font-semibold"
                >
                  Ver Produtos
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <a
                  href="https://wa.me/244931054015"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  Falar com Especialista
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-green-400" />
                  <span className="text-sm text-gray-300">Compra Segura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-blue-400" />
                  <span className="text-sm text-gray-300">Entrega Rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">5.0 Avaliação</span>
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative animate-slide-in-right">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"
                  alt="Produtos Tecnológicos"
                  className="rounded-2xl shadow-2xl hover-lift"
                />
                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-scale-in">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="size-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">10k+</p>
                      <p className="text-xs text-gray-600">Vendas em 2024</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 size-24 bg-yellow-400 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-6 -right-6 size-32 bg-blue-500 rounded-full blur-3xl opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slide-in-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-red-100 text-red-600 mb-3">
                  <stat.icon className="size-6" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore por Categoria
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Produtos técnicos especializados para profissionais e empresas
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => onCategorySelect(category.name)}
                className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover-lift"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 font-medium">{category.count} produtos</p>
                </div>

                <ArrowRight className="absolute bottom-6 right-6 size-5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Flash Sales Banner */}
            <FlashSaleBanner 
              products={products}
              onProductClick={(productId) => {
                const product = products.find(p => p.id === productId);
                if (product) onViewProduct(product);
              }}
            />

            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Produtos em Destaque
                </h2>
                <p className="text-lg text-gray-600">
                  Os produtos mais procurados do momento
                </p>
              </div>
              <Button
                onClick={onNavigateToProducts}
                variant="outline"
                className="hidden sm:flex"
              >
                Ver Todos
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={onViewProduct}
                    onAddToCart={onAddToCart}
                    isInWishlist={isInWishlist?.(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Por que escolher a KZSTORE?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Compromisso com qualidade, segurança e satisfação do cliente
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center animate-slide-in-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center size-16 rounded-2xl ${
                  feature.color === 'red' ? 'bg-red-500/20 text-red-400' :
                  feature.color === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                } mb-4`}>
                  <feature.icon className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Explore nosso catálogo completo de produtos tecnológicos com os melhores preços de Angola
          </p>
          <Button
            onClick={onNavigateToProducts}
            className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg font-semibold"
          >
            Explorar Catálogo
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}