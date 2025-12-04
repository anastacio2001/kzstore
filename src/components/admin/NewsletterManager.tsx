import { useState, useEffect } from 'react';
import { Mail, Download, Trash2, Users, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('active');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      console.log('🔍 [Newsletter] Carregando assinantes...');
      
      // Obter token de autenticação
      let token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            token = user.access_token || user.token;
          } catch {}
        }
      }
      
      console.log('🔑 [Newsletter] Token encontrado:', !!token);
      
      const response = await fetch('/api/newsletter/subscribers', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('🔍 [Newsletter] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [Newsletter] Data recebida:', data);
        console.log('🔍 [Newsletter] Total assinantes:', data.subscribers?.length || 0);
        setSubscribers(data.subscribers || []);
      } else {
        console.error('❌ [Newsletter] Erro na resposta:', response.status);
        const errorText = await response.text();
        console.error('❌ [Newsletter] Erro:', errorText);
      }
    } catch (error) {
      console.error('❌ [Newsletter] Erro ao carregar assinantes:', error);
      toast.error('Erro ao carregar assinantes');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const filteredSubs = getFilteredSubscribers();
    
    // Criar CSV com aspas e escape correto
    const csvRows = [
      // Header
      ['Email', 'Nome', 'Status', 'Data Inscrição', 'Origem'].join(','),
      // Data rows
      ...filteredSubs.map(sub => [
        `"${sub.email}"`,
        `"${sub.name || ''}"`,
        `"${sub.status}"`,
        `"${new Date(sub.subscribed_at).toLocaleDateString('pt-AO')}"`,
        `"${sub.source || ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToCSV_OLD = () => {
    const filteredSubs = getFilteredSubscribers();
    const csv = [
      ['Email', 'Nome', 'Status', 'Data Inscrição', 'Origem'],
      ...filteredSubs.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        new Date(sub.subscribed_at).toLocaleDateString('pt-AO'),
        sub.source || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Lista exportada!');
  };

  const getFilteredSubscribers = () => {
    if (filter === 'all') return subscribers;
    return subscribers.filter(sub => sub.status === filter);
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    thisWeek: subscribers.filter(s => {
      const subDate = new Date(s.subscribed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return subDate > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]"></div>
      </div>
    );
  }

  const filteredSubscribers = getFilteredSubscribers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📧 Newsletter</h2>
          <p className="text-gray-600">Gerencie assinantes do email marketing</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="size-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="size-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Mail className="size-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-3xl font-bold text-gray-500">{stats.unsubscribed}</p>
            </div>
            <Trash2 className="size-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Últimos 7 dias</p>
              <p className="text-3xl font-bold text-[#E31E24]">{stats.thisWeek}</p>
            </div>
            <TrendingUp className="size-10 text-[#E31E24]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Ativos ({stats.active})
        </Button>
        <Button
          variant={filter === 'unsubscribed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unsubscribed')}
        >
          Cancelados ({stats.unsubscribed})
        </Button>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Mail className="size-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum assinante encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="size-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sub.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : sub.status === 'unsubscribed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.status === 'active' ? '✓ Ativo' : sub.status === 'unsubscribed' ? '✗ Cancelado' : '⚠ Bounced'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="size-4 text-gray-400 mr-2" />
                        {new Date(sub.subscribed_at).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sub.source ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {sub.source === 'footer' ? '🔗 Footer' : 
                           sub.source === 'blog' ? '📝 Blog' :
                           sub.source === 'checkout' ? '🛒 Checkout' : sub.source}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      {stats.active > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="size-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Pronto para enviar campanhas!</h4>
              <p className="text-sm text-blue-700 mt-1">
                Você tem <strong>{stats.active} assinantes ativos</strong>. Use a seção "Campanhas" para criar e enviar emails para sua lista.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
