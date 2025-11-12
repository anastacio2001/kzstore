import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Award, Package, Star, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase/client';
import { Product } from '../App';

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteCategory: string;
}

interface RecommendedProduct extends Product {
  reason: string;
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    favoriteCategory: ''
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      // Buscar pedidos do usuário
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${user?.id},customer_email.eq.${user?.email}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;

      setRecentOrders(orders || []);

      // Calcular estatísticas
      const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalOrders = orders?.length || 0;

      // Buscar pontos de fidelidade
      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user?.id)
        .single();

      // Calcular categoria favorita baseada nos pedidos
      const categoryCount: Record<string, number> = {};
      orders?.forEach(order => {
        order.items?.forEach((item: any) => {
          const cat = item.category || 'Outros';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });

      const favoriteCategory = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nenhuma';

      setStats({
        totalOrders,
        totalSpent,
        loyaltyPoints: loyalty?.points || 0,
        favoriteCategory
      });

      // Carregar produtos recomendados
      await loadRecommendations(favoriteCategory);

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (favoriteCategory: string) => {
    try {
      // Buscar produtos da categoria favorita
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', favoriteCategory)
        .gt('estoque', 0)
        .limit(4);

      if (products) {
        const recommended: RecommendedProduct[] = products.map(p => ({
          ...p,
          reason: `Baseado em suas compras de ${favoriteCategory}`
        }));
        setRecommended(recommended);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full size-12 border-4 border-[#E31E24] border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando seu painel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Olá, {user?.email?.split('@')[0]}!</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao seu painel personalizado</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="size-8" />
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">Total</div>
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-blue-100 text-sm mt-1">Pedidos realizados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="size-8" />
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">Gasto</div>
          </div>
          <p className="text-3xl font-bold">{stats.totalSpent.toLocaleString('pt-AO')} Kz</p>
          <p className="text-green-100 text-sm mt-1">Total investido</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Award className="size-8" />
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">Pontos</div>
          </div>
          <p className="text-3xl font-bold">{stats.loyaltyPoints}</p>
          <p className="text-yellow-100 text-sm mt-1">Pontos de fidelidade</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Star className="size-8" />
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">Favorito</div>
          </div>
          <p className="text-2xl font-bold line-clamp-1">{stats.favoriteCategory}</p>
          <p className="text-purple-100 text-sm mt-1">Categoria preferida</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pedidos Recentes */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="size-6 text-[#E31E24]" />
            <h2 className="text-xl font-bold">Pedidos Recentes</h2>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#E31E24]">
                      {order.order_number || order.id.slice(0, 8)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'entregue' ? 'bg-green-100 text-green-800' :
                      order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('pt-AO')}
                    </span>
                    <span className="font-bold">{order.total.toLocaleString('pt-AO')} Kz</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Produtos Recomendados */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="size-6 text-[#E31E24]" />
            <h2 className="text-xl font-bold">Recomendados para Você</h2>
          </div>

          <div className="space-y-4">
            {recommended.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Faça seu primeiro pedido para ver recomendações!</p>
            ) : (
              recommended.map(product => (
                <div key={product.id} className="flex items-center gap-4 border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer">
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="size-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{product.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.reason}</p>
                    <p className="font-bold text-[#E31E24] mt-1">
                      {product.preco_aoa.toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução (Placeholder) */}
      <div className="mt-8 bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-6">Suas Compras ao Longo do Tempo</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Gráfico em desenvolvimento - Em breve!</p>
        </div>
      </div>
    </div>
  );
}
