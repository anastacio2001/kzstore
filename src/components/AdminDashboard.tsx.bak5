import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Product } from '../App';
import { Order, Customer } from '../hooks/useAdminData';

type AdminDashboardProps = {
  products: Product[];
  orders: Order[];
  customers: Customer[];
};

export function AdminDashboard({ products, orders, customers }: AdminDashboardProps) {
  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const lowStockProducts = products.filter(p => p.estoque < 5).length;

  const stats = [
    {
      label: 'Receita Total',
      value: `${totalRevenue.toLocaleString('pt-AO')} Kz`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Pedidos',
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Produtos',
      value: products.length.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Clientes',
      value: customers.length.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Pedidos Pendentes',
      value: pendingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Estoque Baixo',
      value: lowStockProducts.toString(),
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div>
      <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6">Dashboard</h2>
      
      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="w-full">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-3xl font-bold truncate">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg self-end sm:self-auto`}>
                  <Icon className={`size-4 sm:size-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders - Mobile Optimized */}
      <Card className="p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">Pedidos Recentes</h3>
        <div className="space-y-2 sm:space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base truncate">{order.customer.nome}</p>
                <p className="text-xs sm:text-sm text-gray-600">{order.items.length} itens</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm sm:text-base">{order.total.toLocaleString('pt-AO')} Kz</p>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhum pedido ainda</p>
          )}
        </div>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-xl mb-4 text-red-700">⚠️ Alerta de Estoque Baixo</h3>
          <div className="space-y-2">
            {products.filter(p => p.estoque < 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded">
                <span>{product.nome}</span>
                <span className="text-red-600 font-semibold">Estoque: {product.estoque}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}