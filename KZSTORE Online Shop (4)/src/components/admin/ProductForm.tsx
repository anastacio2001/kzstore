import { useState, useEffect } from 'react';
import { X, Upload, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Product } from '../../App';
import { categories } from '../../data/products';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type ProductFormProps = {
  product?: Product;
  onSave: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
};

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    categoria: product?.categoria || 'RAM',
    condicao: product?.condicao || 'Novo',
    preco_aoa: product?.preco_aoa || 0,
    peso_kg: product?.peso_kg || 0,
    estoque: product?.estoque || 0,
  });

  const [images, setImages] = useState<string[]>(
    product?.imagens || (product?.imagem_url ? [product.imagem_url] : [])
  );
  
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const [specs, setSpecs] = useState<Record<string, string>>(
    product?.especificacoes || {}
  );
  
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSpec = () => {
    if (newSpecKey && newSpecValue) {
      setSpecs(prev => ({
        ...prev,
        [newSpecKey]: newSpecValue
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpec = (key: string) => {
    setSpecs(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setImages(prev => [...prev, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          console.error('Arquivo não é uma imagem:', file.name);
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('Arquivo muito grande (>5MB):', file.name);
          continue;
        }

        // Criar nome único para o arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `product_${timestamp}_${randomId}.${extension}`;

        // Fazer upload para Supabase Storage
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/upload-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error(`Erro no upload: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      // Adicionar URLs das imagens carregadas
      setImages(prev => [...prev, ...uploadedUrls]);
      
      if (uploadedUrls.length > 0) {
        console.log(`✅ ${uploadedUrls.length} imagem(ns) carregada(s) com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload das imagens:', error);
      alert('Erro ao fazer upload das imagens. Tente novamente.');
    } finally {
      setUploadingImages(false);
      // Limpar input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('Adicione pelo menos uma imagem do produto!');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onSave({
        ...formData,
        imagem_url: images[0], // Primeira imagem é a principal
        imagens: images, // Array com todas as imagens
        especificacoes: specs
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3>Informações Básicas</h3>
            
            <div>
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
                placeholder="Ex: Memória RAM DDR4 16GB ECC"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                required
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {categories
                  .filter(cat => cat.id !== 'all')
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="condicao">Condição *</Label>
              <select
                id="condicao"
                value={formData.condicao}
                onChange={(e) => setFormData(prev => ({ ...prev, condicao: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="Novo">Novo</option>
                <option value="Usado">Usado</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>
          </div>

          {/* Imagens do Produto */}
          <div className="space-y-4">
            <h3>Imagens do Produto *</h3>
            
            {/* Upload de Arquivos */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#E31E24] transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingImages}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="size-12 text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  {uploadingImages ? 'Carregando imagens...' : 'Clique para fazer upload de imagens'}
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG ou WEBP (máx. 5MB cada)
                </p>
              </label>
            </div>

            {/* Adicionar URL Manual */}
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">Ou adicione URL de imagem:</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImageUrl}
                  disabled={!newImageUrl || !newImageUrl.startsWith('http')}
                >
                  <Plus className="size-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Preview das Imagens */}
            {images.length > 0 && (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  {images.length} imagem(ns) adicionada(s) 
                  {images.length > 0 && <span className="text-[#E31E24] ml-1">(primeira será a imagem principal)</span>}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500';
                        }}
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-[#E31E24] text-white text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preços e Estoque */}
          <div className="space-y-4">
            <h3>Preços e Estoque</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preco_aoa">Preço (AOA) *</Label>
                <Input
                  id="preco_aoa"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.preco_aoa}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_aoa: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="estoque">Estoque *</Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  value={formData.estoque}
                  onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="peso_kg">Peso (kg) *</Label>
                <Input
                  id="peso_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.peso_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_kg: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              * O peso é usado para calcular o frete
            </p>
          </div>

          {/* Especificações Técnicas */}
          <div className="space-y-4">
            <h3>Especificações Técnicas</h3>
            
            {Object.entries(specs).length > 0 && (
              <div className="space-y-2">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-600 font-medium">{key}</span>
                      <span className="text-sm">{value}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSpec(key)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-600">Adicionar nova especificação:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="Nome (ex: Tipo)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Valor (ex: DDR4)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSpec}
                disabled={!newSpecKey || !newSpecValue}
              >
                <Plus className="size-4 mr-2" />
                Adicionar Especificação
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSaving || uploadingImages}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#E31E24] hover:bg-[#C71A1F]"
              disabled={isSaving || uploadingImages || images.length === 0}
            >
              {isSaving ? (
                'Salvando...'
              ) : uploadingImages ? (
                'Carregando imagens...'
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  {product ? 'Atualizar Produto' : 'Criar Produto'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}