import { useState, useEffect } from 'react';
import { Loader2, Upload, X, Image as ImageIcon, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Product } from '../../App';
import { uploadImage } from '../../utils/supabase/storage';

interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  subcategories?: { id: string; name: string; icon?: string; parentId: string; order: number; }[];
}

type ProductFormProps = {
  product?: Product;
  onSave: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
};

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    categoria: product?.categoria || '',
    subcategoria: product?.subcategoria || '',
    condicao: product?.condicao || 'Novo',
    preco_aoa: product?.preco_aoa || 0,
    peso_kg: product?.peso_kg || 0,
    estoque: product?.estoque || 0,
    is_pre_order: product?.is_pre_order || false,
    pre_order_estimated_arrival: product?.pre_order_info?.estimated_arrival || '',
    pre_order_deposit_percentage: product?.pre_order_info?.deposit_percentage || 30,
    shipping_type: product?.shipping_type || 'paid',
    shipping_cost_aoa: product?.shipping_cost_aoa || 0,
    shipping_cost_usd: product?.shipping_cost_usd || 0,
  });
  
  // Estados separados para manter strings enquanto digita (para aceitar vírgulas)
  const [priceInput, setPriceInput] = useState(product?.preco_aoa?.toString() || '');
  const [shippingCostAoaInput, setShippingCostAoaInput] = useState(product?.shipping_cost_aoa?.toString() || '');
  const [shippingCostUsdInput, setShippingCostUsdInput] = useState(product?.shipping_cost_usd?.toString() || '');

  // Carregar categorias
  useEffect(() => {
    loadCategories();

    // Escutar atualizações de categorias
    const handleCategoriesUpdate = (event: CustomEvent) => {
      setCategories(event.detail);
    };

    window.addEventListener('categoriesUpdated' as any, handleCategoriesUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated' as any, handleCategoriesUpdate);
    };
  }, []);

  // Atualizar subcategorias quando categoria muda
  useEffect(() => {
    if (formData.categoria) {
      const category = categories.find(cat => cat.id === formData.categoria);
      setAvailableSubcategories(category?.subcategories || []);
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.categoria, categories]);

  const loadCategories = () => {
    const saved = localStorage.getItem('productCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCategories(parsed);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    }
  };

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

        // Fazer upload para Supabase Storage
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
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
      const pre_order_info = formData.is_pre_order ? {
        estimated_arrival: formData.pre_order_estimated_arrival,
        deposit_percentage: formData.pre_order_deposit_percentage,
      } : null;
      
      // Remover campos temporários do formData
      const { pre_order_estimated_arrival, pre_order_deposit_percentage, ...cleanFormData } = formData;
      
      await onSave({
        ...cleanFormData,
        imagem_url: images[0], // Primeira imagem é a principal
        imagens: images, // Array com todas as imagens
        especificacoes: specs,
        is_pre_order: formData.is_pre_order,
        pre_order_info,
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, categoria: e.target.value, subcategoria: '' }));
                }}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Nenhuma categoria encontrada. Crie categorias em "Categorias" primeiro.
                </p>
              )}
            </div>

            {availableSubcategories.length > 0 && (
              <div>
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <select
                  id="subcategoria"
                  value={formData.subcategoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategoria: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Nenhuma subcategoria</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon} {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                <Label htmlFor="preco_aoa">Preço (AOA) * <span className="text-xs text-gray-500">(Ex: 51990,00 ou 51990.00)</span></Label>
                <Input
                  id="preco_aoa"
                  type="text"
                  placeholder="Ex: 51 990,00"
                  value={priceInput}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    console.log('[ProductForm] Input recebido:', rawValue);
                    
                    // PERMITIR apenas números, vírgulas, pontos e espaços
                    const isValid = rawValue === '' || /^[0-9,.\s]+$/.test(rawValue);
                    console.log('[ProductForm] Regex válida?', isValid);
                    
                    if (!isValid) {
                      console.log('[ProductForm] Bloqueado - caracteres inválidos');
                      return;
                    }
                    
                    // Atualizar input visual (mantém vírgulas/pontos enquanto digita)
                    setPriceInput(rawValue);
                    
                    // Converter para número: remover espaços e trocar vírgula por ponto
                    const cleanValue = rawValue.replace(/\s/g, '').replace(',', '.');
                    const numValue = parseFloat(cleanValue);
                    console.log('[ProductForm] Valor convertido:', numValue);
                    
                    // Atualizar formData com número
                    if (!isNaN(numValue) && numValue >= 0) {
                      setFormData(prev => ({ ...prev, preco_aoa: numValue }));
                    } else if (rawValue === '' || rawValue === '0') {
                      setFormData(prev => ({ ...prev, preco_aoa: 0 }));
                    }
                  }}
                  onBlur={() => {
                    // Ao sair do campo, formata o valor
                    if (formData.preco_aoa > 0) {
                      setPriceInput(formData.preco_aoa.toString());
                    }
                  }}
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

          {/* 🚚 Configurações de Frete */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              🚚 Configurações de Frete
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Tipo de Frete *</Label>
                <select
                  value={formData.shipping_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="free">Frete Grátis 🎁</option>
                  <option value="paid">Frete Pago 💰</option>
                </select>
              </div>

              {formData.shipping_type === 'paid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="shipping_cost_aoa">Custo de Frete (AOA) <span className="text-xs">(Ex: 5000 ou 5.000,00)</span></Label>
                    <Input
                      id="shipping_cost_aoa"
                      type="text"
                      placeholder="Ex: 5 000,00"
                      value={shippingCostAoaInput}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue !== '' && !/^[0-9,.\s]+$/.test(rawValue)) return;
                        
                        setShippingCostAoaInput(rawValue);
                        
                        const cleanValue = rawValue.replace(/\s/g, '').replace(',', '.');
                        const numValue = parseFloat(cleanValue);
                        
                        if (!isNaN(numValue) && numValue >= 0) {
                          setFormData(prev => ({ ...prev, shipping_cost_aoa: numValue }));
                        } else if (rawValue === '' || rawValue === '0') {
                          setFormData(prev => ({ ...prev, shipping_cost_aoa: 0 }));
                        }
                      }}
                      onBlur={() => {
                        if (formData.shipping_cost_aoa > 0) {
                          setShippingCostAoaInput(formData.shipping_cost_aoa.toString());
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shipping_cost_usd">Custo de Frete (USD) <span className="text-xs">(Ex: 5.00 ou 5,00)</span></Label>
                    <Input
                      id="shipping_cost_usd"
                      type="text"
                      placeholder="Ex: 5,00"
                      value={shippingCostUsdInput}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue !== '' && !/^[0-9,.\s]+$/.test(rawValue)) return;
                        
                        setShippingCostUsdInput(rawValue);
                        
                        const cleanValue = rawValue.replace(/\s/g, '').replace(',', '.');
                        const numValue = parseFloat(cleanValue);
                        
                        if (!isNaN(numValue) && numValue >= 0) {
                          setFormData(prev => ({ ...prev, shipping_cost_usd: numValue }));
                        } else if (rawValue === '' || rawValue === '0') {
                          setFormData(prev => ({ ...prev, shipping_cost_usd: 0 }));
                        }
                      }}
                      onBlur={() => {
                        if (formData.shipping_cost_usd > 0) {
                          setShippingCostUsdInput(formData.shipping_cost_usd.toString());
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {formData.shipping_type === 'free' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <span>Este produto tem <strong>FRETE GRÁTIS</strong> para todo o país!</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configurações de Pré-venda */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_pre_order"
                checked={formData.is_pre_order}
                onChange={(e) => setFormData(prev => ({ ...prev, is_pre_order: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_pre_order" className="font-semibold text-base cursor-pointer">
                📦 Disponível para Pré-venda
              </Label>
            </div>
            
            {formData.is_pre_order && (
              <div className="ml-7 space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Este produto aparecerá na página de pré-vendas e clientes poderão reservá-lo pagando um sinal.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pre_order_estimated_arrival">Chegada Estimada</Label>
                    <Input
                      id="pre_order_estimated_arrival"
                      type="text"
                      placeholder="Ex: 15-30 dias, Janeiro 2026"
                      value={formData.pre_order_estimated_arrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, pre_order_estimated_arrival: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Quando o produto deve chegar</p>
                  </div>

                  <div>
                    <Label htmlFor="pre_order_deposit_percentage">Percentual de Sinal (%)</Label>
                    <Input
                      id="pre_order_deposit_percentage"
                      type="number"
                      min="10"
                      max="100"
                      value={formData.pre_order_deposit_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, pre_order_deposit_percentage: parseInt(e.target.value) || 30 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Valor que o cliente paga antecipadamente</p>
                  </div>
                </div>
              </div>
            )}
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