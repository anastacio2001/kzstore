import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Eye, BarChart3, Activity } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface AnalyticsStats {
  total_sessions: number;
  total_users: number;
  total_events: number;
  sessions_with_product_view: number;
  sessions_with_cart: number;
  sessions_with_checkout: number;
  sessions_with_purchase: number;
  conversion_rate: number;
  total_revenue: number;
  avg_order_value: number;
}

interface ProductAnalytic {
  product_id: string;
  product_name: string;
  total_views: number;
  total_add_to_cart: number;
  total_purchases: number;
  total_revenue: number;
  conversion_rate: number;
}

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topProducts, setTopProducts] = useState<ProductAnalytic[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // dias

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Carregar estatísticas gerais
      const { data: statsData } = await supabase
        .rpc('get_analytics_stats', { days: parseInt(timeRange) });

      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Carregar top produtos
      const { data: productsData } = await supabase
        .from('product_analytics')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(10);

      setTopProducts(productsData || []);

      // Calcular funil
      if (statsData && statsData.length > 0) {
        const s = statsData[0];
        const funnel: FunnelStep[] = [
          { step: 'Visitantes', count: s.total_sessions, percentage: 100 },
          { 
            step: 'Visualizaram Produtos', 
            count: s.sessions_with_product_view,
            percentage: (s.sessions_with_product_view / s.total_sessions) * 100
          },
          { 
            step: 'Adicionaram ao Carrinho', 
            count: s.sessions_with_cart,
            percentage: (s.sessions_with_cart / s.total_sessions) * 100
          },
          { 
            step: 'Iniciaram Checkout', 
            count: s.sessions_with_checkout,
            percentage: (s.sessions_with_checkout / s.total_sessions) * 100
          },
          { 
            step: 'Compraram', 
            count: s.sessions_with_purchase,
            percentage: (s.sessions_with_purchase / s.total_sessions) * 100
          }
        ];
        setFunnelData(funnel);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando analytics...</div>;
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500">
        <BarChart3 size={64} className="mx-auto mb-4 text-gray-300" />
        <p>Nenhum dado disponível ainda</p>
        <p className="text-sm mt-2">Os dados de analytics começarão a aparecer quando houver atividade no site</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
          <p className="text-gray-600">Insights e métricas de comportamento</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="text-blue-600" />
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats.total_sessions.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Sessões Totais</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Eye size={24} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{stats.total_events.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Eventos Rastreados</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart size={24} className="text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{stats.sessions_with_purchase}</p>
          <p className="text-sm text-gray-600">Conversões</p>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats.conversion_rate.toFixed(2)}%</p>
          <p className="text-sm text-gray-600">Taxa de Conversão</p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-500">
          <p className="text-sm text-green-700 mb-1">Revenue Total</p>
          <p className="text-4xl font-bold text-green-800">
            {(stats.total_revenue || 0).toLocaleString('pt-AO')} Kz
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-500">
          <p className="text-sm text-blue-700 mb-1">Ticket Médio</p>
          <p className="text-4xl font-bold text-blue-800">
            {(stats.avg_order_value || 0).toLocaleString('pt-AO')} Kz
          </p>
        </div>
      </div>

      {/* Funil de Conversão */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity size={20} />
          Funil de Conversão
        </h3>
        <div className="space-y-3">
          {funnelData.map((step, index) => (
            <div key={step.step}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{step.step}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{step.count.toLocaleString()}</span>
                  <span className="text-sm font-bold text-purple-600">{step.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                  style={{ width: `${step.percentage}%` }}
                >
                  {step.percentage > 15 && (
                    <span className="text-white text-xs font-semibold">
                      {step.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              {index < funnelData.length - 1 && (
                <div className="text-xs text-red-600 mt-1 ml-2">
                  ↓ Drop-off: {((funnelData[index].count - funnelData[index + 1].count) / funnelData[index].count * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Produtos */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BarChart3 size={20} />
            Top 10 Produtos (por Revenue)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add Cart</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversão</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topProducts.map((product, index) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{product.product_name}</div>
                    <div className="text-xs text-gray-500">{product.product_id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye size={14} className="text-blue-600" />
                      {product.total_views}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <ShoppingCart size={14} className="text-orange-600" />
                      {product.total_add_to_cart}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{product.total_purchases}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.conversion_rate >= 5 ? 'bg-green-100 text-green-800' :
                      product.conversion_rate >= 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.conversion_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {product.total_revenue.toLocaleString('pt-AO')} Kz
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Insight: Taxa de Abandono</h4>
          <p className="text-sm text-blue-800">
            {funnelData[2] && funnelData[3] ? (
              <>
                {((funnelData[2].count - funnelData[3].count) / funnelData[2].count * 100).toFixed(1)}% dos usuários abandonam o carrinho antes do checkout. 
                Considere implementar email de carrinho abandonado.
              </>
            ) : 'Dados insuficientes'}
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <h4 className="font-semibold text-green-900 mb-2">📈 Oportunidade</h4>
          <p className="text-sm text-green-800">
            Produtos com alta visualização mas baixa conversão podem precisar de melhor descrição ou fotos.
          </p>
        </div>
      </div>
    </div>
  );
}
