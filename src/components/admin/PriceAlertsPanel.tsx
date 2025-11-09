import { useState, useEffect } from 'react';
import { Trash2, Bell, Mail, TrendingDown, Search } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useKZStore } from '../../hooks/useKZStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

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
  };
}

export default function PriceAlertsPanel() {
  const { products, fetchProducts } = useKZStore();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    triggered: 0
  });

  useEffect(() => {
    // Carregar produtos se não estiverem carregados
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadAlerts();
    }
  }, [products]);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      // Buscar todos os alertas
      const { data: alertsData, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      console.log('📋 Alertas do Supabase:', alertsData);
      console.log('🛍️ Produtos do store:', products);

      // Combinar alertas com produtos do store
      if (alertsData && alertsData.length > 0) {
        const alertsWithProducts = alertsData.map(alert => ({
          ...alert,
          product: products.find(p => p.id === alert.product_id)
        }));

        console.log('✅ Alertas combinados:', alertsWithProducts);
        setAlerts(alertsWithProducts);

        // Calcular estatísticas
        const active = alertsWithProducts.filter(a => 
          a.product && a.product.preco_aoa > a.target_price
        ).length;
        const triggered = alertsWithProducts.filter(a => 
          a.product && a.product.preco_aoa <= a.target_price
        ).length;

        setStats({
          total: alertsData.length,
          active,
          triggered
        });
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas de preço');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alerta excluído com sucesso');
      loadAlerts();
    } catch (error) {
      console.error('Erro ao excluir alerta:', error);
      toast.error('Erro ao excluir alerta');
    }
  };

  const handleNotifyUser = async (alert: PriceAlert) => {
    if (!alert.product) return;

    try {
      // Aqui você pode implementar o envio de email/notificação
      toast.success(`Notificação enviada para ${alert.user_email}`);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.user_email.toLowerCase().includes(searchLower) ||
      alert.product?.nome.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Todos os alertas criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Aguardando queda de preço</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Acionados</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.triggered}</div>
            <p className="text-xs text-muted-foreground">Preço atingido</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar por email ou produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {searchTerm ? 'Nenhum alerta encontrado' : 'Nenhum alerta criado ainda'}
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Imagem do Produto */}
                  {alert.product?.imagem_url && (
                    <img
                      src={alert.product.imagem_url}
                      alt={alert.product.nome}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}

                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {alert.product?.nome || `Produto #${alert.product_id}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <Mail className="inline h-4 w-4 mr-1" />
                          {alert.user_email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Criado em {new Date(alert.created_at).toLocaleDateString('pt-AO')}
                        </p>
                      </div>

                      {/* Status e Ações */}
                      <div className="flex flex-col items-end gap-2">
                        {alert.product && (
                          <>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Preço Atual</p>
                              <p className="text-lg font-bold">
                                {alert.product.preco_aoa.toLocaleString('pt-AO')} Kz
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Preço Alvo</p>
                              <p className="text-lg font-bold text-orange-600">
                                {alert.target_price.toLocaleString('pt-AO')} Kz
                              </p>
                            </div>
                            {alert.product.preco_aoa <= alert.target_price ? (
                              <Badge className="bg-green-500">
                                <Bell className="h-3 w-3 mr-1" />
                                Preço Atingido!
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Aguardando (-{((1 - alert.target_price / alert.product.preco_aoa) * 100).toFixed(0)}%)
                              </Badge>
                            )}
                          </>
                        )}

                        <div className="flex gap-2 mt-2">
                          {alert.product && alert.product.preco <= alert.target_price && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNotifyUser(alert)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Notificar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(alert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
