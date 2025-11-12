import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Eye, CheckCircle, Clock, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase/client';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  total_recipients: number;
  total_opens: number;
  total_clicks: number;
  created_at: string;
}

interface EmailSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
}

export default function EmailCampaignBuilder() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCampaigns();
    loadSubscribers();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscribers() {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('status', 'active')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error loading subscribers:', error);
    }
  }

  async function createCampaign() {
    if (!campaignName.trim() || !campaignSubject.trim() || !campaignBody.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignName,
          subject: campaignSubject,
          body: campaignBody,
          status: scheduledFor ? 'scheduled' : 'draft',
          scheduled_for: scheduledFor || null,
          total_recipients: subscribers.length
        });

      if (error) throw error;

      toast.success('✅ Campanha criada com sucesso!');
      loadCampaigns();
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha');
    } finally {
      setSubmitting(false);
    }
  }

  async function sendCampaign(campaignId: string) {
    if (!confirm('Tem certeza que deseja enviar esta campanha agora?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('📧 Campanha enviada! Os e-mails estão sendo processados.');
      loadCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast.error('Erro ao enviar campanha');
    }
  }

  function resetForm() {
    setCampaignName('');
    setCampaignSubject('');
    setCampaignBody('');
    setScheduledFor('');
  }

  function getStatusBadge(status: string) {
    const badges = {
      'draft': { label: 'Rascunho', class: 'bg-gray-100 text-gray-800', icon: Clock },
      'scheduled': { label: 'Agendada', class: 'bg-blue-100 text-blue-800', icon: Clock },
      'sent': { label: 'Enviada', class: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return badges[status as keyof typeof badges] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Mail };
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    searchTerm === '' ||
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSent = campaigns.filter(c => c.status === 'sent').length;
  const avgOpenRate = campaigns.length > 0
    ? (campaigns.reduce((sum, c) => sum + (c.total_recipients > 0 ? (c.total_opens / c.total_recipients) * 100 : 0), 0) / campaigns.length)
    : 0;
  const avgClickRate = campaigns.length > 0
    ? (campaigns.reduce((sum, c) => sum + (c.total_recipients > 0 ? (c.total_clicks / c.total_recipients) * 100 : 0), 0) / campaigns.length)
    : 0;

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
          <h2 className="text-2xl font-bold text-white">Email Marketing</h2>
          <p className="text-gray-400 mt-1">Crie e envie campanhas para seus clientes</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inscritos Ativos</p>
              <p className="text-3xl font-bold text-white mt-1">{subscribers.length}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Campanhas Enviadas</p>
              <p className="text-3xl font-bold text-white mt-1">{totalSent}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Send className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Taxa de Abertura</p>
              <p className="text-3xl font-bold text-white mt-1">{avgOpenRate.toFixed(1)}%</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Taxa de Cliques</p>
              <p className="text-3xl font-bold text-white mt-1">{avgClickRate.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar campanha..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Destinatários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Taxa Abertura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Taxa Cliques
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Nenhuma campanha encontrada
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const statusBadge = getStatusBadge(campaign.status);
                  const StatusIcon = statusBadge.icon;
                  const openRate = campaign.total_recipients > 0
                    ? ((campaign.total_opens / campaign.total_recipients) * 100).toFixed(1)
                    : '0.0';
                  const clickRate = campaign.total_recipients > 0
                    ? ((campaign.total_clicks / campaign.total_recipients) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={campaign.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{campaign.name}</div>
                          <div className="text-sm text-gray-400">
                            {campaign.sent_at
                              ? `Enviada em ${new Date(campaign.sent_at).toLocaleDateString('pt-BR')}`
                              : campaign.scheduled_for
                                ? `Agendada para ${new Date(campaign.scheduled_for).toLocaleDateString('pt-BR')}`
                                : `Criada em ${new Date(campaign.created_at).toLocaleDateString('pt-BR')}`
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300 max-w-xs truncate">{campaign.subject}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {campaign.total_recipients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {openRate}%
                        <span className="text-gray-500 ml-1">({campaign.total_opens})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {clickRate}%
                        <span className="text-gray-500 ml-1">({campaign.total_clicks})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => sendCampaign(campaign.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Enviar Agora
                          </button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <span className="text-blue-400">Agendada</span>
                        )}
                        {campaign.status === 'sent' && (
                          <span className="text-gray-500">Enviada</span>
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

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Nova Campanha de E-mail</h3>
              <p className="text-gray-400 mt-1">
                Será enviada para {subscribers.length} inscritos ativos
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ex: Promoção Black Friday 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Assunto do E-mail *
                </label>
                <input
                  type="text"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ex: 🔥 Até 50% OFF em todos os produtos!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Conteúdo do E-mail *
                </label>
                <textarea
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={10}
                  placeholder="Escreva o conteúdo do e-mail aqui..."
                />
                <p className="text-gray-500 text-xs mt-1">
                  Você pode usar variáveis: {'{nome}'}, {'{email}'}, {'{codigo_desconto}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Agendar Envio (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Deixe em branco para salvar como rascunho
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={createCampaign}
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold"
                disabled={submitting}
              >
                {submitting ? 'Criando...' : 'Criar Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
