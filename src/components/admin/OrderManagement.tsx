import { useState } from 'react';
import { Eye, Package, Clock, CheckCircle, X, Download, Truck, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Order } from '../../hooks/useKZStore';

type OrderManagementProps = {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
};

export function OrderManagement({ orders, onUpdateStatus }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(orderId, newStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'Aguardando Pagamento':
        return 'bg-orange-100 text-orange-700';
      case 'Pago':
        return 'bg-blue-100 text-blue-700';
      case 'Em Processamento':
        return 'bg-purple-100 text-purple-700';
      case 'Preparando':
        return 'bg-indigo-100 text-indigo-700';
      case 'Pronto para Retirada':
        return 'bg-cyan-100 text-cyan-700';
      case 'Enviado':
        return 'bg-sky-100 text-sky-700';
      case 'Em Trânsito':
        return 'bg-teal-100 text-teal-700';
      case 'Entregue':
        return 'bg-green-100 text-green-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      case 'Reembolsado':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="size-4" />;
      case 'Aguardando Pagamento':
        return <AlertCircle className="size-4" />;
      case 'Pago':
        return <CreditCard className="size-4" />;
      case 'Em Processamento':
      case 'Preparando':
        return <Package className="size-4" />;
      case 'Pronto para Retirada':
        return <CheckCircle className="size-4" />;
      case 'Enviado':
      case 'Em Trânsito':
        return <Truck className="size-4" />;
      case 'Entregue':
        return <CheckCircle className="size-4" />;
      case 'Cancelado':
        return <X className="size-4" />;
      case 'Reembolsado':
        return <RefreshCw className="size-4" />;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Telefone', 'Data', 'Total', 'Status', 'Pagamento'];
    const rows = sortedOrders.map(order => [
      order.id,
      order.customer?.nome || 'N/A',
      order.customer?.telefone || 'N/A',
      new Date(order.created_at).toLocaleString('pt-AO'),
      order.total,
      order.status,
      order.payment_method || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_kzstore_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pendente')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Pendente'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes ({orders.filter(o => o.status === 'Pendente').length})
          </button>
          <button
            onClick={() => setFilterStatus('Aguardando Pagamento')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Aguardando Pagamento'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aguardando Pgto ({orders.filter(o => o.status === 'Aguardando Pagamento').length})
          </button>
          <button
            onClick={() => setFilterStatus('Pago')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Pago'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pagos ({orders.filter(o => o.status === 'Pago').length})
          </button>
          <button
            onClick={() => setFilterStatus('Em Processamento')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Em Processamento'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Processando ({orders.filter(o => o.status === 'Em Processamento').length})
          </button>
          <button
            onClick={() => setFilterStatus('Em Trânsito')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Em Trânsito'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Em Trânsito ({orders.filter(o => o.status === 'Em Trânsito').length})
          </button>
          <button
            onClick={() => setFilterStatus('Entregue')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'Entregue'
                ? 'bg-[#E31E24] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Entregues ({orders.filter(o => o.status === 'Entregue').length})
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={orders.length === 0}
        >
          <Download className="mr-2 size-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Status Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm mb-2 text-gray-700">Guia de Status dos Pedidos:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="size-3 text-yellow-600" />
            <span className="text-gray-600">Pendente</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="size-3 text-orange-600" />
            <span className="text-gray-600">Aguardando Pgto</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="size-3 text-blue-600" />
            <span className="text-gray-600">Pago</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="size-3 text-purple-600" />
            <span className="text-gray-600">Processando</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="size-3 text-indigo-600" />
            <span className="text-gray-600">Preparando</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="size-3 text-cyan-600" />
            <span className="text-gray-600">Pronto</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="size-3 text-sky-600" />
            <span className="text-gray-600">Enviado</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="size-3 text-teal-600" />
            <span className="text-gray-600">Em Trânsito</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="size-3 text-green-600" />
            <span className="text-gray-600">Entregue</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="size-3 text-red-600" />
            <span className="text-gray-600">Cancelado</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="size-3 text-pink-600" />
            <span className="text-gray-600">Reembolsado</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Pedido</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Cliente</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Data</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Total</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Status</th>
                <th className="text-right px-6 py-3 text-sm text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                sortedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#E31E24]">{order.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p>{order.customer?.nome || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.customer?.telefone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.created_at).toLocaleString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.total.toLocaleString('pt-AO')} AOA</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2>Detalhes do Pedido {selectedOrder.id}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Progress */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border">
                <h3 className="mb-4">Progresso do Pedido</h3>
                <div className="relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300"></div>
                  <div className="relative flex justify-between">
                    {[
                      { label: 'Pendente', icon: Clock, color: 'yellow' },
                      { label: 'Pago', icon: CreditCard, color: 'blue' },
                      { label: 'Processando', icon: Package, color: 'purple' },
                      { label: 'Enviado', icon: Truck, color: 'sky' },
                      { label: 'Entregue', icon: CheckCircle, color: 'green' }
                    ].map(({ label, icon: Icon, color }, index) => {
                      const isActive = 
                        selectedOrder.status === label ||
                        (label === 'Processando' && (selectedOrder.status === 'Em Processamento' || selectedOrder.status === 'Preparando')) ||
                        (label === 'Enviado' && (selectedOrder.status === 'Enviado' || selectedOrder.status === 'Em Trânsito'));
                      const isCancelled = selectedOrder.status === 'Cancelado' || selectedOrder.status === 'Reembolsado';
                      
                      return (
                        <div key={label} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive 
                              ? `bg-${color}-500 text-white shadow-lg` 
                              : isCancelled 
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          }`}>
                            <Icon className="size-4" />
                          </div>
                          <span className={`text-xs mt-2 text-center ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {(selectedOrder.status === 'Cancelado' || selectedOrder.status === 'Reembolsado') && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <X className="size-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      Pedido {selectedOrder.status === 'Cancelado' ? 'cancelado' : 'reembolsado'}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="mb-3">Informações do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p>{selectedOrder.customer?.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p>{selectedOrder.customer?.telefone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p>{selectedOrder.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cidade:</span>
                    <p>{selectedOrder.customer?.cidade}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Endereço:</span>
                    <p>{selectedOrder.customer?.endereco}</p>
                  </div>
                  {selectedOrder.customer?.observacoes && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Observações:</span>
                      <p>{selectedOrder.customer?.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="mb-3">Itens do Pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{item.product_nome}</p>
                        <p className="text-xs text-gray-600">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="text-sm">
                        {(item.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <span>Total:</span>
                  <span className="text-[#E31E24]">
                    {selectedOrder.total.toLocaleString('pt-AO')} AOA
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="mb-2">Método de Pagamento</h3>
                <p className="text-sm">{selectedOrder.payment_method}</p>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="mb-3">Atualizar Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Pendente', 'Aguardando Pagamento', 'Pago', 'Em Processamento', 'Preparando', 'Pronto para Retirada', 'Enviado', 'Em Trânsito', 'Entregue', 'Cancelado', 'Reembolsado'].map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.status === status ? 'default' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={isUpdating || selectedOrder.status === status}
                      className={selectedOrder.status === status ? 'bg-[#E31E24]' : ''}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact Customer */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const message = `Olá ${selectedOrder.customer?.nome}, sobre o seu pedido ${selectedOrder.id}...`;
                    window.open(`https://wa.me/${selectedOrder.customer?.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  Contatar via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}