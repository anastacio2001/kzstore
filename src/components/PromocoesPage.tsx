import { Tag, Percent, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../App';
import { useKZStore } from '../hooks/useKZStore';
import { FlashSaleBanner } from './FlashSaleBanner';

type PromocoesPageProps = {
  onViewProduct?: (product: Product) => void;
};

export function PromocoesPage({ onViewProduct }: PromocoesPageProps) {
  const { products } = useKZStore();

  // Produtos em promoção (simulação - você pode adicionar um campo "em_promocao" nos produtos)
  const promotions = [
    {
      id: '1',
      title: 'Black Friday KZSTORE',
      discount: '30%',
      description: 'Descontos de até 30% em toda linha de memórias RAM',
      endDate: '2024-11-30',
      badge: 'Limitado',
      color: 'bg-red-600'
    },
    {
      id: '2',
      title: 'Cyber Monday',
      discount: '25%',
      description: 'Mini PCs com 25% de desconto',
      endDate: '2024-12-05',
      badge: 'Popular',
      color: 'bg-blue-600'
    },
    {
      id: '3',
      title: 'Fim de Ano',
      discount: '20%',
      description: 'SSDs e Hard Disks com preços especiais',
      endDate: '2024-12-31',
      badge: 'Novo',
      color: 'bg-yellow-600'
    }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const calculateDaysLeft = (dateStr: string) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Flash Sale Banner */}
      <FlashSaleBanner 
        onViewProduct={(productId) => {
          const product = products.find(p => p.id === productId);
          if (product && onViewProduct) {
            onViewProduct(product);
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="size-8 text-[#E31E24]" />
            <h1 className="text-[#1a1a2e]">Promoções KZSTORE</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Aproveite nossas ofertas especiais em produtos de alta qualidade. 
            Preços imbatíveis em tecnologia para você e sua empresa!
          </p>
        </div>

        {/* Active Promotions */}
        <div className="mb-16">
          <h2 className="text-[#1a1a2e] mb-6 flex items-center gap-2">
            <Percent className="size-6 text-[#E31E24]" />
            Promoções Ativas
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              const daysLeft = calculateDaysLeft(promo.endDate);
              
              return (
                <div key={promo.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className={`${promo.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                          {promo.badge}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{promo.discount}</div>
                        <div className="text-sm opacity-90">OFF</div>
                      </div>
                    </div>
                    <h3 className="text-white mb-2">{promo.title}</h3>
                    <p className="text-white/90 text-sm">{promo.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Clock className="size-4" />
                      <span className="text-sm">
                        {daysLeft > 0 ? (
                          <>Termina em <span className="font-semibold text-[#E31E24]">{daysLeft} dias</span></>
                        ) : (
                          <span className="text-red-600 font-semibold">Promoção encerrada</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      Válido até {formatDate(promo.endDate)}
                    </div>
                    
                    <Button className="w-full bg-[#E31E24] hover:bg-[#c41a1f] text-white">
                      Ver Produtos
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How Promotions Work */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-[#1a1a2e] mb-6">Como Funcionam as Promoções?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] text-lg mb-1">Escolha seus produtos</h3>
                  <p className="text-gray-600">
                    Navegue pela nossa loja e selecione os produtos em promoção
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] text-lg mb-1">Desconto automático</h3>
                  <p className="text-gray-600">
                    O desconto é aplicado automaticamente no carrinho
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] text-lg mb-1">Finalize o pedido</h3>
                  <p className="text-gray-600">
                    Complete o checkout e escolha sua forma de pagamento
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] text-lg mb-1">Receba em casa</h3>
                  <p className="text-gray-600">
                    Entregamos em Luanda e todo Angola com segurança
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-[#1a1a2e] mb-3">⚠️ Termos e Condições</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Promoções válidas enquanto durarem os estoques</li>
            <li>• Descontos não cumulativos com outras promoções</li>
            <li>• Valores em Kwanzas Angolanos (AOA)</li>
            <li>• Consulte condições específicas de cada promoção</li>
            <li>• A KZSTORE reserva o direito de alterar ou encerrar promoções sem aviso prévio</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
