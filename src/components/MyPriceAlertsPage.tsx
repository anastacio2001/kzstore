import { useState, useEffect } from 'react';
import { Bell, Trash2, TrendingDown, Package, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useKZStore } from '../hooks/useKZStore';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { SEO } from './SEO';

interface PriceAlert {
  id: string;
  user_email: string;
  product_id: string;
  target_price: number;
  created_at: string;
  product?: {
    id: string;
    nome: string;
    preco_aoa: number;
    imagem_url: string;
    estoque: number;
  };
}

type MyPriceAlertsPageProps = {
  onNavigate: (page: 'home' | 'products' | 'product' | 'login', productId?: string) => void;
};

export default function MyPriceAlertsPage({ onNavigate }: MyPriceAlertsPageProps) {
  const { user } = useAuth();
  const { products, fetchProducts } = useKZStore();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar produtos se não estiverem carregados
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    if (user?.email && products.length > 0) {
      loadAlerts();
    }
  }, [user, products]);

  const loadAlerts = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);

      // Buscar alertas do usuário
      const { data: alertsData, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      console.log('📋 Alertas do Supabase:', alertsData);
      console.log('🛍️ Produtos do store:', products);

      // Combinar alertas com produtos do store local
      if (alertsData && alertsData.length > 0) {
        const alertsWithProducts = alertsData.map(alert => ({
          ...alert,
          product: products.find(p => p.id === alert.product_id)
        }));

        console.log('✅ Alertas combinados:', alertsWithProducts);
        setAlerts(alertsWithProducts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar seus alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja remover este alerta?')) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alerta removido com sucesso');
      loadAlerts();
    } catch (error) {
      console.error('Erro ao remover alerta:', error);
      toast.error('Erro ao remover alerta');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <SEO 
          title="Meus Alertas de Preço"
          description="Gerencie seus alertas de preço na KZSTORE"
        />
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Faça login para ver seus alertas</h2>
              <p className="text-gray-600 mb-6">
                Você precisa estar logado para gerenciar seus alertas de preço
              </p>
              <Button onClick={() => onNavigate('login')}>Fazer Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <SEO 
          title="Meus Alertas de Preço"
          description="Gerencie seus alertas de preço na KZSTORE"
        />
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO 
        title="Meus Alertas de Preço"
        description="Gerencie seus alertas de preço na KZSTORE"
      />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => onNavigate('home')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a loja
          </button>
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">Meus Alertas de Preço</h1>
              <p className="text-gray-600">
                {alerts.length === 0 
                  ? 'Você não tem alertas ativos' 
                  : `${alerts.length} ${alerts.length === 1 ? 'alerta ativo' : 'alertas ativos'}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum alerta criado</h2>
              <p className="text-gray-600 mb-6">
                Crie alertas de preço nos produtos que você deseja e receba notificações quando o preço baixar!
              </p>
              <Button onClick={() => onNavigate('products')}>
                <Package className="h-4 w-4 mr-2" />
                Ver Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Alerts List */
          <div className="space-y-4">
            {alerts.map((alert) => {
              if (!alert.product) return null;

              const priceReached = alert.product.preco_aoa <= alert.target_price;
              const discount = ((1 - alert.target_price / alert.product.preco_aoa) * 100).toFixed(0);

              return (
                <Card key={alert.id} className={priceReached ? 'border-green-500 border-2' : ''}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <button 
                        onClick={() => onNavigate('product', alert.product!.id.toString())}
                        className="flex-shrink-0"
                      >
                        <img
                          src={alert.product.imagem_url}
                          alt={alert.product.nome}
                          className="w-32 h-32 object-cover rounded-lg hover:opacity-75 transition"
                        />
                      </button>

                      {/* Product Info */}
                      <div className="flex-1">
                        <button 
                          onClick={() => onNavigate('product', alert.product!.id.toString())}
                          className="text-xl font-semibold hover:text-orange-600 transition text-left"
                        >
                          {alert.product.nome}
                        </button>

                        <div className="mt-3 space-y-2">
                          {/* Current Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">Preço Atual:</span>
                            <span className="text-2xl font-bold">
                              {alert.product.preco_aoa.toLocaleString('pt-AO')} Kz
                            </span>
                          </div>

                          {/* Target Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">Preço Alvo:</span>
                            <span className="text-xl font-bold text-orange-600">
                              {alert.target_price.toLocaleString('pt-AO')} Kz
                            </span>
                          </div>

                          {/* Status Badge */}
                          {priceReached ? (
                            <Badge className="bg-green-500">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Preço Atingido! 🎉
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Aguardando queda de {discount}%
                            </Badge>
                          )}

                          {/* Stock Info */}
                          {alert.product.estoque > 0 ? (
                            <p className="text-sm text-green-600">✓ Em estoque ({alert.product.estoque} unidades)</p>
                          ) : (
                            <p className="text-sm text-red-600">✗ Fora de estoque</p>
                          )}

                          {/* Created Date */}
                          <p className="text-xs text-gray-500">
                            Criado em {new Date(alert.created_at).toLocaleDateString('pt-AO', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {priceReached && alert.product.estoque > 0 && (
                          <Button onClick={() => onNavigate('product', alert.product!.id.toString())}>
                            Ver Produto
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Como funcionam os alertas de preço?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Você será notificado quando o preço do produto atingir ou ficar abaixo do seu preço alvo</li>
              <li>• Pode criar alertas em qualquer produto disponível na loja</li>
              <li>• Os alertas ficam ativos até você removê-los</li>
              <li>• Você pode ter múltiplos alertas ativos ao mesmo tempo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
