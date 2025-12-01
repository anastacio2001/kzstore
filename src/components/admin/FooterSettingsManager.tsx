import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Save, Plus, Edit2, Trash2, X, Phone, Mail, MapPin, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface FooterPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
}

interface FooterSettings {
  companyName: string;
  companyDescription: string;
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
  footerPages: FooterPage[];
  copyrightText: string;
  paymentMethods: string[];
}

export function FooterSettingsManager() {
  const [settings, setSettings] = useState<FooterSettings>({
    companyName: 'KZSTORE',
    companyDescription: 'A maior loja online de produtos eletrônicos especializados em Angola. Tecnologia de ponta com os melhores preços.',
    contactInfo: {
      address: 'Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda Angola',
      phone: '+244 931 054 015',
      email: 'contato@kzstore.ao',
      workingHours: 'Segunda - Sábado\n8:00 - 17:00'
    },
    socialLinks: [
      { id: '1', platform: 'Facebook', url: '#', icon: '📘' },
      { id: '2', platform: 'Instagram', url: '#', icon: '📷' },
      { id: '3', platform: 'Twitter', url: '#', icon: '🐦' },
      { id: '4', platform: 'LinkedIn', url: '#', icon: '💼' }
    ],
    quickLinks: [
      { id: '1', title: 'Sobre Nós', url: '/sobre', order: 1 },
      { id: '2', title: 'Produtos', url: '/produtos', order: 2 },
      { id: '3', title: 'Promoções', url: '/promocoes', order: 3 },
      { id: '4', title: 'Blog', url: '/blog', order: 4 },
      { id: '5', title: 'Carreiras', url: '/carreiras', order: 5 }
    ],
    footerPages: [
      { id: '1', title: 'Central de Ajuda', slug: 'ajuda', content: '', order: 1 },
      { id: '2', title: 'Política de Devolução', slug: 'devolucao', content: '', order: 2 },
      { id: '3', title: 'Garantia', slug: 'garantia', content: '', order: 3 },
      { id: '4', title: 'Termos de Uso', slug: 'termos', content: '', order: 4 },
      { id: '5', title: 'Política de Privacidade', slug: 'privacidade', content: '', order: 5 }
    ],
    copyrightText: '© 2025 KZSTORE. Todos os direitos reservados.',
    paymentMethods: ['Multicaixa Express', 'Transferência Bancária']
  });

  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'links' | 'pages'>('general');
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [editingPage, setEditingPage] = useState<FooterPage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('footerSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  };

  const saveSettings = () => {
    setLoading(true);
    try {
      localStorage.setItem('footerSettings', JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('footerSettingsUpdated', { detail: settings }));
      toast.success('Configurações do footer salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Quick Links
  const handleAddQuickLink = () => {
    const newLink: QuickLink = {
      id: Date.now().toString(),
      title: 'Novo Link',
      url: '#',
      order: settings.quickLinks.length + 1
    };
    setSettings({ ...settings, quickLinks: [...settings.quickLinks, newLink] });
    setEditingLink(newLink);
  };

  const handleUpdateQuickLink = (link: QuickLink) => {
    setSettings({
      ...settings,
      quickLinks: settings.quickLinks.map(l => l.id === link.id ? link : l)
    });
    setEditingLink(null);
    toast.success('Link atualizado!');
  };

  const handleDeleteQuickLink = (id: string) => {
    if (!confirm('Excluir este link?')) return;
    setSettings({
      ...settings,
      quickLinks: settings.quickLinks.filter(l => l.id !== id)
    });
    toast.success('Link excluído!');
  };

  // Social Links
  const handleAddSocialLink = () => {
    const newSocial: SocialLink = {
      id: Date.now().toString(),
      platform: 'Nova Rede',
      url: '#',
      icon: '🌐'
    };
    setSettings({ ...settings, socialLinks: [...settings.socialLinks, newSocial] });
    setEditingSocial(newSocial);
  };

  const handleUpdateSocialLink = (social: SocialLink) => {
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.map(s => s.id === social.id ? social : s)
    });
    setEditingSocial(null);
    toast.success('Rede social atualizada!');
  };

  const handleDeleteSocialLink = (id: string) => {
    if (!confirm('Excluir esta rede social?')) return;
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.filter(s => s.id !== id)
    });
    toast.success('Rede social excluída!');
  };

  // Footer Pages
  const handleAddFooterPage = () => {
    const newPage: FooterPage = {
      id: Date.now().toString(),
      title: 'Nova Página',
      slug: 'nova-pagina',
      content: '',
      order: settings.footerPages.length + 1
    };
    setSettings({ ...settings, footerPages: [...settings.footerPages, newPage] });
    setEditingPage(newPage);
  };

  const handleUpdateFooterPage = (page: FooterPage) => {
    setSettings({
      ...settings,
      footerPages: settings.footerPages.map(p => p.id === page.id ? page : p)
    });
    setEditingPage(null);
    toast.success('Página atualizada!');
  };

  const handleDeleteFooterPage = (id: string) => {
    if (!confirm('Excluir esta página?')) return;
    setSettings({
      ...settings,
      footerPages: settings.footerPages.filter(p => p.id !== id)
    });
    toast.success('Página excluída!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Footer</h2>
          <p className="text-gray-500">Gerencie informações do rodapé e páginas institucionais</p>
        </div>
        <Button onClick={saveSettings} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Todas Alterações'}
        </Button>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={activeTab === 'general' ? 'default' : 'outline'}
            onClick={() => setActiveTab('general')}
            className="whitespace-nowrap"
          >
            Informações Gerais
          </Button>
          <Button
            variant={activeTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contact')}
            className="whitespace-nowrap"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contato
          </Button>
          <Button
            variant={activeTab === 'social' ? 'default' : 'outline'}
            onClick={() => setActiveTab('social')}
            className="whitespace-nowrap"
          >
            Redes Sociais
          </Button>
          <Button
            variant={activeTab === 'links' ? 'default' : 'outline'}
            onClick={() => setActiveTab('links')}
            className="whitespace-nowrap"
          >
            Links Rápidos
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pages')}
            className="whitespace-nowrap"
          >
            <FileText className="w-4 h-4 mr-2" />
            Páginas
          </Button>
        </div>
      </Card>

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informações Gerais</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição da Empresa</label>
            <textarea
              value={settings.companyDescription}
              onChange={(e) => setSettings({ ...settings, companyDescription: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Texto de Copyright</label>
            <input
              type="text"
              value={settings.copyrightText}
              onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="© 2025 KZSTORE. Todos os direitos reservados."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Métodos de Pagamento</label>
            <div className="space-y-2">
              {settings.paymentMethods.map((method, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => {
                      const newMethods = [...settings.paymentMethods];
                      newMethods[index] = e.target.value;
                      setSettings({ ...settings, paymentMethods: newMethods });
                    }}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const newMethods = settings.paymentMethods.filter((_, i) => i !== index);
                      setSettings({ ...settings, paymentMethods: newMethods });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSettings({
                    ...settings,
                    paymentMethods: [...settings.paymentMethods, 'Novo Método']
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Método
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informações de Contato</h3>

          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Endereço
            </label>
            <input
              type="text"
              value={settings.contactInfo.address}
              onChange={(e) => setSettings({
                ...settings,
                contactInfo: { ...settings.contactInfo, address: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="text"
                value={settings.contactInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  contactInfo: { ...settings.contactInfo, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={settings.contactInfo.email}
                onChange={(e) => setSettings({
                  ...settings,
                  contactInfo: { ...settings.contactInfo, email: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Horário de Atendimento
            </label>
            <textarea
              value={settings.contactInfo.workingHours}
              onChange={(e) => setSettings({
                ...settings,
                contactInfo: { ...settings.contactInfo, workingHours: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              placeholder="Segunda - Sábado&#10;8:00 - 17:00"
            />
          </div>
        </Card>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Redes Sociais</h3>
            <Button size="sm" onClick={handleAddSocialLink}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Rede
            </Button>
          </div>

          <div className="space-y-3">
            {settings.socialLinks.map((social) => (
              <div key={social.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {editingSocial?.id === social.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingSocial.icon}
                      onChange={(e) => setEditingSocial({ ...editingSocial, icon: e.target.value })}
                      className="w-16 px-2 py-1 border rounded"
                      placeholder="🌐"
                    />
                    <input
                      type="text"
                      value={editingSocial.platform}
                      onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Nome da plataforma"
                    />
                    <input
                      type="text"
                      value={editingSocial.url}
                      onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="URL"
                    />
                    <Button size="sm" onClick={() => handleUpdateSocialLink(editingSocial)}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingSocial(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl">{social.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{social.platform}</p>
                      <p className="text-sm text-gray-500 truncate">{social.url}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditingSocial(social)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSocialLink(social.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Links Tab */}
      {activeTab === 'links' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <Button size="sm" onClick={handleAddQuickLink}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Link
            </Button>
          </div>

          <div className="space-y-3">
            {settings.quickLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {editingLink?.id === link.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingLink.title}
                      onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Título do link"
                    />
                    <input
                      type="text"
                      value={editingLink.url}
                      onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="/url"
                    />
                    <Button size="sm" onClick={() => handleUpdateQuickLink(editingLink)}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingLink(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium">{link.title}</p>
                      <p className="text-sm text-gray-500">{link.url}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditingLink(link)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuickLink(link.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Páginas do Footer</h3>
              <Button size="sm" onClick={handleAddFooterPage}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Página
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {settings.footerPages.map((page) => (
                <div key={page.id} className="p-4 border rounded-lg hover:border-red-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{page.title}</h4>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingPage(page)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteFooterPage(page.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {page.content || 'Sem conteúdo'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Edit Page Modal */}
          {editingPage && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar Página: {editingPage.title}</h3>
                <Button size="sm" variant="outline" onClick={() => setEditingPage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título da Página</label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="exemplo-de-pagina"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo da Página</label>
                  <textarea
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    rows={15}
                    placeholder="Digite o conteúdo HTML ou Markdown aqui..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode usar HTML ou Markdown. Exemplo: &lt;h1&gt;Título&lt;/h1&gt; ou # Título
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateFooterPage(editingPage)}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Página
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPage(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
