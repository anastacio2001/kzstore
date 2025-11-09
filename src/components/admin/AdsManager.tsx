import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, MousePointer, Calendar, Link as LinkIcon, BarChart } from 'lucide-react';
import { Advertisement, AdPosition, AD_POSITION_LABELS } from '../../types/ads';
import { supabase } from '../../utils/supabase/client';
import { MultiImageUpload } from '../MultiImageUpload';
import { toast } from 'sonner@2.0.3';

export function AdsManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_urls: [] as string[],
    link_url: '',
    position: 'home-hero-banner' as string,
    status: 'active' as string,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    loadAds();
    loadStats();
  }, []);

  const loadAds = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os anúncios usando SDK
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Ads loaded:', data);
      setAds(data || []);
    } catch (error) {
      console.error('❌ Error loading ads:', error);
      toast.error('Erro ao carregar anúncios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calcular estatísticas dos anúncios
      const { data: allAds, error } = await supabase
        .from('ads')
        .select('status, clicks, impressions');

      if (error) throw error;

      const total_ads = allAds?.length || 0;
      const ads_ativos = allAds?.filter(ad => ad.status === 'active').length || 0;
      const total_cliques = allAds?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
      const total_visualizacoes = allAds?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
      const ctr = total_visualizacoes > 0 ? (total_cliques / total_visualizacoes) * 100 : 0;

      setStats({
        total_ads,
        ads_ativos,
        total_cliques,
        total_visualizacoes,
        ctr
      });

      console.log('✅ Stats calculated:', { total_ads, ads_ativos, ctr: ctr.toFixed(2) });
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que pelo menos uma imagem foi adicionada
    if (!formData.image_urls || formData.image_urls.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }

    try {
      if (editingAd) {
        // Atualizar anúncio existente
        const { error } = await supabase
          .from('ads')
          .update({
            title: formData.title,
            description: formData.description,
            image_urls: formData.image_urls,
            link_url: formData.link_url || null,
            position: formData.position,
            status: formData.status,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAd.id);

        if (error) throw error;

        console.log('✅ Ad updated:', editingAd.id);
        toast.success('Anúncio atualizado com sucesso!');
      } else {
        // Criar novo anúncio
        const { error } = await supabase
          .from('ads')
          .insert({
            title: formData.title,
            description: formData.description,
            image_urls: formData.image_urls,
            link_url: formData.link_url || null,
            position: formData.position,
            status: formData.status,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            clicks: 0,
            impressions: 0
          });

        if (error) throw error;

        console.log('✅ Ad created');
        toast.success('Anúncio criado com sucesso!');
      }

      loadAds();
      loadStats();
      resetForm();
    } catch (error) {
      console.error('❌ Error saving ad:', error);
      toast.error('Erro ao salvar anúncio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Ad deleted:', id);
      toast.success('Anúncio deletado com sucesso!');
      loadAds();
      loadStats();
    } catch (error) {
      console.error('❌ Error deleting ad:', error);
      toast.error('Erro ao deletar anúncio');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_urls: ad.image_urls || [],
      link_url: ad.link_url || '',
      position: ad.position,
      status: ad.status,
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date ? ad.end_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_urls: [],
      link_url: '',
      position: 'home-hero-banner',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      const newStatus = ad.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('ads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ad.id);

      if (error) throw error;

      console.log('✅ Ad status toggled:', ad.id, newStatus);
      toast.success(newStatus === 'active' ? 'Anúncio ativado' : 'Anúncio desativado');
      loadAds();
      loadStats();
    } catch (error) {
      console.error('❌ Error toggling ad status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Publicidade</h2>
          <p className="text-gray-600 mt-1">Gerir anúncios e banners da loja</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="size-5" />
          Novo Anúncio
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Anúncios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_ads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Anúncios Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ads_ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="size-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_visualizacoes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <MousePointer className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">CTR</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ctr.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-6">
              {editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ex: Promoção de Verão"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição curta do anúncio"
                />
              </div>

              {/* Upload de Múltiplas Imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Imagens do Anúncio * (até 5 imagens)
                </label>
                <MultiImageUpload
                  onImagesUploaded={(urls) => setFormData({ ...formData, image_urls: urls })}
                  initialImages={formData.image_urls}
                  maxImages={5}
                  bucket="ad-images"
                  folder="ads"
                />
              </div>

              {/* Link de Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Destino (opcional)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://exemplo.com/promocao"
                  />
                  <LinkIcon className="size-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Onde o usuário será redirecionado ao clicar no anúncio
                </p>
              </div>

              {/* Posição e Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição *
                  </label>
                  <select
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="home-hero-banner">Banner Principal (Home)</option>
                    <option value="home-sidebar">Barra Lateral (Home)</option>
                    <option value="home-middle-banner">Banner Central (Home)</option>
                    <option value="category-top">Topo (Categorias)</option>
                    <option value="product-sidebar">Barra Lateral (Produtos)</option>
                    <option value="checkout-banner">Banner (Checkout)</option>
                    <option value="footer-banner">Banner (Rodapé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="scheduled">Agendado</option>
                  </select>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingAd ? 'Atualizar' : 'Criar'} Anúncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anúncio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum anúncio criado ainda
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Mostrar primeira imagem como preview */}
                        <div className="relative">
                          <img
                            src={ad.image_urls?.[0] || 'https://via.placeholder.com/100x100?text=Sem+Imagem'}
                            alt={ad.title}
                            className="size-16 object-cover rounded-lg"
                            onError={(e) => {
                              // Evitar loop infinito - só tentar fallback se não for já uma imagem de erro
                              const currentSrc = e.currentTarget.src;
                              if (!currentSrc.includes('text=Erro') && !currentSrc.includes('text=Sem+Imagem')) {
                                e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Erro';
                              } else {
                                // Se já tentou o fallback e ainda falhou, remover o handler para evitar loop
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                          {ad.image_urls && ad.image_urls.length > 1 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {ad.image_urls.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ad.title}</p>
                          {ad.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ad.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {ad.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="size-4" />
                          <span>{ad.impressions || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MousePointer className="size-4" />
                          <span>{ad.clicks || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{new Date(ad.start_date).toLocaleDateString('pt-AO')}</span>
                        </div>
                        {ad.end_date && (
                          <div className="text-xs text-gray-500">
                            até {new Date(ad.end_date).toLocaleDateString('pt-AO')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          ad.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {ad.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
