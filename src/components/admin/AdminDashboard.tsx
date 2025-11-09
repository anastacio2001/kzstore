import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SampleDataCreator } from './SampleDataCreator';
import { StockAlerts } from './StockAlerts';

type AdminDashboardProps = {
  products: any[];
  orders: any[];
  customers: any[];
};

export function AdminDashboard({ products, orders, customers }: AdminDashboardProps) {
  // Calcular estatísticas
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pendente').length;
  const lowStockProducts = products.filter(p => p.estoque < 10).length;
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Dados para gráfico de vendas por categoria
  const salesByCategory = products.reduce((acc: any, product) => {
    const category = product.categoria;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += product.estoque * product.preco_aoa;
    return acc;
  }, {});
  
  const categoryData = Object.values(salesByCategory);

  // Dados para gráfico de pedidos por status
  const ordersByStatus = [
    { name: 'Pendente', value: orders.filter(o => o.status === 'Pendente').length },
    { name: 'Pago', value: orders.filter(o => o.status === 'Pago').length },
    { name: 'Entregue', value: orders.filter(o => o.status === 'Entregue').length },
  ];

  // Dados para gráfico de vendas ao longo do tempo (últimos 7 dias simulados)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      name: date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' }),
      vendas: Math.floor(Math.random() * 500000) + 100000
    };
  });

  const COLORS = ['#E31E24', '#FDD835', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];

  return (
    <div className="space-y-8">
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

      {/* Sample Data Creator */}
      <SampleDataCreator />

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