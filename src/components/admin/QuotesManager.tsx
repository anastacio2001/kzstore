import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { FileText, Plus, X } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  in_progress: { label: 'Em Progresso', color: 'bg-blue-500' },
  sent: { label: 'Enviado', color: 'bg-purple-500' },
  accepted: { label: 'Aceito', color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500' },
};

interface QuotesManagerProps {
  accessToken?: string;
}

export default function QuotesManager({ accessToken }: QuotesManagerProps) {
  const { quotes, loading, fetchQuotes, respondToQuote, updateQuoteStatus } = useQuotes();
  const [responding, setResponding] = useState<any | null>(null);
  const [proposal, setProposal] = useState('');
  const [items, setItems] = useState<Array<{ name: string; quantity: number; unit_price: number }>>([
    { name: '', quantity: 1, unit_price: 0 },
  ]);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    await fetchQuotes();
  };

  const handleRespond = async () => {
    if (!responding) return;
    
    const proposedItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price
    }));
    
    const total = proposedItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    await respondToQuote(responding.id, {
      proposal,
      proposedItems,
      totalAmount: total,
      adminNotes
    });
    
    setResponding(null);
    setProposal('');
    setItems([{ name: '', quantity: 1, unit_price: 0 }]);
    setAdminNotes('');
    await loadQuotes();
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const openRespondDialog = (quote: any) => {
    setResponding(quote);
    setProposal(quote.admin_proposal || '');
    setAdminNotes(quote.admin_notes || '');
    
    if (quote.proposed_items && quote.proposed_items.length > 0) {
      setItems(quote.proposed_items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })));
    } else {
      setItems([{ name: '', quantity: 1, unit_price: 0 }]);
    }
  };

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
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
            <CardDescription>Enviados</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.sent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aceitos</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.accepted}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Personalizados</CardTitle>
          <CardDescription>Gerencie solicitações de orçamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>Nenhum orçamento encontrado</p>
              </div>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium">{quote.user_name}</h4>
                          <Badge className={`${statusConfig[quote.status].color} text-white`}>
                            {statusConfig[quote.status].label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Email:</span> {quote.user_email}
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span> {quote.user_phone}
                          </div>
                          {quote.budget && (
                            <div>
                              <span className="font-medium">Orçamento:</span>{' '}
                              {Number(quote.budget).toLocaleString('pt-AO')} Kz
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Data:</span>{' '}
                            {new Date(quote.created_at).toLocaleDateString('pt-AO')}
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium mb-1">Requisitos:</p>
                          <p className="text-sm text-gray-700">{quote.requirements}</p>
                        </div>

                        {quote.admin_proposal && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium mb-1">Proposta Enviada:</p>
                            <p className="text-sm text-gray-700 mb-2">{quote.admin_proposal}</p>
                            
                            {quote.proposed_items && quote.proposed_items.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {quote.proposed_items.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm flex justify-between">
                                    <span>
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span className="font-medium">
                                      {Number(item.subtotal).toLocaleString('pt-AO')} Kz
                                    </span>
                                  </div>
                                ))}
                                <div className="pt-2 border-t border-blue-300 flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>{Number(quote.total_amount || 0).toLocaleString('pt-AO')} Kz</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => openRespondDialog(quote)}>
                            <FileText className="h-4 w-4 mr-1" />
                            {quote.status === 'pending' ? 'Responder' : 'Editar'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Criar Proposta de Orçamento</DialogTitle>
                            <DialogDescription>
                              Cliente: {quote.user_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Descrição da Proposta
                              </label>
                              <Textarea
                                value={proposal}
                                onChange={(e) => setProposal(e.target.value)}
                                placeholder="Descreva a proposta de forma clara..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Itens da Proposta</label>
                                <Button size="sm" variant="outline" onClick={addItem}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {items.map((item, index) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      placeholder="Nome do produto"
                                      value={item.name}
                                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Qtd"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Preço"
                                      value={item.unit_price}
                                      onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                                      className="w-32"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeItem(index)}
                                      disabled={items.length === 1}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 p-3 bg-gray-50 rounded flex justify-between items-center">
                                <span className="font-medium">Total:</span>
                                <span className="text-xl font-semibold text-green-600">
                                  {calculateTotal().toLocaleString('pt-AO')} AOA
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Notas Internas (opcional)
                              </label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Notas para referência interna..."
                                rows={2}
                              />
                            </div>

                            <Button onClick={handleRespond} className="w-full">
                              Enviar Proposta ao Cliente
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