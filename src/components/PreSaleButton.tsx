import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Package, Bell } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../hooks/useAuth';

interface PreSale {
  id: string;
  product_id: string;
  is_active: boolean;
  release_date: string;
  deposit_percentage: number;
  stock_limit: number;
  stock_reserved: number;
}

interface PreSaleReservation {
  id: string;
  product_id: string;
  status: string;
}

interface PreSaleButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function PreSaleButton({ productId, productName, productPrice, onShowToast }: PreSaleButtonProps) {
  const { user } = useAuth();
  const [preSale, setPreSale] = useState<PreSale | null>(null);
  const [hasReservation, setHasReservation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: ''
  });

  useEffect(() => {
    loadPreSale();
    if (user) {
      checkExistingReservation();
    }
  }, [productId, user]);

  const loadPreSale = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_sale_products')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading pre-sale:', error);
        return;
      }

      if (data) {
        setPreSale(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkExistingReservation = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('pre_sale_reservations')
        .select('id, status')
        .eq('product_id', productId)
        .eq('customer_email', user.email)
        .in('status', ['pending', 'deposit_paid'])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking reservation:', error);
        return;
      }

      setHasReservation(!!data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      onShowToast('Faça login para reservar', 'error');
      return;
    }

    if (!formData.name || !formData.phone) {
      onShowToast('Preencha todos os campos', 'error');
      return;
    }

    if (!preSale) return;

    setLoading(true);

    try {
      const depositAmount = (productPrice * preSale.deposit_percentage) / 100;
      const remainingAmount = productPrice - depositAmount;

      const { error } = await supabase
        .from('pre_sale_reservations')
        .insert({
          pre_sale_id: preSale.id,
          customer_email: formData.email,
          customer_name: formData.name,
          customer_phone: formData.phone,
          product_id: productId,
          product_name: productName,
          product_price: productPrice,
          deposit_amount: depositAmount,
          remaining_amount: remainingAmount,
          status: 'pending'
        });

      if (error) throw error;

      onShowToast('Reserva criada com sucesso! Entre em contacto para pagamento do sinal.', 'success');
      setHasReservation(true);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      onShowToast(error.message || 'Erro ao criar reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!preSale) return null;

  const spotsLeft = preSale.stock_limit - preSale.stock_reserved;
  const depositAmount = (productPrice * preSale.deposit_percentage) / 100;
  const releaseDate = new Date(preSale.release_date);

  if (hasReservation) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <Package size={20} />
            <span className="font-semibold">Reserva Ativa</span>
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2">
          Você já tem uma reserva para este produto
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-500 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            <span className="font-bold text-purple-900">PRÉ-VENDA DISPONÍVEL</span>
          </div>
          {spotsLeft <= 5 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              Últimas {spotsLeft} vagas!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} />
            <div>
              <p className="text-xs text-gray-500">Lançamento</p>
              <p className="font-semibold">{releaseDate.toLocaleDateString('pt-AO')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign size={16} />
            <div>
              <p className="text-xs text-gray-500">Sinal ({preSale.deposit_percentage}%)</p>
              <p className="font-semibold">{depositAmount.toLocaleString('pt-AO')} Kz</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Package size={16} />
          <span>{spotsLeft} de {preSale.stock_limit} vagas disponíveis</span>
        </div>

        <button
          onClick={() => setShowForm(true)}
          disabled={spotsLeft === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Bell size={18} />
          {spotsLeft === 0 ? 'Esgotado' : 'Reservar Agora'}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Pague apenas {preSale.deposit_percentage}% agora e garanta o seu!
        </p>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reservar Pré-Venda</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="seu@email.com"
                  disabled={!!user}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="+244 9XX XXX XXX"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Sinal:</span> {depositAmount.toLocaleString('pt-AO')} Kz<br />
                  <span className="font-semibold">Restante:</span> {(productPrice - depositAmount).toLocaleString('pt-AO')} Kz<br />
                  <span className="text-xs text-gray-500">Total: {productPrice.toLocaleString('pt-AO')} Kz</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
