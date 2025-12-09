import { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2, Calendar, Package, TrendingDown, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFlashSales } from '../../hooks/useFlashSales';

type Product = {
  id: string;
  nome: string;
  preco_aoa: number;
  imagem_url: string;
  estoque: number;
};

type FlashSalesManagerProps = {
  accessToken?: string;
  products: Product[];
};

export function FlashSalesManager({ accessToken, products }: FlashSalesManagerProps) {
  const { flashSales, loading, fetchFlashSales, createFlashSale, updateFlashSale, deleteFlashSale } = useFlashSales();
  const [showForm, setShowForm] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    description: '',
    discount_percentage: 20,
    stock_limit: 10,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    loadFlashSales();
  }, []);

  const loadFlashSales = async () => {
    await fetchFlashSales();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProduct = products.find(p => p.id === formData.product_id);
    if (!selectedProduct) {
      alert('Selecione um produto válido');
      return;
    }

    const originalPrice = selectedProduct.preco_aoa;
    const discountedPrice = Math.round(originalPrice * (1 - formData.discount_percentage / 100));

    const flashSaleData = {
      productId: formData.product_id,
      productName: selectedProduct.nome,
      originalPrice: originalPrice,
      salePrice: discountedPrice,
      discountPercent: formData.discount_percentage,
      stock: formData.stock_limit,
      startDate: new Date(formData.start_date).toISOString(),
      endDate: new Date(formData.end_date).toISOString(),
      isActive: formData.is_active,
    };

    try {
      if (editingFlashSale) {
        await updateFlashSale(editingFlashSale.id, flashSaleData);
      } else {
        await createFlashSale(flashSaleData);
      }
      await loadFlashSales();
      setShowForm(false);
      setEditingFlashSale(null);
      resetForm();
    } catch (error) {
      console.error('Error saving flash sale:', error);
    }
  };

  const handleEdit = (flashSale: any) => {
    setEditingFlashSale(flashSale);
    
    // 🔥 CORRIGIDO: Hook retorna camelCase, então usamos startDate/endDate
    const startDate = flashSale.startDate || flashSale.start_date;
    const endDate = flashSale.endDate || flashSale.end_date;
    
    setFormData({
      product_id: flashSale.productId || flashSale.product_id,
      title: flashSale.title || `Flash Sale - ${flashSale.productName || flashSale.product_name}`,
      description: flashSale.description || '',
      discount_percentage: flashSale.discountPercent || flashSale.discount_percentage,
      stock_limit: flashSale.stock || flashSale.stock_limit,
      start_date: startDate ? (startDate.split('T')[0] + 'T' + startDate.split('T')[1].slice(0, 5)) : '',
      end_date: endDate ? (endDate.split('T')[0] + 'T' + endDate.split('T')[1].slice(0, 5)) : '',
      is_active: flashSale.isActive !== undefined ? flashSale.isActive : flashSale.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta flash sale?')) return;

    setDeleting(id);
    try {
      await deleteFlashSale(id);
      await loadFlashSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      title: '',
      description: '',
      discount_percentage: 20,
      stock_limit: 10,
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isActive = (flashSale: any) => {
    // 🔥 CORRIGIDO: Aceitar ambos os formatos
    const isActiveFlag = flashSale.isActive !== undefined ? flashSale.isActive : flashSale.is_active;
    if (!isActiveFlag) return false;
    
    const now = new Date();
    const start = new Date(flashSale.startDate || flashSale.start_date);
    const end = new Date(flashSale.endDate || flashSale.end_date);
    const stockSold = flashSale.soldCount || flashSale.stock_sold || 0;
    const stockLimit = flashSale.stock || flashSale.stock_limit;
    
    return now >= start && now <= end && stockSold < stockLimit;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="size-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando flash sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="size-6 text-yellow-500 fill-yellow-500" />
            Gestão de Flash Sales
          </h2>
          <p className="text-gray-600 mt-1">Crie ofertas relâmpago para impulsionar vendas</p>
        </div>
        <Button onClick={() => {
          setShowForm(true);
          setEditingFlashSale(null);
          resetForm();
        }}>
          <Plus className="size-4 mr-2" />
          Nova Flash Sale
        </Button>
      </div>

      {/* Flash Sales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashSales.map((flashSale) => {
          const active = isActive(flashSale);
          // 🔥 CORRIGIDO: Aceitar ambos os formatos
          const stockLimit = flashSale.stock || flashSale.stock_limit;
          const stockSold = flashSale.soldCount || flashSale.stock_sold || 0;
          const stockPercentage = ((stockLimit - stockSold) / stockLimit) * 100;

          return (
            <div key={flashSale.id} className={`bg-white rounded-xl border-2 overflow-hidden ${
              active ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
            }`}>
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {flashSale.product_image ? (
                  <img
                    src={flashSale.product_image}
                    alt={flashSale.product_name || flashSale.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Sem+Imagem';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <Package className="size-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Sem imagem</p>
                    </div>
                  </div>
                )}
                {active && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                    <Zap className="size-4 fill-white" />
                    ATIVA
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-red-600">
                  -{flashSale.discount_percentage || flashSale.discountPercent}%
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-lg line-clamp-1">{flashSale.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{flashSale.product_name || flashSale.productName}</p>

                {/* Prices */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-600">{formatPrice(flashSale.discounted_price || flashSale.salePrice)}</span>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(flashSale.original_price || flashSale.originalPrice)}</span>
                </div>

                {/* Stock Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Estoque</span>
                    <span className="font-medium">
                      {stockLimit - stockSold} de {stockLimit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Início: {formatDate(flashSale.start_date || flashSale.startDate)}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Fim: {formatDate(flashSale.end_date || flashSale.endDate)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(flashSale)}
                    className="flex-1"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flashSale.id)}
                    disabled={deleting === flashSale.id}
                    className="text-red-600 hover:bg-red-50"
                  >
                    {deleting === flashSale.id ? (
                      <div className="size-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {flashSales.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Zap className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma flash sale criada</p>
            <Button onClick={() => {
              setShowForm(true);
              setEditingFlashSale(null);
              resetForm();
            }}>
              <Plus className="size-4 mr-2" />
              Criar Primeira Flash Sale
            </Button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingFlashSale ? 'Editar Flash Sale' : 'Nova Flash Sale'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingFlashSale(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="product">Produto *</Label>
                <select
                  id="product"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nome} - {formatPrice(product.preco_aoa)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="title">Título da Oferta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Flash Sale 50% OFF - Mini PC Intel"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Oferta válida por tempo limitado!"
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Desconto (%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="90"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Estoque Limitado *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    value={formData.stock_limit || ''}
                    onChange={(e) => setFormData({ ...formData, stock_limit: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start">Data/Hora Início *</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end">Data/Hora Fim *</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="size-4"
                />
                <Label htmlFor="active" className="cursor-pointer">Ativar imediatamente</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFlashSale ? 'Salvar Alterações' : 'Criar Flash Sale'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFlashSale(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}