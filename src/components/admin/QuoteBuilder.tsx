import React, { useState, useEffect } from 'react';
import { FileText, Plus, Send, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useKZStore } from '../../hooks/useKZStore';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface CustomQuote {
  id: string;
  quote_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string | null;
  status: 'pending' | 'in_progress' | 'sent' | 'approved' | 'rejected';
  total_amount: number | null;
  valid_until: string | null;
  additional_notes: string | null;
  created_at: string;
  items?: QuoteItem[];
}

interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  notes: string | null;
}

interface ProposalItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}

export default function QuoteBuilder() {
  const { products } = useKZStore();
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress'>('pending');
  const [selectedQuote, setSelectedQuote] = useState<CustomQuote | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
  const [proposalNotes, setProposalNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuotes();
  }, [filter]);

  async function loadQuotes() {
    try {
      setLoading(true);

      let query = supabase
        .from('custom_quotes')
        .select(`
          *,
          items:quote_items(*)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      } else {
        query = query.in('status', ['pending', 'in_progress']);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuotes(data || []);
    } catch (error: any) {
      console.error('Error loading quotes:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  }

  function openProposalModal(quote: CustomQuote) {
    setSelectedQuote(quote);
    
    // Initialize proposal items from quote items
    const initialItems: ProposalItem[] = (quote.items || []).map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      total_price: (item.unit_price || 0) * item.quantity,
      notes: item.notes || ''
    }));

    setProposalItems(initialItems);
    setProposalNotes(quote.additional_notes || '');
    
    // Set valid until to 15 days from now
    const defaultValidUntil = new Date();
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 15);
    setValidUntil(defaultValidUntil.toISOString().split('T')[0]);
    
    setShowProposalModal(true);
  }

  function updateProposalItem(index: number, field: keyof ProposalItem, value: any) {
    const updated = [...proposalItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate total price
    if (field === 'unit_price' || field === 'quantity') {
      updated[index].total_price = updated[index].unit_price * updated[index].quantity;
    }
    
    setProposalItems(updated);
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    updateProposalItem(index, 'product_id', productId);
    updateProposalItem(index, 'product_name', product.name);
    updateProposalItem(index, 'unit_price', product.price);
  }

  async function sendProposal() {
    if (!selectedQuote) return;

    if (proposalItems.some(item => item.unit_price <= 0)) {
      toast.error('Todos os itens devem ter preço definido');
      return;
    }

    if (!validUntil) {
      toast.error('Defina a validade da proposta');
      return;
    }

    try {
      setSubmitting(true);

      const totalAmount = proposalItems.reduce((sum, item) => sum + item.total_price, 0);

      // Update quote
      const { error: quoteError } = await supabase
        .from('custom_quotes')
        .update({
          status: 'sent',
          total_amount: totalAmount,
          valid_until: validUntil,
          additional_notes: proposalNotes || null
        })
        .eq('id', selectedQuote.id);

      if (quoteError) throw quoteError;

      // Update quote items with prices
      for (const item of proposalItems) {
        const originalItem = selectedQuote.items?.find(i => i.product_name === item.product_name);
        if (!originalItem) continue;

        const { error: itemError } = await supabase
          .from('quote_items')
          .update({
            product_id: item.product_id,
            unit_price: item.unit_price,
            total_price: item.total_price,
            notes: item.notes || null
          })
          .eq('id', originalItem.id);

        if (itemError) throw itemError;
      }

      // Create proposal record
      const { error: proposalError } = await supabase
        .from('quote_proposals')
        .insert({
          quote_id: selectedQuote.id,
          proposed_total: totalAmount,
          valid_until: validUntil,
          notes: proposalNotes || null
        });

      if (proposalError) throw proposalError;

      toast.success('✅ Proposta enviada com sucesso!');
      loadQuotes();
      setShowProposalModal(false);
      setSelectedQuote(null);
    } catch (error: any) {
      console.error('Error sending proposal:', error);
      toast.error('Erro ao enviar proposta');
    } finally {
      setSubmitting(false);
    }
  }

  async function updateQuoteStatus(quoteId: string, status: 'in_progress' | 'rejected') {
    try {
      const { error } = await supabase
        .from('custom_quotes')
        .update({ status })
        .eq('id', quoteId);

      if (error) throw error;

      toast.success(`Orçamento ${status === 'in_progress' ? 'marcado como em andamento' : 'rejeitado'}`);
      loadQuotes();
    } catch (error: any) {
      console.error('Error updating quote status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      'pending': { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in_progress': { label: 'Em Andamento', class: 'bg-blue-100 text-blue-800', icon: Clock },
      'sent': { label: 'Enviado', class: 'bg-purple-100 text-purple-800', icon: Send },
      'approved': { label: 'Aprovado', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rejected': { label: 'Rejeitado', class: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || { label: status, class: 'bg-gray-100 text-gray-800', icon: FileText };
  }

  const filteredQuotes = quotes.filter(quote => 
    searchTerm === '' || 
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = proposalItems.reduce((sum, item) => sum + item.total_price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Orçamentos</h2>
          <p className="text-gray-400 mt-1">Crie propostas personalizadas para clientes</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar orçamento..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Pendentes ({quotes.filter(q => q.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Em Andamento
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-gray-400">
              Aguarde solicitações de clientes ou ajuste os filtros
            </p>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const statusBadge = getStatusBadge(quote.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={quote.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        #{quote.quote_number}
                      </h3>
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p><strong>Cliente:</strong> {quote.customer_name}</p>
                      <p><strong>E-mail:</strong> {quote.customer_email}</p>
                      <p><strong>Telefone:</strong> {quote.customer_phone}</p>
                      {quote.customer_company && (
                        <p><strong>Empresa:</strong> {quote.customer_company}</p>
                      )}
                      <p><strong>Data:</strong> {new Date(quote.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  {quote.total_amount && (
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Valor Total</p>
                      <p className="text-2xl font-bold text-green-400">
                        {quote.total_amount.toLocaleString('pt-AO')} Kz
                      </p>
                      {quote.valid_until && (
                        <p className="text-gray-500 text-xs mt-1">
                          Válido até {new Date(quote.valid_until).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items */}
                {quote.items && quote.items.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Itens Solicitados</h4>
                    <div className="space-y-2">
                      {quote.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <p className="text-white">{item.product_name}</p>
                            {item.notes && (
                              <p className="text-gray-500 text-xs">{item.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-gray-400">Qtd: {item.quantity}</p>
                            {item.unit_price && (
                              <p className="text-green-400 font-medium">
                                {item.total_price?.toLocaleString('pt-AO')} Kz
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {quote.additional_notes && (
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-sm">
                      <strong>Observações:</strong> {quote.additional_notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {quote.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openProposalModal(quote)}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                      >
                        Criar Proposta
                      </button>
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'in_progress')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Em Andamento
                      </button>
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {quote.status === 'in_progress' && (
                    <button
                      onClick={() => openProposalModal(quote)}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                    >
                      Criar Proposta
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Criar Proposta</h3>
              <p className="text-gray-400 mt-1">
                #{selectedQuote.quote_number} - {selectedQuote.customer_name}
              </p>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Items */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Itens da Proposta</h4>
                <div className="space-y-4">
                  {proposalItems.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Produto
                          </label>
                          <select
                            value={item.product_id || ''}
                            onChange={(e) => selectProduct(index, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="">Selecione ou digite manualmente</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.price.toLocaleString('pt-AO')} Kz
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateProposalItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Preço Unit.
                          </label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateProposalItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateProposalItem(index, 'notes', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Observações..."
                        />
                        <div className="ml-4 text-right">
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-lg font-bold text-green-400">
                            {item.total_price.toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-yellow-400">Total da Proposta</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {totalAmount.toLocaleString('pt-AO')} Kz
                  </p>
                </div>
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Válido Até
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Observações da Proposta
                </label>
                <textarea
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  placeholder="Condições de pagamento, prazos, garantias..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProposalModal(false);
                  setSelectedQuote(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={sendProposal}
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Proposta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
