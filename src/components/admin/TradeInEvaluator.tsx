import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, DollarSign, Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface TradeInRequest {
  id: string;
  user_id: string;
  product_name: string;
  product_brand: string;
  product_model: string;
  condition: string;
  has_box: boolean;
  has_accessories: boolean;
  purchase_date: string;
  estimated_value: number;
  description: string | null;
  images: string[];
  status: 'pending' | 'evaluating' | 'approved' | 'rejected';
  created_at: string;
  user_email?: string;
}

interface TradeInEvaluation {
  request_id: string;
  appraised_value: number;
  notes: string;
  approved: boolean;
}

export default function TradeInEvaluator() {
  const [requests, setRequests] = useState<TradeInRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TradeInRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [appraisedValue, setAppraisedValue] = useState(0);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'evaluating'>('pending');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  async function loadRequests() {
    try {
      setLoading(true);
      
      let query = supabase
        .from('trade_in_requests')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      } else {
        query = query.in('status', ['pending', 'evaluating']);
      }

      const { data, error } = await query;

      if (error) throw error;

      const requestsWithEmail = (data || []).map(req => ({
        ...req,
        user_email: req.profiles?.email || 'N/A'
      }));

      setRequests(requestsWithEmail);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }

  function openEvaluationModal(request: TradeInRequest) {
    setSelectedRequest(request);
    setAppraisedValue(request.estimated_value);
    setEvaluationNotes('');
    setShowModal(true);
  }

  async function updateRequestStatus(status: 'evaluating') {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('trade_in_requests')
        .update({ status })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success('Status atualizado!');
      loadRequests();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  }

  async function submitEvaluation(approved: boolean) {
    if (!selectedRequest) return;

    if (!evaluationNotes.trim()) {
      toast.error('Adicione observações sobre a avaliação');
      return;
    }

    if (approved && appraisedValue <= 0) {
      toast.error('Defina um valor válido');
      return;
    }

    try {
      setSubmitting(true);

      // Create evaluation
      const { error: evalError } = await supabase
        .from('trade_in_evaluations')
        .insert({
          request_id: selectedRequest.id,
          appraised_value: approved ? appraisedValue : 0,
          notes: evaluationNotes,
          approved
        });

      if (evalError) throw evalError;

      // Update request status
      const { error: updateError } = await supabase
        .from('trade_in_requests')
        .update({ 
          status: approved ? 'approved' : 'rejected'
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast.success(approved ? 'Trade-in aprovado! Crédito gerado automaticamente.' : 'Trade-in rejeitado.');
      loadRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  }

  function getConditionBadge(condition: string) {
    const badges = {
      'Excelente': 'bg-green-100 text-green-800',
      'Bom': 'bg-blue-100 text-blue-800',
      'Aceitável': 'bg-yellow-100 text-yellow-800',
      'Ruim': 'bg-red-100 text-red-800'
    };
    return badges[condition as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  }

  function getStatusBadge(status: string) {
    const badges = {
      'pending': { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      'evaluating': { label: 'Em Avaliação', class: 'bg-blue-100 text-blue-800' },
      'approved': { label: 'Aprovado', class: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejeitado', class: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status as keyof typeof badges] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return badge;
  }

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
          <h2 className="text-2xl font-bold text-white">Avaliar Trade-Ins</h2>
          <p className="text-gray-400 mt-1">Avalie e aprove solicitações de troca</p>
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
            Pendentes
          </button>
          <button
            onClick={() => setFilter('evaluating')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'evaluating'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Em Avaliação
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Avaliação</p>
              <p className="text-3xl font-bold text-white mt-1">
                {requests.filter(r => r.status === 'evaluating').length}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Valor Médio Estimado</p>
              <p className="text-3xl font-bold text-white mt-1">
                R$ {requests.length > 0 
                  ? (requests.reduce((sum, r) => sum + r.estimated_value, 0) / requests.length).toFixed(0)
                  : '0'}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Condição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Valor Estimado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Nenhuma solicitação encontrada
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const statusBadge = getStatusBadge(request.status);
                  return (
                    <tr key={request.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {request.product_brand} {request.product_model}
                          </div>
                          <div className="text-sm text-gray-400">{request.product_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {request.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConditionBadge(request.condition)}`}>
                          {request.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                        R$ {request.estimated_value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEvaluationModal(request)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          Avaliar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Avaliar Trade-In</h3>
              <p className="text-gray-400 mt-1">
                {selectedRequest.product_brand} {selectedRequest.product_model}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Produto
                  </label>
                  <p className="text-white">{selectedRequest.product_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Marca/Modelo
                  </label>
                  <p className="text-white">
                    {selectedRequest.product_brand} {selectedRequest.product_model}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Condição
                  </label>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConditionBadge(selectedRequest.condition)}`}>
                    {selectedRequest.condition}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Data de Compra
                  </label>
                  <p className="text-white">
                    {new Date(selectedRequest.purchase_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Acessórios
                  </label>
                  <p className="text-white">
                    {selectedRequest.has_box && '📦 Caixa'} 
                    {selectedRequest.has_box && selectedRequest.has_accessories && ' • '}
                    {selectedRequest.has_accessories && '🎁 Acessórios'}
                    {!selectedRequest.has_box && !selectedRequest.has_accessories && 'Nenhum'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Valor Estimado (Cliente)
                  </label>
                  <p className="text-green-400 font-semibold">
                    R$ {selectedRequest.estimated_value.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descrição do Cliente
                  </label>
                  <p className="text-white bg-gray-900 p-4 rounded-lg">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Fotos do Produto ({selectedRequest.images.length})
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedRequest.images.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-900 hover:opacity-75 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Form */}
              <div className="border-t border-gray-700 pt-6 space-y-4">
                <h4 className="text-lg font-semibold text-white">Sua Avaliação</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Valor Avaliado (R$)
                  </label>
                  <input
                    type="number"
                    value={appraisedValue}
                    onChange={(e) => setAppraisedValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Observações da Avaliação *
                  </label>
                  <textarea
                    value={evaluationNotes}
                    onChange={(e) => setEvaluationNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={4}
                    placeholder="Explique os critérios da avaliação, estado do produto, justificativa do valor..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>

              <div className="flex gap-3">
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => updateRequestStatus('evaluating')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    disabled={submitting}
                  >
                    <Eye className="w-4 h-4" />
                    Marcar como "Em Avaliação"
                  </button>
                )}
                
                <button
                  onClick={() => submitEvaluation(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <XCircle className="w-4 h-4" />
                  {submitting ? 'Rejeitando...' : 'Rejeitar'}
                </button>

                <button
                  onClick={() => submitEvaluation(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  disabled={submitting}
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Aprovando...' : 'Aprovar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
