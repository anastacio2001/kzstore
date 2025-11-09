import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CreditCard, Calendar, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface TradeInCredit {
  id: string;
  user_id: string;
  trade_in_evaluation_id: string;
  amount: number;
  used_amount: number;
  expires_at: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  evaluation?: {
    appraised_value: number;
    notes: string;
    request?: {
      product_name: string;
      product_brand: string;
      product_model: string;
    };
  };
}

interface CreditUsage {
  id: string;
  credit_id: string;
  order_id: string;
  amount_used: number;
  used_at: string;
}

export default function TradeInCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<TradeInCredit[]>([]);
  const [usageHistory, setUsageHistory] = useState<CreditUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'credits' | 'history'>('credits');

  useEffect(() => {
    if (user) {
      loadCredits();
      loadUsageHistory();
    }
  }, [user]);

  async function loadCredits() {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trade_in_credits')
        .select(`
          *,
          evaluation:trade_in_evaluation_id (
            appraised_value,
            notes,
            request:request_id (
              product_name,
              product_brand,
              product_model
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCredits(data || []);
    } catch (error: any) {
      console.error('Error loading credits:', error);
      toast.error('Erro ao carregar créditos');
    } finally {
      setLoading(false);
    }
  }

  async function loadUsageHistory() {
    if (!user) return;

    try {
      const { data: creditsData } = await supabase
        .from('trade_in_credits')
        .select('id')
        .eq('user_id', user.id);

      if (!creditsData) return;

      const creditIds = creditsData.map(c => c.id);

      const { data, error } = await supabase
        .from('trade_in_credit_usage')
        .select('*')
        .in('credit_id', creditIds)
        .order('used_at', { ascending: false });

      if (error) throw error;

      setUsageHistory(data || []);
    } catch (error: any) {
      console.error('Error loading usage history:', error);
    }
  }

  function getStatusBadge(status: string) {
    const badges = {
      'active': { label: 'Ativo', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      'used': { label: 'Utilizado', class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'expired': { label: 'Expirado', class: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Clock };
  }

  function isExpiringSoon(expiresAt: string): boolean {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  function getDaysUntilExpiry(expiresAt: string): number {
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const totalAvailableCredit = credits
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.amount - c.used_amount), 0);

  const totalUsedCredit = credits.reduce((sum, c) => sum + c.used_amount, 0);

  const totalExpiredCredit = credits
    .filter(c => c.status === 'expired')
    .reduce((sum, c) => sum + (c.amount - c.used_amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Meus Créditos Trade-In</h1>
        <p className="text-gray-400 mt-2">
          Gerencie seus créditos de troca e histórico de uso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Crédito Disponível</p>
              <p className="text-4xl font-bold mt-2">
                R$ {totalAvailableCredit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
          <p className="text-green-100 text-sm mt-4">
            {credits.filter(c => c.status === 'active').length} crédito(s) ativo(s)
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Utilizado</p>
              <p className="text-3xl font-bold text-white mt-2">
                R$ {totalUsedCredit.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            {usageHistory.length} utilização(ões)
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Crédito Expirado</p>
              <p className="text-3xl font-bold text-white mt-2">
                R$ {totalExpiredCredit.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            {credits.filter(c => c.status === 'expired').length} crédito(s) expirado(s)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'credits'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Meus Créditos
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Histórico de Uso
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'credits' ? (
            <div className="space-y-4">
              {credits.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum crédito disponível
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Faça um trade-in de produtos usados para ganhar créditos
                  </p>
                  <button
                    onClick={() => window.location.href = '#trade-in'}
                    className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Solicitar Trade-In
                  </button>
                </div>
              ) : (
                credits.map((credit) => {
                  const statusBadge = getStatusBadge(credit.status);
                  const StatusIcon = statusBadge.icon;
                  const availableAmount = credit.amount - credit.used_amount;
                  const daysUntilExpiry = getDaysUntilExpiry(credit.expires_at);
                  const expiringSoon = isExpiringSoon(credit.expires_at);

                  return (
                    <div
                      key={credit.id}
                      className={`bg-gray-900 rounded-lg p-6 border-2 ${
                        credit.status === 'active' 
                          ? expiringSoon 
                            ? 'border-yellow-500/50' 
                            : 'border-green-500/50'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {credit.evaluation?.request?.product_brand}{' '}
                              {credit.evaluation?.request?.product_model}
                            </h3>
                            <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {credit.evaluation?.request?.product_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">
                            R$ {availableAmount.toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">disponível</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {credit.used_amount > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-400">Utilizado</span>
                            <span className="text-gray-400">
                              R$ {credit.used_amount.toFixed(2)} / R$ {credit.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(credit.used_amount / credit.amount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Criado em {new Date(credit.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 ${
                            credit.status === 'expired' 
                              ? 'text-red-400' 
                              : expiringSoon 
                                ? 'text-yellow-400' 
                                : 'text-gray-400'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              {credit.status === 'expired'
                                ? 'Expirado'
                                : daysUntilExpiry > 0
                                  ? `Expira em ${daysUntilExpiry} dia(s)`
                                  : 'Expira hoje'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {credit.evaluation?.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-gray-400 text-sm">
                            <span className="font-medium">Avaliação:</span> {credit.evaluation.notes}
                          </p>
                        </div>
                      )}

                      {expiringSoon && credit.status === 'active' && (
                        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                          <p className="text-yellow-400 text-sm font-medium">
                            ⚠️ Este crédito expira em breve! Use antes de{' '}
                            {new Date(credit.expires_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {usageHistory.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum histórico de uso
                  </h3>
                  <p className="text-gray-400">
                    Você ainda não utilizou seus créditos
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Pedido
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Valor Utilizado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {usageHistory.map((usage) => (
                        <tr key={usage.id} className="hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(usage.used_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                            #{usage.order_id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-400">
                            - R$ {usage.amount_used.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">
          ℹ️ Como funcionam os créditos Trade-In?
        </h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Créditos são gerados quando seu trade-in é aprovado</li>
          <li>• Válidos por <strong>6 meses</strong> a partir da data de aprovação</li>
          <li>• Podem ser usados em <strong>qualquer compra</strong> na loja</li>
          <li>• Créditos parcialmente usados mantêm o saldo restante</li>
          <li>• Utilize múltiplos créditos na mesma compra</li>
          <li>• Créditos não utilizados expiram automaticamente</li>
        </ul>
      </div>
    </div>
  );
}
