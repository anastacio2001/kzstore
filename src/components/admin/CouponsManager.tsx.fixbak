import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Copy, Check, X, Calendar, Percent, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { copyToClipboard } from '../../utils/clipboard';
import { useCoupons } from '../../hooks/useCoupons';

type CouponsManagerProps = {
  accessToken?: string;
};

export function CouponsManager({ accessToken }: CouponsManagerProps) {
  const { coupons, loading, fetchCoupons, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minimum_order_value: 0,
    max_discount: 0,
    usage_limit: 0,
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    await fetchCoupons();
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discount_type: formData.type,
      discount_value: formData.value,
      minimum_order_value: formData.minimum_order_value || null,
      max_discount: formData.max_discount || null,
      usage_limit: formData.usage_limit || null,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_until: new Date(formData.valid_until).toISOString(),
      is_active: formData.is_active,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
      } else {
        await createCoupon(couponData);
      }
      
      await loadCoupons();
      setShowForm(false);
      setEditingCoupon(null);
      resetForm();
    } catch (error) {
      console.error('❌ Error saving coupon:', error);
      alert(`Erro ao salvar cupom: ${String(error)}`);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    
    // Format dates safely
    const formatDateForInput = (dateString: string | undefined) => {
      if (!dateString) {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      }
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          const now = new Date();
          return now.toISOString().slice(0, 16);
        }
        return date.toISOString().slice(0, 16);
      } catch (error) {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      }
    };
    
    // 🔥 CORRIGIDO: Hook retorna camelCase, aceitar ambos formatos
    setFormData({
      code: coupon.code || '',
      type: coupon.discountType || coupon.type || coupon.discount_type || 'percentage',
      value: coupon.discountValue || coupon.value || coupon.discount_value || 0,
      minimum_order_value: coupon.minPurchase || coupon.minimum_order_value || 0,
      max_discount: coupon.maxDiscount || coupon.max_discount || 0,
      usage_limit: coupon.usageLimit || coupon.usage_limit || 0,
      valid_from: formatDateForInput(coupon.startDate || coupon.valid_from || coupon.start_date),
      valid_until: formatDateForInput(coupon.endDate || coupon.valid_until || coupon.end_date),
      is_active: coupon.isActive !== undefined ? coupon.isActive : (coupon.is_active !== false),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    setDeleting(id);
    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setDeleting(null);
    }
  };

  const copyCode = async (code: string) => {
    await copyToClipboard(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minimum_order_value: 0,
      max_discount: 0,
      usage_limit: 0,
      valid_from: '',
      valid_until: '',
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
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isValid = (coupon: any) => {
    // 🔥 CORRIGIDO: Aceitar ambos os formatos
    const isActive = coupon.isActive !== undefined ? coupon.isActive : coupon.is_active;
    if (!isActive) return false;
    
    const now = new Date();
    const validFrom = new Date(coupon.startDate || coupon.valid_from || coupon.start_date);
    const validUntil = new Date(coupon.endDate || coupon.valid_until || coupon.end_date);
    const usageCount = coupon.usageCount || coupon.usage_count || 0;
    const usageLimit = coupon.usageLimit || coupon.usage_limit;
    const hasUsageLeft = !usageLimit || usageCount < usageLimit;
    
    return now >= validFrom && now <= validUntil && hasUsageLeft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="size-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cupons...</p>
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
            <Tag className="size-6 text-blue-600" />
            Gestão de Cupons
          </h2>
          <p className="text-gray-600 mt-1">Crie e gerencie códigos promocionais</p>
        </div>
        <Button onClick={() => {
          setShowForm(true);
          setEditingCoupon(null);
          resetForm();
        }}>
          <Plus className="size-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => {
                const valid = isValid(coupon);
                
                // 🔥 CORRIGIDO: Normalizar acesso aos campos
                const discountType = coupon.discountType || coupon.type || coupon.discount_type || 'percentage';
                const discountValue = coupon.discountValue || coupon.value || coupon.discount_value || 0;
                const minPurchase = coupon.minPurchase || coupon.minimum_order_value;
                const usageCount = coupon.usageCount || coupon.usage_count || 0;
                const usageLimit = coupon.usageLimit || coupon.usage_limit;
                const validFrom = coupon.startDate || coupon.valid_from || coupon.start_date;
                const validUntil = coupon.endDate || coupon.valid_until || coupon.end_date;
                
                return (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm font-bold">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="size-4 text-green-600" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {discountType === 'percentage' ? (
                          <>
                            <Percent className="size-4 text-blue-600" />
                            <span className="font-semibold">{discountValue}%</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="size-4 text-green-600" />
                            <span className="font-semibold">{formatPrice(discountValue)}</span>
                          </>
                        )}
                      </div>
                      {minPurchase && (
                        <p className="text-xs text-gray-500 mt-1">
                          Mín: {formatPrice(minPurchase)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {usageCount} / {usageLimit || '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">{formatDate(validFrom)}</p>
                        <p className="text-gray-600">{formatDate(validUntil)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        valid
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {valid ? 'Ativo' : 'Inativo'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit2 className="size-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                          disabled={deleting === coupon.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {deleting === coupon.id ? (
                            <div className="size-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {coupons.length === 0 && (
            <div className="text-center py-12">
              <Tag className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum cupom criado</p>
              <Button onClick={() => {
                setShowForm(true);
                setEditingCoupon(null);
                resetForm();
              }}>
                <Plus className="size-4 mr-2" />
                Criar Primeiro Cupom
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
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
                <Label htmlFor="code">Código do Cupom *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: PRIMEIRACOMPRA"
                    className="flex-1"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Gerar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use apenas letras maiúsculas e números</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Desconto *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (AOA)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="value">
                    Valor {formData.type === 'percentage' ? '(%)' : '(AOA)'} *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min">Compra Mínima (AOA)</Label>
                  <Input
                    id="min"
                    type="number"
                    min="0"
                    value={formData.minimum_order_value}
                    onChange={(e) => setFormData({ ...formData, minimum_order_value: parseInt(e.target.value) || 0 })}
                    placeholder="0 = sem mínimo"
                  />
                </div>

                <div>
                  <Label htmlFor="max">Desconto Máximo (AOA)</Label>
                  <Input
                    id="max"
                    type="number"
                    min="0"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: parseInt(e.target.value) || 0 })}
                    placeholder="0 = sem limite"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="usage">Limite de Usos</Label>
                <Input
                  id="usage"
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                  placeholder="0 = ilimitado"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid-from">Válido De *</Label>
                  <Input
                    id="valid-from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valid-until">Válido Até *</Label>
                  <Input
                    id="valid-until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
                <Label htmlFor="active" className="cursor-pointer">Ativar cupom imediatamente</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
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