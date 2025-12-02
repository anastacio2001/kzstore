import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from './ui/button';

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/track?order_number=${orderNumber}&email=${email}`);
      
      if (!response.ok) {
        throw new Error('Pedido não encontrado');
      }

      const data = await response.json();
      setTracking(data.order);
    } catch (err: any) {
      setError(err.message || 'Erro ao rastrear pedido');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="size-8 text-yellow-500" />;
      case 'confirmed': return <Package className="size-8 text-blue-500" />;
      case 'shipped': return <Truck className="size-8 text-purple-500" />;
      case 'delivered': return <CheckCircle className="size-8 text-green-500" />;
      case 'cancelled': return <XCircle className="size-8 text-red-500" />;
      default: return <Package className="size-8 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Aguardando Confirmação',
      confirmed: 'Confirmado',
      processing: 'Em Processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-gray-600">
            Acompanhe seu pedido em tempo real
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Pedido
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: KZ12345678"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email do Pedido
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rastreando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="size-5" />
                  Rastrear Pedido
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Tracking Result */}
        {tracking && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* Order Info */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pedido #{tracking.order_number}
                  </h2>
                  <p className="text-gray-600">
                    {new Date(tracking.created_at).toLocaleDateString('pt-AO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Number(tracking.total).toLocaleString('pt-AO')} Kz
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Status do Pedido</h3>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {getStatusIcon(tracking.status)}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {getStatusText(tracking.status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Última atualização: {new Date(tracking.updated_at).toLocaleString('pt-AO')}
                  </p>
                </div>
              </div>

              {tracking.tracking_number && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Código de Rastreamento
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-600">
                    {tracking.tracking_number}
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Itens do Pedido</h3>
              {JSON.parse(tracking.items).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.product_image || 'https://via.placeholder.com/80'}
                    alt={item.product_name}
                    className="size-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} × {Number(item.price).toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {typeof tracking.shipping_address === 'string' 
                    ? tracking.shipping_address 
                    : JSON.stringify(tracking.shipping_address, null, 2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
