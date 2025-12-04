import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, MousePointer, Calendar, Link as LinkIcon, Image as ImageIcon, BarChart, Upload } from 'lucide-react';
import { Advertisement, AdPosition, AD_POSITION_LABELS } from '../../types/ads';
import { toast } from 'sonner';
import { useAds } from '../../hooks/useAds';

export function AdsManager() {
  const { ads, loading, fetchAds, createAd, updateAd, deleteAd, getStats } = useAds();
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'home-hero-banner' as AdPosition,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    console.log('🔥 AdsManager: Carregando anúncios...');
    const fetchedAds = await fetchAds();
    console.log('🔥 AdsManager: Anúncios carregados:', fetchedAds);
    console.log('🔥 AdsManager: Número de anúncios:', fetchedAds.length);
    if (fetchedAds.length > 0) {
      console.log('🔥 AdsManager: Primeiro anúncio:', fetchedAds[0]);
      console.log('🔥 AdsManager: Campos do primeiro anúncio:', Object.keys(fetchedAds[0]));
    }
    await loadStats();
  };

  const loadStats = async () => {
    const statsData = await getStats();
    setStats(statsData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAd) {
        await updateAd(editingAd.id, formData);
        toast.success('Anúncio atualizado!');
      } else {
        await createAd(formData);
        toast.success('Anúncio criado!');
      }
      loadAds();
      loadStats();
      resetForm();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Erro ao salvar anúncio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return;

    try {
      await deleteAd(id);
      toast.success('Anúncio deletado!');
      loadAds();
      loadStats();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Erro ao deletar anúncio');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.titulo,
      description: ad.descricao || '',
      imageUrl: ad.imagem_url,
      linkUrl: ad.link_url || '',
      position: ad.posicao,
      startDate: ad.data_inicio.split('T')[0],
      endDate: ad.data_fim ? ad.data_fim.split('T')[0] : '',
      isActive: ad.ativo,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'home-hero-banner',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      await updateAd(ad.id, { ...ad, isActive: !ad.ativo });
      toast.success(ad.ativo ? 'Anúncio desativado' : 'Anúncio ativado');
      loadAds();
      loadStats();
    } catch (error) {
      console.error('Error toggling ad status:', error);
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

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Anúncio *
                </label>
                
                {/* Upload de arquivo */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // Mostrar preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                    id="ad-image-upload"
                  />
                  <label htmlFor="ad-image-upload" className="cursor-pointer">
                    {formData.imageUrl ? (
                      <div className="space-y-2">
                        <img src={formData.imageUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <p className="text-sm text-gray-500">Clique para alterar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="size-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Clique para fazer upload de imagem</p>
                        <p className="text-xs text-gray-500">PNG, JPG ou WEBP (máx. 5MB cada)</p>
                      </div>
                    )}
                  </label>
                </div>
                
                {/* Ou adicione URL de imagem */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Ou adicione URL de imagem:</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Destino
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://exemplo.com/promocao"
                  />
                  <LinkIcon className="size-10 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição *
                  </label>
                  <select
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as AdPosition })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {Object.entries(AD_POSITION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'ativo' : 'inativo'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'ativo' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
              {loading ? (
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
                        <img
                          src={ad.imagem_url}
                          alt={ad.titulo}
                          className="size-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{ad.titulo}</p>
                          {ad.descricao && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ad.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {AD_POSITION_LABELS[ad.posicao]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="size-4" />
                          <span>{ad.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MousePointer className="size-4" />
                          <span>{ad.cliques}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{new Date(ad.data_inicio).toLocaleDateString('pt-AO')}</span>
                        </div>
                        {ad.data_fim && (
                          <div className="text-xs text-gray-500">
                            até {new Date(ad.data_fim).toLocaleDateString('pt-AO')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ad.ativo ? 'Ativo' : 'Inativo'}
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