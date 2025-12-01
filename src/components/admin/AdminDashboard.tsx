import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign, Wrench } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockAlerts } from './StockAlerts';
import { useState } from 'react';

type AdminDashboardProps = {
  products: any[];
  orders: any[];
  customers: any[];
};

export function AdminDashboard({ products, orders, customers }: AdminDashboardProps) {
  const [fixingShipping, setFixingShipping] = useState(false);
  
  const handleFixShipping = async () => {
    if (!confirm('Deseja atualizar o shipping de todos os produtos para frete grátis (quando não definido)?')) {
      return;
    }
    
    setFixingShipping(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/fix-shipping', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      
      const result = await response.json();
      alert(`✅ ${result.updated} produtos atualizados!\n\n🎁 Frete grátis: ${result.stats.free}\n💰 Frete pago: ${result.stats.paid}`);
      
      // Recarregar página
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Erro:', error);
      alert('❌ Erro ao atualizar produtos: ' + error.message);
    } finally {
      setFixingShipping(false);
    }
  };
  // Calcular estatísticas
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pendente').length;
  const lowStockProducts = products.filter(p => p.estoque < 10).length;
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Dados REAIS para gráfico de vendas por categoria (baseado em pedidos reais)
  const salesByCategory = orders.reduce((acc: any, order) => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      
      items.forEach((item: any) => {
        const category = item.product?.categoria || item.categoria || 'Outros';
        if (!acc[category]) {
          acc[category] = { name: category, value: 0 };
        }
        // Valor real vendido = quantidade × preço
        const itemValue = (item.quantity || 1) * (item.price || item.product?.preco_aoa || 0);
        acc[category].value += itemValue;
      });
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
    }
    return acc;
  }, {});
  
  const categoryData = Object.values(salesByCategory);

  // Dados para gráfico de pedidos por status
  const ordersByStatus = [
    { name: 'Pendente', value: orders.filter(o => o.status === 'Pendente').length },
    { name: 'Pago', value: orders.filter(o => o.status === 'Pago').length },
    { name: 'Entregue', value: orders.filter(o => o.status === 'Entregue').length },
  ];

  // Dados REAIS para gráfico de vendas ao longo do tempo (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateString = date.toISOString().split('T')[0];
    
    // Filtrar pedidos do dia
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate === dateString;
    });
    
    // Calcular total de vendas do dia
    const totalVendas = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
      name: date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }),
      vendas: totalVendas
    };
  });

  const COLORS = ['#E31E24', '#FDD835', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];

  return (
    <div className="space-y-8">
      {/* Fix Shipping Button */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex items-start gap-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Wrench className="size-5 text-yellow-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">Corrigir Shipping de Produtos</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Atualiza produtos antigos sem shipping_type definido para terem frete grátis (shipping_cost = 0).
          </p>
          <button
            onClick={handleFixShipping}
            disabled={fixingShipping}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fixingShipping ? 'Atualizando...' : '🔧 Corrigir Shipping Agora'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <DollarSign className="size-6 text-[#E31E24]" />
            </div>
            <span className="text-xs text-green-600">+12.5%</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Receita Total</p>
          <p className="text-[#E31E24]">{totalRevenue.toLocaleString('pt-AO')} AOA</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ShoppingCart className="size-6 text-[#FDD835]" />
            </div>
            <span className="text-xs text-orange-600">{pendingOrders} pendentes</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total de Pedidos</p>
          <p className="text-[#E31E24]">{orders.length}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <span className="text-xs text-orange-600">{lowStockProducts} baixo estoque</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Produtos Ativos</p>
          <p className="text-[#E31E24]">{products.length}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="size-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600">+{customers.length}</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Clientes</p>
          <p className="text-[#E31E24]">{customers.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {lowStockProducts > 0 && (
        <StockAlerts />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas ao longo do tempo */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Vendas dos Últimos 7 Dias</h3>
            <TrendingUp className="size-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `${parseInt(value).toLocaleString('pt-AO')} AOA`}
              />
              <Line type="monotone" dataKey="vendas" stroke="#E31E24" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por status */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="mb-6">Status dos Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Valor em estoque por categoria */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="mb-6">Valor em Estoque por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => `${parseInt(value).toLocaleString('pt-AO')} AOA`}
            />
            <Bar dataKey="value" fill="#E31E24" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Produtos com Baixo Estoque */}
      {lowStockProducts > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="mb-4">Produtos com Estoque Baixo</h3>
          <div className="space-y-3">
            {products
              .filter(p => p.estoque < 10)
              .sort((a, b) => a.estoque - b.estoque)
              .slice(0, 5)
              .map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="size-12 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm line-clamp-1">{product.nome}</p>
                      <span className="text-xs text-gray-600">{product.categoria}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600">
                      {product.estoque} unidades
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}