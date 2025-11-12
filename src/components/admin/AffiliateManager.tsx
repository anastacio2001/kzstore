import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase/client';

interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  commission_rate: number;
  status: 'pending' | 'active' | 'suspended';
  total_clicks: number;
  total_sales: number;
  total_commission: number;
  created_at: string;
  user_email?: string;
}

interface AffiliatePayment {
  id: string;
  affiliate_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes: string | null;
  created_at: string;
}

export default function AffiliateManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payments, setPayments] = useState<AffiliatePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

  useEffect(() => {
    loadAffiliates();
    loadPayments();
  }, [filter]);

  async function loadAffiliates() {
    try {
      setLoading(true);

      let query = supabase
        .from('affiliates')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const affiliatesWithEmail = (data || []).map(aff => ({
        ...aff,
        user_email: aff.profiles?.email || 'N/A'
      }));

      setAffiliates(affiliatesWithEmail);
    } catch (error: any) {
      console.error('Error loading affiliates:', error);
      toast.error('Erro ao carregar afiliados');
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    try {
      const { data, error } = await supabase
        .from('affiliate_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error loading payments:', error);
    }
  }

  async function updateAffiliateStatus(affiliateId: string, status: 'active' | 'suspended') {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status })
        .eq('id', affiliateId);

      if (error) throw error;

      toast.success(`Afiliado ${status === 'active' ? 'aprovado' : 'suspenso'} com sucesso!`);
      loadAffiliates();
    } catch (error: any) {
      console.error('Error updating affiliate status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  async function updateCommissionRate(affiliateId: string, newRate: number) {
    if (newRate < 0 || newRate > 100) {
      toast.error('Taxa deve estar entre 0 e 100%');
      return;
    }

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ commission_rate: newRate })
        .eq('id', affiliateId);

      if (error) throw error;

      toast.success('Taxa de comissão atualizada!');
      loadAffiliates();
    } catch (error: any) {
      console.error('Error updating commission rate:', error);
      toast.error('Erro ao atualizar taxa');
    }
  }

  function openPaymentModal(affiliate: Affiliate) {
    setSelectedAffiliate(affiliate);
    
    // Calculate pending commissions
    const pendingAmount = affiliate.total_commission; // Adjust based on already paid
    setPaymentAmount(pendingAmount);
    setPaymentMethod('pix');
    setPaymentNotes('');
    setShowPaymentModal(true);
  }

  async function processPayment() {
    if (!selectedAffiliate) return;

    if (paymentAmount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('affiliate_payments')
        .insert({
          affiliate_id: selectedAffiliate.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          status: 'completed',
          notes: paymentNotes || null
        });

      if (error) throw error;

      toast.success('Pagamento registrado com sucesso!');
      loadAffiliates();
      loadPayments();
      setShowPaymentModal(false);
      setSelectedAffiliate(null);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      'pending': { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'active': { label: 'Ativo', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      'suspended': { label: 'Suspenso', class: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Clock };
  }

  const totalActiveAffiliates = affiliates.filter(a => a.status === 'active').length;
  const totalPendingAffiliates = affiliates.filter(a => a.status === 'pending').length;
  const totalCommissionsPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalCommissionsPending = affiliates.reduce((sum, a) => sum + a.total_commission, 0);

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
          <h2 className="text-2xl font-bold text-white">Gerenciar Afiliados</h2>
          <p className="text-gray-400 mt-1">Aprovar afiliados e processar pagamentos</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Pendentes ({totalPendingAffiliates})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Ativos
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Afiliados Ativos</p>
              <p className="text-3xl font-bold text-white mt-1">{totalActiveAffiliates}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aprovações Pendentes</p>
              <p className="text-3xl font-bold text-white mt-1">{totalPendingAffiliates}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Comissões Pagas</p>
              <p className="text-3xl font-bold text-white mt-1">
                {totalCommissionsPaid.toLocaleString('pt-AO')} Kz
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Comissões Pendentes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {totalCommissionsPending.toLocaleString('pt-AO')} Kz
              </p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Afiliado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cliques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Comissão Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    Nenhum afiliado encontrado
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => {
                  const statusBadge = getStatusBadge(affiliate.status);
                  const StatusIcon = statusBadge.icon;
                  const conversionRate = affiliate.total_clicks > 0 
                    ? ((affiliate.total_sales / affiliate.total_clicks) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={affiliate.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {affiliate.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-yellow-400 bg-gray-900 px-2 py-1 rounded">
                          {affiliate.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={affiliate.commission_rate}
                          onChange={(e) => updateCommissionRate(affiliate.id, parseFloat(e.target.value))}
                          className="w-16 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                        <span className="text-gray-400 ml-1">%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {affiliate.total_clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {affiliate.total_sales}
                        <span className="text-gray-500 ml-2">({conversionRate}%)</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                        {affiliate.total_commission.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        {affiliate.status === 'pending' && (
                          <button
                            onClick={() => updateAffiliateStatus(affiliate.id, 'active')}
                            className="text-green-400 hover:text-green-300"
                          >
                            Aprovar
                          </button>
                        )}
                        {affiliate.status === 'active' && (
                          <>
                            <button
                              onClick={() => openPaymentModal(affiliate)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              Pagar
                            </button>
                            <button
                              onClick={() => updateAffiliateStatus(affiliate.id, 'suspended')}
                              className="text-red-400 hover:text-red-300"
                            >
                              Suspender
                            </button>
                          </>
                        )}
                        {affiliate.status === 'suspended' && (
                          <button
                            onClick={() => updateAffiliateStatus(affiliate.id, 'active')}
                            className="text-green-400 hover:text-green-300"
                          >
                            Reativar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Processar Pagamento</h3>
              <p className="text-gray-400 mt-1">
                {selectedAffiliate.user_email} - {selectedAffiliate.code}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valor (Kz)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  step="1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Método de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Observações
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  placeholder="Adicione detalhes sobre o pagamento..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAffiliate(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={processPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
