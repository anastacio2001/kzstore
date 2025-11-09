import { useState, useEffect } from 'react';
import { Zap, Plus, Edit, Trash2, Power, Clock, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../utils/supabase/client';
import { Product } from '../../App';

interface FlashSale {
  id: string;
  title: string;
  description: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  stock_limit: number;
  stock_sold: number;
  is_active: boolean;
  products?: {
    nome: string;
    preco_aoa: number;
  };
}

interface FlashSaleFormData {
  title: string;
  description: string;
  product_id: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  stock_limit: number;
  is_active: boolean;
}

interface FlashSaleManagerProps {
  products: Product[];
}

export function FlashSaleManager({ products }: FlashSaleManagerProps) {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState<FlashSaleFormData>({
    title: '',
    description: '',
    product_id: '',
    discount_percentage: 10,
    start_date: '',
    end_date: '',
    stock_limit: 50,
    is_active: true,
  });

  // Load flash sales usando Supabase SDK com JOIN de produtos
  const loadFlashSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products (
            nome,
            preco_aoa
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      setFlashSales(data || []);
      console.log('✅ Flash Sales loaded:', data?.length);
    } catch (error) {
      console.error('Error loading flash sales:', error);
      alert('Erro ao carregar flash sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashSales();
  }, []);

  useEffect(() => {
    console.log('📦 Products received in FlashSaleManager:', products.length);
    products.forEach(p => console.log(`  - ${p.name} (${p.id})`));
  }, [products]);

  // Create or update flash sale usando Supabase SDK
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFlashSale) {
        // Update existing flash sale
        const { data, error } = await supabase
          .from('flash_sales')
          .update(formData)
          .eq('id', editingFlashSale.id)
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Flash Sale updated:', data);
      } else {
        // Create new flash sale
        const payload = { ...formData, stock_sold: 0 };
        const { data, error } = await supabase
          .from('flash_sales')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Flash Sale created:', data);
      }

      // Reload flash sales
      await loadFlashSales();

      // Reset form
      setShowForm(false);
      setEditingFlashSale(null);
      setFormData({
        title: '',
        description: '',
        product_id: '',
        discount_percentage: 10,
        start_date: '',
        end_date: '',
        stock_limit: 50,
        is_active: true,
      });

      alert(editingFlashSale ? 'Flash Sale atualizada!' : 'Flash Sale criada!');
    } catch (error) {
      console.error('Error saving flash sale:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar Flash Sale');
    }
  };

  // Delete flash sale usando Supabase SDK
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta Flash Sale?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadFlashSales();
      alert('Flash Sale excluída!');
      console.log('✅ Flash Sale deleted:', id);
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      alert('Erro ao excluir Flash Sale');
    }
  };

  // Toggle active status usando Supabase SDK
  const handleToggleActive = async (flashSale: FlashSale) => {
    try {
      const { error } = await supabase
        .from('flash_sales')
        .update({ is_active: !flashSale.is_active })
        .eq('id', flashSale.id);

      if (error) throw error;

      await loadFlashSales();
      console.log('✅ Flash Sale toggled:', flashSale.id, !flashSale.is_active);
    } catch (error) {
      console.error('Error toggling flash sale:', error);
      alert('Erro ao alterar status da Flash Sale');
    }
  };

  // Edit flash sale
  const handleEdit = (flashSale: FlashSale) => {
    setEditingFlashSale(flashSale);
    setFormData({
      title: flashSale.title,
      description: flashSale.description,
      product_id: flashSale.product_id,
      discount_percentage: flashSale.discount_percentage,
      start_date: flashSale.start_date,
      end_date: flashSale.end_date,
      stock_limit: flashSale.stock_limit,
      is_active: flashSale.is_active,
    });
    setShowForm(true);
  };

  // Get product name by ID - usa dados do JOIN quando disponível
  const getProductName = (flashSale: FlashSale) => {
    // Tenta usar os dados do JOIN primeiro
    if (flashSale.products?.nome) {
      return flashSale.products.nome;
    }
    // Fallback para buscar na lista de produtos
    const product = products.find((p) => p.id === flashSale.product_id);
    return product?.name || 'Produto desconhecido';
  };

  // Calculate stock percentage
  const getStockPercentage = (flashSale: FlashSale) => {
    return ((flashSale.stock_sold / flashSale.stock_limit) * 100).toFixed(0);
  };

  // Check if flash sale is active now
  const isActiveNow = (flashSale: FlashSale) => {
    if (!flashSale.is_active) return false;
    const now = new Date();
    const start = new Date(flashSale.start_date);
    const end = new Date(flashSale.end_date);
    return now >= start && now <= end;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31E24] mb-4"></div>
          <p className="text-gray-600">Carregando Flash Sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-orange-500" />
            Flash Sales
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie ofertas relâmpago com tempo limitado
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingFlashSale(null);
            setFormData({
              title: '',
              description: '',
              product_id: '',
              discount_percentage: 10,
              start_date: '',
              end_date: '',
              stock_limit: 50,
              is_active: true,
            });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          <Plus className="mr-2 size-4" />
          Nova Flash Sale
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold mb-4">
            {editingFlashSale ? 'Editar Flash Sale' : 'Nova Flash Sale'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Super Flash Sale - Black Friday"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descreva a oferta..."
                rows={3}
              />
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Produto *
              </label>
              <select
                value={formData.product_id}
                onChange={(e) =>
                  setFormData({ ...formData, product_id: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.preco_aoa.toLocaleString()} AOA
                  </option>
                ))}
              </select>
            </div>

            {/* Discount and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Desconto (%) *
                </label>
                <input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_percentage: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  max="99"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Estoque Limite *
                </label>
                <input
                  type="number"
                  value={formData.stock_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock_limit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data/Hora Início *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data/Hora Fim *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Ativar Flash Sale
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {editingFlashSale ? 'Atualizar' : 'Criar'} Flash Sale
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingFlashSale(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Flash Sales List */}
      <div className="space-y-4">
        {flashSales.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Zap className="mx-auto mb-4 size-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma Flash Sale criada
            </h3>
            <p className="text-gray-500">
              Crie sua primeira oferta relâmpago para impulsionar as vendas!
            </p>
          </div>
        ) : (
          flashSales.map((flashSale) => (
            <div
              key={flashSale.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                isActiveNow(flashSale)
                  ? 'border-green-500'
                  : flashSale.is_active
                  ? 'border-orange-500'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{flashSale.title}</h3>
                    {isActiveNow(flashSale) && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse">
                        🔥 ATIVA AGORA
                      </span>
                    )}
                    {flashSale.is_active && !isActiveNow(flashSale) && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        ⏰ Agendada
                      </span>
                    )}
                    {!flashSale.is_active && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        ⏸️ Pausada
                      </span>
                    )}
                  </div>

                  {flashSale.description && (
                    <p className="text-gray-600 mb-3">{flashSale.description}</p>
                  )}

                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Produto</p>
                        <p className="font-semibold">
                          {getProductName(flashSale)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Desconto</p>
                        <p className="font-semibold text-orange-600">
                          {flashSale.discount_percentage}% OFF
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Período</p>
                        <p className="text-sm">
                          {formatDate(flashSale.start_date)} até{' '}
                          {formatDate(flashSale.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stock Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">
                        Estoque vendido
                      </p>
                      <p className="text-xs font-semibold">
                        {flashSale.stock_sold} / {flashSale.stock_limit} (
                        {getStockPercentage(flashSale)}%)
                      </p>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
                        style={{
                          width: `${getStockPercentage(flashSale)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(flashSale)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(flashSale)}
                    className={
                      flashSale.is_active
                        ? 'border-orange-500 text-orange-600 hover:bg-orange-50'
                        : 'border-green-500 text-green-600 hover:bg-green-50'
                    }
                  >
                    <Power className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flashSale.id)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
