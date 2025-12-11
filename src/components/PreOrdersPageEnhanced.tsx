import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, Package, AlertCircle, Clock, TrendingUp, Share2, Heart, ChevronLeft, ChevronRight, Filter, X, ChevronDown, ChevronUp, Truck, CheckCircle2, Box } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import PreOrderForm from './PreOrderForm';
import { FlashSaleBanner } from './FlashSaleBanner';
import { AdBanner } from './AdBanner';
import { ShareButton } from './ShareButton';

interface PreOrdersPageProps {
  onBack: () => void;
  onViewProduct?: (productId: string) => void;
  onNavigateToProduct?: (product: any) => void;
}

interface PreOrderProduct {
  id: string;
  nome: string;
  preco_aoa: number;
  preco_original?: number;
  imagem_url?: string;
  imagens?: string | string[];
  categoria: string;
  descricao?: string;
  estimated_arrival?: string;
  pre_order_info?: {
    estimated_arrival?: string;
    deposit_percentage?: number;
    reserved_count?: number;
    max_reservations?: number;
    status?: 'in_transit' | 'arriving_soon' | 'last_units' | 'exclusive';
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function PreOrdersPageEnhanced({ onBack, onViewProduct, onNavigateToProduct }: PreOrdersPageProps) {
  const [products, setProducts] = useState<PreOrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('arrival');
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPreOrderProducts();
  }, []);

  const fetchPreOrderProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://kzstore-backend.fly.dev/api/products?pre_order=true&limit=100');

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Countdown Timer
  const calculateTimeLeft = (arrivalDate: string): TimeLeft => {
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diff = arrival.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  // Get all images for a product
  const getProductImages = (product: PreOrderProduct): string[] => {
    const images: string[] = [];
    
    if (product.imagem_url) {
      images.push(product.imagem_url);
    }
    
    if (product.imagens) {
      const additionalImages = typeof product.imagens === 'string' 
        ? JSON.parse(product.imagens) 
        : product.imagens;
      
      if (Array.isArray(additionalImages)) {
        images.push(...additionalImages);
      }
    }
    
    return images.filter(Boolean);
  };

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered = [...filtered].sort((a, b) => a.preco_aoa - b.preco_aoa);
        break;
      case 'price_desc':
        filtered = [...filtered].sort((a, b) => b.preco_aoa - a.preco_aoa);
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => 
          (b.pre_order_info?.reserved_count || 0) - (a.pre_order_info?.reserved_count || 0)
        );
        break;
      case 'arrival':
      default:
        // Already sorted by creation date from backend
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  // Status configurations
  const statusConfig = {
    in_transit: { label: 'Em Trânsito', icon: '🚢', color: 'bg-blue-500' },
    arriving_soon: { label: 'Chegando em Breve', icon: '✈️', color: 'bg-green-500' },
    last_units: { label: 'Últimas Unidades', icon: '🔥', color: 'bg-red-500' },
    exclusive: { label: 'Exclusivo', icon: '⭐', color: 'bg-purple-500' },
  };

  // FAQ Data
  const faqs = [
    {
      question: 'Como funciona a pré-venda?',
      answer: 'Você paga apenas 30% do valor total como sinal para reservar o produto. Quando o produto chegar, você será notificado e poderá pagar os 70% restantes na retirada.'
    },
    {
      question: 'Posso cancelar minha pré-venda?',
      answer: 'Sim! Você pode cancelar sua pré-venda até 48 horas antes da chegada estimada do produto. O valor do sinal será totalmente reembolsado.'
    },
    {
      question: 'Como serei notificado quando o produto chegar?',
      answer: 'Enviaremos notificações por email, SMS e WhatsApp assim que o produto estiver disponível para retirada em nossa loja.'
    },
    {
      question: 'O que acontece se o produto não chegar na data estimada?',
      answer: 'Caso haja atrasos, você será informado imediatamente. Você pode escolher entre aguardar a nova data ou cancelar com reembolso total.'
    },
    {
      question: 'Posso alterar o produto reservado?',
      answer: 'Sim, é possível alterar para outro produto de pré-venda até 3 dias antes da chegada estimada. Entre em contato com nosso suporte.'
    },
    {
      question: 'Há garantia nos produtos de pré-venda?',
      answer: 'Sim! Todos os produtos têm a mesma garantia dos produtos regulares, conforme especificado na descrição de cada item.'
    }
  ];

