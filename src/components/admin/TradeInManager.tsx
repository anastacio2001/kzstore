import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Smartphone, Clock, CheckCircle, XCircle, Edit, ImageIcon } from 'lucide-react';
import { useTradeIn } from '../../hooks/useTradeIn';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  evaluated: { label: 'Avaliado', color: 'bg-blue-500' },
  approved: { label: 'Aprovado', color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500' },
  completed: { label: 'Completo', color: 'bg-gray-500' },
};

const conditionLabels = {
  excellent: 'Excelente',
  good: 'Bom',
  fair: 'Razoável',
  poor: 'Ruim',
};

const deviceTypeLabels = {
  phone: 'Telemóvel',
  laptop: 'Portátil',
  tablet: 'Tablet',
  watch: 'Smartwatch',
  other: 'Outro',
};

interface TradeInManagerProps {
  accessToken?: string;
}

export default function TradeInManager({ accessToken }: TradeInManagerProps) {
  const { tradeIns, loading, fetchTradeIns, evaluateTradeIn, updateTradeInStatus } = useTradeIn();
  const [filter, setFilter] = useState<string>('all');
  const [evaluating, setEvaluating] = useState<any | null>(null);
  const [finalValue, setFinalValue] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [evalStatus, setEvalStatus] = useState('approved');

  useEffect(() => {
    loadTradeIns();
  }, []);

  const loadTradeIns = async () => {
    await fetchTradeIns();
  };

  const handleEvaluate = async () => {
    if (!evaluating) return;
    
    await evaluateTradeIn(evaluating.id, {
      finalValue: parseFloat(finalValue),
      adminNotes,
      status: evalStatus as any
    });
    
    setEvaluating(null);
    setFinalValue('');
    setAdminNotes('');
    await loadTradeIns();
  };

  const openEvaluateDialog = (tradeIn: any) => {
    setEvaluating(tradeIn);
    setFinalValue(tradeIn.final_value?.toString() || tradeIn.estimated_value.toString());
    setAdminNotes(tradeIn.admin_notes || '');
    setEvalStatus(tradeIn.status === 'pending' ? 'approved' : tradeIn.status);
  };

  const filteredTradeIns = filter === 'all' 
    ? tradeIns 
    : tradeIns.filter(item => item.status === filter);

  const stats = {
    total: tradeIns.length,
    pending: tradeIns.filter(t => t.status === 'pending').length,
    approved: tradeIns.filter(t => t.status === 'approved').length,
    totalValue: tradeIns
      .filter(t => t.status === 'approved' || t.status === 'completed')
      .reduce((sum, t) => sum + (t.final_value || 0), 0),
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
            <CardDescription>Total Trade-Ins</CardDescription>
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
            <CardDescription>Aprovados</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-2xl">{stats.totalValue.toLocaleString('pt-AO')} AOA</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trade-Ins</CardTitle>
              <CardDescription>Gerencie solicitações de troca de dispositivos</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="evaluated">Avaliados</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
                <SelectItem value="completed">Completos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTradeIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>Nenhum trade-in encontrado</p>
              </div>
            ) : (
              filteredTradeIns.map((tradeIn) => (
                <Card key={tradeIn.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium">
                            {tradeIn.brand} {tradeIn.model}
                          </h4>
                          <Badge className={`${statusConfig[tradeIn.status].color} text-white`}>
                            {statusConfig[tradeIn.status].label}
                          </Badge>
                          <Badge variant="outline">
                            {deviceTypeLabels[tradeIn.device_type as keyof typeof deviceTypeLabels]}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Cliente:</span> {tradeIn.user_name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {tradeIn.user_email}
                          </div>
                          <div>
                            <span className="font-medium">Condição:</span>{' '}
                            {conditionLabels[tradeIn.condition as keyof typeof conditionLabels]}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{' '}
                            {new Date(tradeIn.created_at).toLocaleDateString('pt-AO')}
                          </div>
                          {tradeIn.imei && (
                            <div className="col-span-2">
                              <span className="font-medium">IMEI:</span> {tradeIn.imei}
                            </div>
                          )}
                        </div>

                        {tradeIn.description && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="font-medium">Descrição:</span> {tradeIn.description}
                          </div>
                        )}

                        {tradeIn.admin_notes && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <span className="font-medium">Notas do Admin:</span> {tradeIn.admin_notes}
                          </div>
                        )}

                        {tradeIn.images && tradeIn.images.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Imagens do Dispositivo ({tradeIn.images.length})
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {tradeIn.images.map((url: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors"
                                >
                                  <img
                                    src={url}
                                    alt={`Imagem ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-4 pt-3 border-t">
                          <div>
                            <p className="text-sm text-gray-500">Valor Estimado</p>
                            <p className="font-semibold">
                              {tradeIn.estimated_value.toLocaleString('pt-AO')} AOA
                            </p>
                          </div>
                          {tradeIn.final_value !== null && (
                            <div>
                              <p className="text-sm text-gray-500">Valor Final</p>
                              <p className="font-semibold text-green-600">
                                {tradeIn.final_value.toLocaleString('pt-AO')} AOA
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => openEvaluateDialog(tradeIn)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Avaliar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Avaliar Trade-In</DialogTitle>
                            <DialogDescription>
                              {tradeIn.brand} {tradeIn.model}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Valor Final (AOA)
                              </label>
                              <Input
                                type="number"
                                value={finalValue}
                                onChange={(e) => setFinalValue(e.target.value)}
                                placeholder="Ex: 200000"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Valor estimado: {tradeIn.estimated_value.toLocaleString('pt-AO')} AOA
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Status
                              </label>
                              <Select value={evalStatus} onValueChange={setEvalStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="evaluated">Avaliado</SelectItem>
                                  <SelectItem value="approved">Aprovar</SelectItem>
                                  <SelectItem value="rejected">Rejeitar</SelectItem>
                                  <SelectItem value="completed">Completar</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Notas do Admin
                              </label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Observações sobre a avaliação..."
                                rows={3}
                              />
                            </div>

                            <Button onClick={handleEvaluate} className="w-full">
                              Salvar Avaliação
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}