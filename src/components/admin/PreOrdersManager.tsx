import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Package, Clock, CheckCircle, XCircle, Mail, Trash2, FileText, Download, ExternalLink } from 'lucide-react';
import { usePreOrders } from '../../hooks/usePreOrders';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500', icon: Package },
  arrived: { label: 'Chegou', color: 'bg-green-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-gray-500', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
};

interface PreOrdersManagerProps {
  accessToken?: string;
}

export default function PreOrdersManager({ accessToken }: PreOrdersManagerProps) {
  const { preOrders, loading, fetchPreOrders, updatePreOrderStatus, deletePreOrder } = usePreOrders();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPreOrders();
  }, []);

  const loadPreOrders = async () => {
    await fetchPreOrders();
  };

  const updateStatus = async (id: string, status: string) => {
    await updatePreOrderStatus(id, status as any);
    await loadPreOrders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar esta pré-venda?')) return;
    const success = await deletePreOrder(id);
    if (success) {
      alert('Pré-venda deletada com sucesso!');
    } else {
      alert('Erro ao deletar pré-venda');
    }
  };

  const filteredOrders = filter === 'all' 
    ? preOrders 
    : preOrders.filter(order => order.status === filter);

  const stats = {
    total: preOrders.length,
    pending: preOrders.filter(o => o.status === 'pending').length,
    confirmed: preOrders.filter(o => o.status === 'confirmed').length,
    arrived: preOrders.filter(o => o.status === 'arrived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confirmados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chegaram</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.arrived}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pré-vendas</CardTitle>
              <CardDescription>Gerencie todas as pré-vendas de produtos</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="arrived">Chegaram</SelectItem>
                <SelectItem value="delivered">Entregues</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>Nenhuma pré-venda encontrada</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className="h-5 w-5 text-gray-400" />
                            <h4 className="font-medium">{order.productName}</h4>
                            <Badge className={`${statusConfig[order.status].color} text-white`}>
                              {statusConfig[order.status].label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Cliente:</span> {order.userName}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {order.userEmail}
                            </div>
                            <div>
                              <span className="font-medium">Quantidade:</span> {order.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Data:</span>{' '}
                              {new Date(order.createdAt).toLocaleDateString('pt-AO')}
                            </div>
                            <div>
                              <span className="font-medium">Pagamento:</span>{' '}
                              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                {order.paymentStatus === 'paid' ? 'Pago' : order.paymentStatus === 'partial' ? 'Parcial' : 'Pendente'}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Preço Unit.</p>
                              <p className="font-semibold">
                                {order.price.toLocaleString('pt-AO')} Kz
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Pago</p>
                              <p className="font-semibold text-green-600">
                                {order.paidAmount.toLocaleString('pt-AO')} Kz
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total</p>
                              <p className="font-semibold">
                                {order.total.toLocaleString('pt-AO')} Kz
                              </p>
                            </div>
                          </div>

                          {order.estimatedDelivery && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Chegada estimada:</span>{' '}
                              {order.estimatedDelivery}
                            </div>
                          )}

                          {order.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notas:</span> {order.notes}
                            </div>
                          )}

                          {order.paymentProof && (
                            <div className="mt-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <a
                                href={order.paymentProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:underline flex items-center gap-1"
                              >
                                Ver Comprovante de Pagamento
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="confirmed">Confirmar</SelectItem>
                              <SelectItem value="arrived">Chegou</SelectItem>
                              <SelectItem value="delivered">Entregar</SelectItem>
                              <SelectItem value="cancelled">Cancelar</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${order.userEmail}`, '_blank')}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}