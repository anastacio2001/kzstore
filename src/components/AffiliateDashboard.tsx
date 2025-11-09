import { useState, useEffect } from 'react';
import { Link, Share2, TrendingUp, DollarSign, Users, Eye, ShoppingCart, Copy, Check } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../hooks/useAuth';

interface Affiliate {
  id: string;
  unique_code: string;
  commission_rate: number;
  status: string;
  total_clicks: number;
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  paid_commission: number;
  pending_commission: number;
}

interface AffiliateLink {
  id: string;
  campaign_name: string;
  full_url: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface AffiliateSale {
  id: string;
  order_id: string;
  order_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

export function AffiliateDashboard() {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [campaignName, setCampaignName] = useState('');

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    try {
      // Carregar dados do afiliado
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_email', user?.email)
        .single();

      if (affiliateError && affiliateError.code !== 'PGRST116') {
        throw affiliateError;
      }

      if (!affiliateData) {
        // Criar conta de afiliado se não existir
        await createAffiliateAccount();
        return;
      }

      setAffiliate(affiliateData);

      // Carregar links
      const { data: linksData } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });

      setLinks(linksData || []);

      // Carregar vendas
      const { data: salesData } = await supabase
        .from('affiliate_sales')
        .select('*')
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSales(salesData || []);
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_email: user?.email,
          user_name: user?.user_metadata?.full_name || user?.email,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      alert('Conta de afiliado criada com sucesso!');
      loadAffiliateData();
    } catch (error: any) {
      console.error('Error creating affiliate account:', error);
      alert(error.message);
    }
  };

  const handleCreateLink = async () => {
    if (!affiliate || !campaignName) return;

    try {
      const baseUrl = window.location.origin;
      const urlParams = `ref=${affiliate.unique_code}`;
      const fullUrl = `${baseUrl}?${urlParams}`;

      const { error } = await supabase
        .from('affiliate_links')
        .insert({
          affiliate_id: affiliate.id,
          campaign_name: campaignName,
          url_params: urlParams,
          full_url: fullUrl
        });

      if (error) throw error;

      alert('Link criado com sucesso!');
      setCampaignName('');
      setShowCreateLink(false);
      loadAffiliateData();
    } catch (error: any) {
      console.error('Error creating link:', error);
      alert(error.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      paid: 'Pago',
      rejected: 'Rejeitado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  if (!affiliate) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <Share2 size={64} className="mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Programa de Afiliados KZSTORE</h2>
        <p className="text-gray-600 mb-6">
          Ganhe comissão recomendando nossos produtos! Crie sua conta de afiliado agora.
        </p>
        <button
          onClick={createAffiliateAccount}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Criar Conta de Afiliado
        </button>
      </div>
    );
  }

  const conversionRate = affiliate.total_clicks > 0 
    ? ((affiliate.total_sales / affiliate.total_clicks) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Painel de Afiliado</h2>
            <p className="text-purple-100">Seu código: <span className="font-mono font-bold">{affiliate.unique_code}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Taxa de Comissão</p>
            <p className="text-3xl font-bold">{affiliate.commission_rate}%</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Eye size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{affiliate.total_clicks}</p>
          <p className="text-sm text-gray-600">Total de Cliques</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold">{affiliate.total_sales}</p>
          <p className="text-sm text-gray-600">Vendas Geradas</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{conversionRate}%</p>
          <p className="text-sm text-gray-600">Taxa de Conversão</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold">{affiliate.total_revenue.toLocaleString('pt-AO')}</p>
          <p className="text-sm text-gray-600">Revenue Gerado (Kz)</p>
        </div>
      </div>

      {/* Comissões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-500">
          <p className="text-sm text-green-700 mb-1">Total de Comissões</p>
          <p className="text-3xl font-bold text-green-800">{affiliate.total_commission.toLocaleString('pt-AO')} Kz</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border-2 border-yellow-500">
          <p className="text-sm text-yellow-700 mb-1">Comissão Pendente</p>
          <p className="text-3xl font-bold text-yellow-800">{affiliate.pending_commission.toLocaleString('pt-AO')} Kz</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-500">
          <p className="text-sm text-blue-700 mb-1">Já Recebido</p>
          <p className="text-3xl font-bold text-blue-800">{affiliate.paid_commission.toLocaleString('pt-AO')} Kz</p>
        </div>
      </div>

      {/* Links de Afiliado */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Seus Links de Afiliado</h3>
          <button
            onClick={() => setShowCreateLink(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Link size={18} />
            Criar Link
          </button>
        </div>

        {links.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Link size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum link criado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campanha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliques</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversões</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{link.campaign_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{link.full_url}</td>
                    <td className="px-4 py-3">{link.clicks}</td>
                    <td className="px-4 py-3">{link.conversions}</td>
                    <td className="px-4 py-3 font-semibold">{link.revenue.toLocaleString('pt-AO')} Kz</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyToClipboard(link.full_url, link.id)}
                        className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        {copiedLink === link.id ? (
                          <>
                            <Check size={16} /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={16} /> Copiar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de Vendas */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Últimas Vendas</h3>
        </div>
        {sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhuma venda ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{sale.order_id}</td>
                    <td className="px-4 py-3 font-semibold">{sale.order_amount.toLocaleString('pt-AO')} Kz</td>
                    <td className="px-4 py-3 text-green-600 font-bold">{sale.commission_amount.toLocaleString('pt-AO')} Kz</td>
                    <td className="px-4 py-3">{getStatusBadge(sale.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleDateString('pt-AO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Link */}
      {showCreateLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Criar Novo Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: Instagram Bio, Facebook Post, etc"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Preview do link:</span><br />
                  <span className="font-mono text-xs break-all">
                    {window.location.origin}?ref={affiliate.unique_code}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateLink(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateLink}
                  disabled={!campaignName}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Criar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
