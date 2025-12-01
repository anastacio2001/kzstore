import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Package, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Order } from '../services/ordersService';

type OrderManagementProps = {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onRefresh: () => void;
};

export function OrderManagement({ orders, onUpdateStatus, onRefresh }: OrderManagementProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  console.log('📦 [OrderManagement] Received', orders.length, 'orders');

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="size-4" />;
      case 'cancelled':
        return <XCircle className="size-4" />;
      case 'shipped':
      case 'processing':
        return <Package className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl">Gestão de Pedidos</h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="size-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>Nenhum pedido encontrado</p>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.user_name}</h3>
                  <p className="text-sm text-gray-600">{order.shipping_address?.phone}</p>
                  {order.user_email && (
                    <p className="text-sm text-gray-600">{order.user_email}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shipping_address?.address}, {order.shipping_address?.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(order.created_at).toLocaleDateString('pt-AO')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-semibold">
                        {(item.price * item.quantity).toLocaleString('pt-AO')} Kz
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    Total: {order.total.toLocaleString('pt-AO')} Kz
                  </p>
                  <p className="text-sm text-gray-600">
                    Pagamento: {order.payment_method}
                  </p>
                </div>
                
                {/* Status Update Buttons - Melhorados */}
                <div className="flex flex-col gap-2">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                        disabled={updating === order.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ✓ Processar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updating === order.id}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        ✕ Cancelar
                      </Button>
                    </div>
                  )}
                  {order.status === 'processing' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                        disabled={updating === order.id}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        🚚 Enviar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updating === order.id}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        ✕ Cancelar
                      </Button>
                    </div>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      disabled={updating === order.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      ✓ Marcar como Entregue
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Pedido Entregue
                    </span>
                  )}
                  {order.status === 'cancelled' && (
                    <span className="text-sm text-red-600 font-medium">
                      ✕ Pedido Cancelado
                    </span>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Observações:</strong> {order.notes}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}