  // Image navigation
  const handlePrevImage = (productId: string, maxIndex: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + maxIndex) % maxIndex
    }));
  };

  const handleNextImage = (productId: string, maxIndex: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % maxIndex
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="size-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#E31E24]">Pré-vendas</h1>
                <p className="text-sm text-gray-600">Reserve produtos pagando apenas 30% de sinal</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFAQ(!showFAQ)}
            >
              <AlertCircle className="size-4 mr-2" />
              Perguntas Frequentes
            </Button>
          </div>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <FlashSaleBanner onViewProduct={onViewProduct} />

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowFAQ(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="size-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="size-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gray-600" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrival">Chegada Mais Próxima</SelectItem>
                  <SelectItem value="popular">Mais Popular</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="ml-auto">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </Badge>
            </div>

            {/* Info Banner */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Como funciona a Pré-venda?</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        1
                      </div>
                      <span className="text-gray-700">Pague apenas 30% de sinal para garantir seu produto</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        2
                      </div>
                      <span className="text-gray-700">Receba notificação quando o produto chegar</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        3
                      </div>
                      <span className="text-gray-700">Pague os 70% restantes na retirada</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31E24]"></div>
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => {
                  const images = getProductImages(product);
                  const currentIndex = currentImageIndex[product.id] || 0;
                  const status = product.pre_order_info?.status;
                  const depositAmount = Math.round(product.preco_aoa * ((product.pre_order_info?.deposit_percentage || 30) / 100));
                  const remainingAmount = product.preco_aoa - depositAmount;
                  const reservedCount = product.pre_order_info?.reserved_count || 0;
                  const maxReservations = product.pre_order_info?.max_reservations || 100;
                  const reservationPercent = (reservedCount / maxReservations) * 100;

                  // Calculate savings if original price exists
                  const savings = product.preco_original 
                    ? product.preco_original - product.preco_aoa
                    : 0;
                  const savingsPercent = product.preco_original
                    ? Math.round((savings / product.preco_original) * 100)
                    : 0;

                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Status Badge */}
                      {status && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className={`${statusConfig[status].color} text-white`}>
                            <span className="mr-1">{statusConfig[status].icon}</span>
                            {statusConfig[status].label}
                          </Badge>
                        </div>
                      )}

                      {/* Image Carousel */}
                      {images.length > 0 && (
                        <div className="relative aspect-square bg-gray-100 group">
                          <img
                            src={images[currentIndex]}
                            alt={`${product.nome} - imagem ${currentIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                          
                          {/* Navigation Buttons */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={() => handlePrevImage(product.id, images.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeft className="size-5" />
                              </button>
                              <button
                                onClick={() => handleNextImage(product.id, images.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRight className="size-5" />
                              </button>
                              
                              {/* Dots Indicator */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        {/* Category & Arrival Date */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">{product.categoria}</Badge>
                          {product.pre_order_info?.estimated_arrival && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(product.pre_order_info.estimated_arrival).toLocaleDateString('pt-PT')}
                            </Badge>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">{product.nome}</h3>

                        {/* Description */}
                        {product.descricao && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        {/* Timeline */}
                        {product.pre_order_info?.estimated_arrival && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-blue-900">Linha do Tempo</span>
                              <CountdownTimer arrivalDate={product.pre_order_info.estimated_arrival} />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 flex-1">
                                <CheckCircle2 className="size-4 text-green-600" />
                                <span className="text-xs text-gray-600">Encomenda</span>
                              </div>
                              <div className="flex items-center gap-1 flex-1">
                                <Truck className="size-4 text-blue-600" />
                                <span className="text-xs text-gray-600">Trânsito</span>
                              </div>
                              <div className="flex items-center gap-1 flex-1">
                                <Box className="size-4 text-orange-600" />
                                <span className="text-xs text-gray-600">Chegada</span>
                              </div>
                            </div>
                            <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
                            </div>
                          </div>
                        )}

                        {/* Progress Bar */}
                        {reservedCount > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">
                                <TrendingUp className="inline size-3 mr-1" />
                                {reservedCount} pessoas já reservaram
                              </span>
                              <span className="text-gray-500">{Math.round(reservationPercent)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                style={{ width: `${Math.min(reservationPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Price Comparison */}
                        <div className="mb-4">
                          {product.preco_original && savings > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 line-through">
                                {product.preco_original.toLocaleString('pt-AO')} Kz
                              </span>
                              <Badge className="bg-green-500 text-white">
                                -{savingsPercent}%
                              </Badge>
                            </div>
                          )}
                          <p className="text-2xl font-bold text-[#E31E24] mb-1">
                            {product.preco_aoa.toLocaleString('pt-AO')} Kz
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="text-gray-600 block">Sinal (30%)</span>
                              <span className="font-semibold">{depositAmount.toLocaleString('pt-AO')} Kz</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600 block">Na retirada (70%)</span>
                              <span className="font-semibold">{remainingAmount.toLocaleString('pt-AO')} Kz</span>
                            </div>
                          </div>
                          {savings > 0 && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              💰 Você economiza {savings.toLocaleString('pt-AO')} Kz comprando na pré-venda!
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <PreOrderForm
                            product={{
                              id: product.id,
                              name: product.nome,
                              price: product.preco_aoa,
                              image: product.imagem_url,
                              estimated_arrival: product.pre_order_info?.estimated_arrival || 'A confirmar',
                              deposit_percentage: product.pre_order_info?.deposit_percentage,
                            }}
                            trigger={
                              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex-1">
                                <Package className="h-4 w-4 mr-2" />
                                Fazer Pré-venda
                              </Button>
                            }
                          />
                          <ShareButton
                            title={product.nome}
                            text={`Confira ${product.nome} em pré-venda na KZSTORE!`}
                            url={`https://kzstore.ao/produto/${product.id}`}
                            productId={product.id}
                            className="flex-shrink-0"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory !== 'all' 
                    ? 'Tente alterar os filtros ou escolher outra categoria.'
                    : 'No momento não há produtos disponíveis para pré-venda.'}
                </p>
                {selectedCategory !== 'all' ? (
                  <Button onClick={() => setSelectedCategory('all')}>Ver Todos</Button>
                ) : (
                  <Button onClick={onBack}>Voltar à Loja</Button>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ads */}
            <AdBanner position="pre-vendas-sidebar" onNavigateToProduct={onNavigateToProduct} />

            {/* Additional Info Card */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <h3 className="font-bold text-lg mb-3 text-yellow-800">💡 Vantagens da Pré-venda</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold text-lg">✓</span>
                  <span><strong>Garanta antes de esgotar:</strong> Produtos exclusivos reservados para você</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold text-lg">✓</span>
                  <span><strong>Pagamento facilitado:</strong> Apenas 30% de entrada, 70% na retirada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold text-lg">✓</span>
                  <span><strong>Notificação imediata:</strong> Email, SMS e WhatsApp quando chegar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold text-lg">✓</span>
                  <span><strong>Prioridade absoluta:</strong> Primeira fila na entrega</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold text-lg">✓</span>
                  <span><strong>Economize dinheiro:</strong> Preços especiais de lançamento</span>
                </li>
              </ul>
            </Card>

            {/* Quick FAQ */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <AlertCircle className="size-5 text-blue-600" />
                Tem Dúvidas?
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Confira nossas perguntas frequentes ou entre em contato!
              </p>
              <Button 
                onClick={() => setShowFAQ(true)}
                variant="outline"
                className="w-full"
              >
                Ver Perguntas Frequentes
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({ arrivalDate }: { arrivalDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const arrival = new Date(arrivalDate);
      const now = new Date();
      const diff = arrival.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [arrivalDate]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <Badge className="bg-green-500 text-white">
        <Clock className="size-3 mr-1" />
        Chegou!
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-blue-600 border-blue-600">
      <Clock className="size-3 mr-1" />
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours}h {timeLeft.minutes}m
    </Badge>
  );
}
