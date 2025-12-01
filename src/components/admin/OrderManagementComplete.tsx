import { useState, useEffect } from 'react';
import { 
  Eye, Package, Clock, CheckCircle, X, Download, Search, Filter, 
  ChevronDown, TrendingUp, AlertCircle, Truck, CreditCard, Mail,
  Calendar, User, MapPin, Phone, ShoppingBag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useOrders } from '../../hooks/useOrders';

type OrderManagementCompleteProps = {
  // Access token not required; backend uses cookie-based auth
};

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmado',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
  },
  processing: {
    label: 'Processando',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: Package,
  },
  shipped: {
    label: 'Enviado',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: Truck,
  },
  delivered: {
    label: 'Entregue',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: X,
  },
};

export function OrderManagementComplete({ accessToken }: OrderManagementCompleteProps) {
  const { orders, loading, fetchOrders, updateOrderStatus: updateStatus } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const loadOrders = async () => {
    await fetchOrders();
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_email.toLowerCase().includes(term) ||
        order.customer_phone?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = (order: Order) => new Date(order.created_at);
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const diff = now.getTime() - orderDate(order).getTime();
            return diff < 24 * 60 * 60 * 1000;
          });
          break;
        case 'week':
          filtered = filtered.filter(order => {
            const diff = now.getTime() - orderDate(order).getTime();
            return diff < 7 * 24 * 60 * 60 * 1000;
          });
          break;
        case 'month':
          filtered = filtered.filter(order => {
            const diff = now.getTime() - orderDate(order).getTime();
            return diff < 30 * 24 * 60 * 60 * 1000;
          });
          break;
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingCode?: string) => {
    setUpdating(orderId);
    console.log('📦 Updating order:', { orderId, newStatus, trackingCode });
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_code: trackingCode }),
      });

      console.log('📡 Response status:', response.status);
      const responseData = await response.json();
      console.log('📡 Response data:', responseData);

      if (response.ok) {
        console.log('✅ Order updated successfully!');
        // Reload orders
        await loadOrders();
        
        // Update selected order if it's the one being updated
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any, tracking_code: trackingCode } : null);
        }
      } else {
        console.error('❌ Failed to update order:', responseData);
        alert(`Erro: ${responseData.error || 'Falha ao atualizar pedido'}`);
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      alert(`Erro ao atualizar pedido: ${String(error)}`);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportOrders = () => {
    const csv = [
      ['ID', 'Cliente', 'Email', 'Telefone', 'Total', 'Status', 'Data'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer_name,
        order.customer_email,
        order.customer_phone || '',
        order.total,
        order.status,
        order.created_at,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="size-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="size-4 text-gray-500" />
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-4 text-yellow-600" />
            <p className="text-sm text-yellow-700">Pendentes</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="size-4 text-blue-600" />
            <p className="text-sm text-blue-700">Processando</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="size-4 text-indigo-600" />
            <p className="text-sm text-indigo-700">Enviados</p>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{stats.shipped}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-green-600" />
            <p className="text-sm text-green-700">Entregues</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4" />
            <p className="text-sm opacity-90">Receita</p>
          </div>
          <p className="text-xl font-bold">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search" className="mb-2 block">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="search"
                placeholder="ID, cliente, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="mb-2 block">Status</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="processing">Processando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <Label htmlFor="date" className="mb-2 block">Período</Label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
          </p>
          <Button variant="outline" size="sm" onClick={exportOrders}>
            <Download className="size-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Itens</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig['pending'];
                const StatusIcon = config?.icon || Clock;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                        <StatusIcon className="size-3.5" />
                        <span className="text-xs font-medium">{config.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4 mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          updating={updating === selectedOrder.id}
        />
      )}
    </div>
  );
}

// Order Detail Modal Component
function OrderDetailModal({ 
  order, 
  onClose, 
  onUpdateStatus, 
  updating 
}: { 
  order: Order; 
  onClose: () => void; 
  onUpdateStatus: (orderId: string, status: string, trackingCode?: string) => void;
  updating: boolean;
}) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.tracking_code || '');

  const config = statusConfig[order.status] || statusConfig['pending'];
  const StatusIcon = config?.icon || Clock;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleUpdateStatus = () => {
    onUpdateStatus(order.id, newStatus, trackingCode || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`size-6 ${config.textColor}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pedido #{order.id.slice(0, 8)}</h2>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('pt-AO')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold mb-4">Atualizar Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-status">Novo Status</Label>
                <select
                  id="new-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Processando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <div>
                  <Label htmlFor="tracking">Código de Rastreio</Label>
                  <Input
                    id="tracking"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: BR123456789AO"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === order.status}
              className="mt-4 w-full"
            >
              {updating ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="size-5 text-gray-500" />
                Informações do Cliente
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Nome:</span> <span className="font-medium">{order.customer_name}</span></p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-400" />
                  <span>{order.customer_email}</span>
                </p>
                {order.customer_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-gray-400" />
                    <span>{order.customer_phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="size-5 text-gray-500" />
                Endereço de Entrega
              </h3>
              <div className="space-y-2 text-sm">
                {order.shipping_address && (
                  <p className="text-gray-700">{order.shipping_address}</p>
                )}
                {order.shipping_province && (
                  <p className="text-gray-500">{order.shipping_province}</p>
                )}
                {order.tracking_code && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-600 mb-1">Código de Rastreio:</p>
                    <p className="font-mono font-semibold text-blue-800">{order.tracking_code}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <CreditCard className="size-5 text-gray-500" />
              Método de Pagamento
            </h3>
            <p className="text-sm">{order.payment_method}</p>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-4">Itens do Pedido</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produto</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qtd</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Preço Unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-red-600">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="size-5 text-yellow-600" />
                Observações
              </h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}