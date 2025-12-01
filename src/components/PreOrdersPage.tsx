import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Package, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import PreOrderForm from './PreOrderForm';
import { FlashSaleBanner } from './FlashSaleBanner';
import { AdBanner } from './AdBanner';

interface PreOrdersPageProps {
  onBack: () => void;
  onViewProduct?: (productId: string) => void;
}

interface PreOrderProduct {
  id: string;
  nome: string;
  preco_aoa: number;
  imagem_url?: string;
  categoria: string;
  descricao?: string;
  estimated_arrival?: string;
  pre_order_info?: {
    estimated_arrival?: string;
    deposit_percentage?: number;
  };
}

export function PreOrdersPage({ onBack, onViewProduct }: PreOrdersPageProps) {
  const [products, setProducts] = useState<PreOrderProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreOrderProducts();
  }, []);

  const fetchPreOrderProducts = async () => {
    try {
      const response = await fetch('/api/products?pre_order=true');

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="container mx-auto px-4 py-4">
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
        </div>
      </div>

      {/* Flash Sale Banner */}
      <FlashSaleBanner 
        onViewProduct={onViewProduct}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Info Banner */}
            <Card className="p-6 mb-8 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Como funciona a Pré-venda?</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span>Pague apenas 30% de sinal para garantir seu produto</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span>Receba notificação quando o produto chegar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span>Pague os 70% restantes na retirada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31E24]"></div>
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {products.map((product) => {
                  const images = product.imagens ? 
                    (typeof product.imagens === 'string' ? JSON.parse(product.imagens) : product.imagens) 
                    : [];
                  const allImages = [
                    product.imagem_url,
                    ...(Array.isArray(images) ? images : [])
                  ].filter(Boolean);
                  
                  return (
                  <Card key={product.id} className="overflow-hidden">
                    {allImages.length > 0 && (
                      <div className="aspect-square bg-gray-100 relative overflow-x-auto">
                        <div className="flex h-full">
                          {allImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${product.nome} - imagem ${idx + 1}`}
                              className="flex-shrink-0 w-full h-full object-contain"
                            />
                          ))}
                        </div>
                        {allImages.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {allImages.length} fotos
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {product.categoria}
                        </Badge>
                        {product.pre_order_info?.estimated_arrival && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {product.pre_order_info.estimated_arrival}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.nome}</h3>
                      {product.descricao && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.descricao}
                        </p>
                      )}
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-[#E31E24]">
                          {product.preco_aoa.toLocaleString('pt-AO')} Kz
                        </p>
                        <p className="text-sm text-gray-600">
                          Sinal: {Math.round(product.preco_aoa * ((product.pre_order_info?.deposit_percentage || 30) / 100)).toLocaleString('pt-AO')} Kz ({product.pre_order_info?.deposit_percentage || 30}%)
                        </p>
                      </div>
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
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black w-full">
                            <Package className="h-4 w-4 mr-2" />
                            Fazer Pré-venda
                          </Button>
                        }
                      />
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum produto disponível</h3>
                <p className="text-gray-600 mb-6">
                  No momento não há produtos disponíveis para pré-venda.
                </p>
                <Button onClick={onBack}>Voltar à Loja</Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ads */}
            <AdBanner position="pre-vendas-sidebar" />

            {/* Additional Info Card */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <h3 className="font-bold text-lg mb-3 text-yellow-800">💡 Vantagens da Pré-venda</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">✓</span>
                  <span>Garanta produtos antes de esgotar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">✓</span>
                  <span>Pagamento facilitado em 2x</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">✓</span>
                  <span>Notificação de chegada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">✓</span>
                  <span>Prioridade na entrega</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
