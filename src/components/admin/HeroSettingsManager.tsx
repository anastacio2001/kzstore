import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Save, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export function HeroSettingsManager() {
  const [settings, setSettings] = useState<HeroSettings>({
    title: 'Tecnologia de',
    subtitle: 'Ponta em Angola',
    description: 'A maior loja online de produtos eletrônicos especializados. RAM para servidores, SSD, Mini PCs e muito mais com os melhores preços.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
    primaryButtonText: 'Ver Produtos',
    primaryButtonLink: '/produtos',
    secondaryButtonText: 'Falar com Especialista',
    secondaryButtonLink: '/contato'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('heroSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setImagePreview(parsed.imageUrl);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      setSettings({ ...settings, imageUrl: data.url });
      setImagePreview(data.url);
      setImageFile(null);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Salvar no localStorage (você pode modificar para salvar no banco de dados)
      localStorage.setItem('heroSettings', JSON.stringify(settings));
      
      // Disparar evento customizado para atualizar HomePage
      window.dispatchEvent(new CustomEvent('heroSettingsUpdated', { detail: settings }));
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      const defaults: HeroSettings = {
        title: 'Tecnologia de',
        subtitle: 'Ponta em Angola',
        description: 'A maior loja online de produtos eletrônicos especializados. RAM para servidores, SSD, Mini PCs e muito mais com os melhores preços.',
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
        primaryButtonText: 'Ver Produtos',
        primaryButtonLink: '/produtos',
        secondaryButtonText: 'Falar com Especialista',
        secondaryButtonLink: '/contato'
      };
      setSettings(defaults);
      setImagePreview(defaults.imageUrl);
      toast.info('Configurações restauradas para o padrão');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configurações da Página Inicial</h2>
          <p className="text-gray-500">Personalize o banner principal (Hero Section)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Conteúdo do Banner</h3>

          <div>
            <label className="block text-sm font-medium mb-2">Título Principal</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Tecnologia de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtítulo (Destaque)</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ponta em Angola"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Descrição do seu negócio..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Botão Principal - Texto</label>
              <input
                type="text"
                value={settings.primaryButtonText}
                onChange={(e) => setSettings({ ...settings, primaryButtonText: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ver Produtos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Botão Principal - Link</label>
              <input
                type="text"
                value={settings.primaryButtonLink}
                onChange={(e) => setSettings({ ...settings, primaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="/produtos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Botão Secundário - Texto</label>
              <input
                type="text"
                value={settings.secondaryButtonText}
                onChange={(e) => setSettings({ ...settings, secondaryButtonText: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Falar com Especialista"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Botão Secundário - Link</label>
              <input
                type="text"
                value={settings.secondaryButtonLink}
                onChange={(e) => setSettings({ ...settings, secondaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="/contato"
              />
            </div>
          </div>
        </Card>

        {/* Upload de Imagem */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Imagem de Fundo</h3>

          {/* Preview */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                    setSettings({ ...settings, imageUrl: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhuma imagem</p>
                </div>
              </div>
            )}
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-sm font-medium mb-2">URL da Imagem</label>
            <input
              type="text"
              value={settings.imageUrl}
              onChange={(e) => {
                setSettings({ ...settings, imageUrl: e.target.value });
                setImagePreview(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {/* Upload File */}
          <div>
            <label className="block text-sm font-medium mb-2">Ou fazer upload de arquivo</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              {imageFile && (
                <Button 
                  onClick={handleUploadImage} 
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Upload'}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
            </p>
          </div>

          {/* Sugestões de Imagens */}
          <div>
            <label className="block text-sm font-medium mb-2">Imagens Sugeridas (Unsplash)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
                'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'
              ].map((url, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSettings({ ...settings, imageUrl: url });
                    setImagePreview(url);
                  }}
                  className="relative aspect-video rounded-md overflow-hidden border-2 border-transparent hover:border-red-500 transition-colors"
                >
                  <img src={url} alt={`Sugestão ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Preview do Banner */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview da Página Inicial</h3>
        <div 
          className="relative rounded-lg overflow-hidden min-h-[400px] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${imagePreview || settings.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4 text-white">
            <div className="max-w-2xl">
              <p className="text-sm mb-2 text-red-400">🔥 Novidade: Novos produtos a cada semana</p>
              <h1 className="text-5xl font-bold mb-2">{settings.title}</h1>
              <h2 className="text-6xl font-bold mb-6 text-yellow-400">{settings.subtitle}</h2>
              <p className="text-lg mb-8 text-gray-200">{settings.description}</p>
              <div className="flex gap-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  {settings.primaryButtonText} →
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  {settings.secondaryButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
