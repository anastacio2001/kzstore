import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, X, Eye, MessageCircle, Download, Truck, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { useKZStore } from '../hooks/useKZStore';
import { Order } from '../hooks/useKZStore';

type MyOrdersPageProps = {
  onBack: () => void;
};

export function MyOrdersPage({ onBack }: MyOrdersPageProps) {
  const { user } = useAuth();
  const { orders, fetchOrders, loading } = useKZStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Filter orders by current user
  const myOrders = orders.filter(order => 
    order.customer?.email === user?.email || 
    order.customer?.telefone === user?.phone
  );

  const filteredOrders = filterStatus === 'all' 
    ? myOrders 
    : myOrders.filter(o => o.status === filterStatus);

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Pago':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Em Processamento':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Enviado':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Entregue':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="size-4" />;
      case 'Pago':
      case 'Em Processamento':
        return <Package className="size-4" />;
      case 'Enviado':
      case 'Entregue':
        return <CheckCircle className="size-4" />;
      case 'Cancelado':
        return <X className="size-4" />;
      default:
        return null;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { status: 'Pendente', label: 'Pedido Realizado' },
      { status: 'Pago', label: 'Pagamento Confirmado' },
      { status: 'Em Processamento', label: 'Em Preparação' },
      { status: 'Enviado', label: 'Enviado' },
      { status: 'Entregue', label: 'Entregue' }
    ];

    const statusOrder = ['Pendente', 'Pago', 'Em Processamento', 'Enviado', 'Entregue'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const handleContactSupport = () => {
    const message = `Olá, preciso de ajuda com meu pedido.`;
    window.open(`https://wa.me/244931054015?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading && myOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="size-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group mb-4"
          >
            <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
              <p className="text-gray-600 mt-1">
                Acompanhe o status de todos os seus pedidos
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                <Package className="size-5 text-red-600" />
                <span className="font-semibold text-red-600">{myOrders.length} Pedidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Filtrar por:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({myOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus('Pendente')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'Pendente'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({myOrders.filter(o => o.status === 'Pendente').length})
            </button>
            <button
              onClick={() => setFilterStatus('Enviado')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'Enviado'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enviados ({myOrders.filter(o => o.status === 'Enviado').length})
            </button>
            <button
              onClick={() => setFilterStatus('Entregue')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === 'Entregue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entregues ({myOrders.filter(o => o.status === 'Entregue').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Package className="size-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? 'Você ainda não fez nenhum pedido'
                : `Você não tem pedidos com status "${filterStatus}"`
              }
            </p>
            {filterStatus === 'all' && (
              <Button
                onClick={onBack}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Começar a Comprar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Pedido</p>
                        <p className="font-bold text-red-600">#{order.id}</p>
                      </div>
                      <div className="h-10 w-px bg-gray-300" />
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('pt-AO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-gray-300 hidden sm:block" />
                      <div className="hidden sm:block">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-gray-900">
                          {order.total.toLocaleString('pt-AO')} AOA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="size-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                          <Package className="size-full p-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.product_nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantidade: {item.quantity}x
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {(item.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-sm text-gray-500 pt-2">
                        + {order.items.length - 3} item(s) adicional(is)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {myOrders.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <MessageCircle className="size-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Precisa de ajuda?
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Nossa equipe está pronta para ajudá-lo com qualquer dúvida sobre seus pedidos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContactSupport}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <MessageCircle className="size-4 mr-2" />
                  Falar com Suporte
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pedido #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-600">
                  Realizado em {new Date(selectedOrder.created_at).toLocaleDateString('pt-AO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Timeline */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="size-5 text-red-600" />
                  Rastreamento do Pedido
                </h3>
                <div className="space-y-4">
                  {getStatusSteps(selectedOrder.status).map((step, index, array) => (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`size-10 rounded-full flex items-center justify-center border-2 ${
                          step.completed 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="size-5" />
                          ) : (
                            <Clock className="size-5" />
                          )}
                        </div>
                        {index < array.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            step.completed ? 'bg-green-600' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-semibold ${
                          step.active ? 'text-red-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        {step.active && (
                          <p className="text-sm text-gray-600 mt-1">
                            Status atual do seu pedido
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="size-5 text-red-600" />
                  Endereço de Entrega
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900 font-medium">{selectedOrder.customer?.nome}</p>
                  <p className="text-gray-600">{selectedOrder.customer?.endereco}</p>
                  <p className="text-gray-600">{selectedOrder.customer?.cidade}</p>
                  <p className="text-gray-600">{selectedOrder.customer?.telefone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="size-16 flex-shrink-0 rounded-lg bg-white overflow-hidden">
                        <Package className="size-full p-3 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_nome}</p>
                        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {(item.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total do Pedido</span>
                  <span className="text-2xl font-bold text-red-600">
                    {selectedOrder.total.toLocaleString('pt-AO')} AOA
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Método de Pagamento:</span> {selectedOrder.payment_method}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleContactSupport}
                >
                  <MessageCircle className="size-4 mr-2" />
                  Suporte
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.print()}
                >
                  <Download className="size-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
