import { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle, Calendar, DollarSign, Phone, Mail, User } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface PreSale {
  id: string;
  product_id: string;
  is_active: boolean;
  release_date: string;
  deposit_percentage: number;
  stock_limit: number;
  stock_reserved: number;
  created_at: string;
}

interface Reservation {
  id: string;
  pre_sale_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  product_id: string;
  product_name: string;
  product_price: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
}

export function PreSaleManager() {
  const [preSales, setPreSales] = useState<PreSale[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPreSale, setSelectedPreSale] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_id: '',
    release_date: '',
    deposit_percentage: 30,
    stock_limit: 10
  });

  useEffect(() => {
    loadPreSales();
    loadReservations();
  }, []);

  const loadPreSales = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_sale_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreSales(data || []);
    } catch (error) {
      console.error('Error loading pre-sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_sale_reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleCreatePreSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('pre_sale_products')
        .insert({
          product_id: formData.product_id,
          release_date: formData.release_date,
          deposit_percentage: formData.deposit_percentage,
          stock_limit: formData.stock_limit,
          is_active: true
        });

      if (error) throw error;

      alert('Pré-venda criada com sucesso!');
      setShowCreateForm(false);
      setFormData({ product_id: '', release_date: '', deposit_percentage: 30, stock_limit: 10 });
      loadPreSales();
    } catch (error: any) {
      console.error('Error creating pre-sale:', error);
      alert(error.message || 'Erro ao criar pré-venda');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreSale = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pre_sale_products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadPreSales();
    } catch (error: any) {
      console.error('Error toggling pre-sale:', error);
      alert(error.message);
    }
  };

  const handleUpdateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pre_sale_reservations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      loadReservations();
      alert('Status atualizado!');
    } catch (error: any) {
      console.error('Error updating reservation:', error);
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      deposit_paid: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      deposit_paid: 'Sinal Pago',
      completed: 'Completo',
      cancelled: 'Cancelado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredReservations = selectedPreSale
    ? reservations.filter(r => r.pre_sale_id === selectedPreSale)
    : reservations;

  const stats = {
    totalPreSales: preSales.length,
    activePreSales: preSales.filter(p => p.is_active).length,
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    completedReservations: reservations.filter(r => r.status === 'completed').length,
    totalRevenue: reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.product_price, 0)
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Pré-Vendas</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Clock size={18} />
          Nova Pré-Venda
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Pré-Vendas Ativas</p>
          <p className="text-2xl font-bold text-purple-600">{stats.activePreSales}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Reservas</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalReservations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingReservations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Completas</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedReservations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border col-span-2">
          <p className="text-sm text-gray-600">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalRevenue.toLocaleString('pt-AO')} Kz</p>
        </div>
      </div>

      {/* Lista de Pré-Vendas */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Produtos em Pré-Venda</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lançamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vagas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {preSales.map((preSale) => (
                <tr key={preSale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{preSale.product_id}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(preSale.release_date).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-4 py-3 text-sm">{preSale.deposit_percentage}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={preSale.stock_reserved >= preSale.stock_limit ? 'text-red-600 font-semibold' : ''}>
                      {preSale.stock_reserved} / {preSale.stock_limit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {preSale.is_active ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} /> Ativa
                      </span>
                    ) : (
                      <span className="text-gray-600 flex items-center gap-1">
                        <XCircle size={16} /> Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleTogglePreSale(preSale.id, preSale.is_active)}
                      className="text-purple-600 hover:underline"
                    >
                      {preSale.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => setSelectedPreSale(preSale.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver Reservas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Reservas {selectedPreSale && `(Filtrado)`}
          </h3>
          {selectedPreSale && (
            <button
              onClick={() => setSelectedPreSale(null)}
              className="text-sm text-gray-600 hover:underline"
            >
              Ver Todas
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium">{reservation.customer_name}</div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {reservation.customer_email}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <Phone size={12} /> {reservation.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{reservation.product_name}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {reservation.product_price.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 font-semibold">
                    {reservation.deposit_amount.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(reservation.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(reservation.created_at).toLocaleDateString('pt-AO')}
                  </td>
                  <td className="px-4 py-3">
                    {reservation.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReservationStatus(reservation.id, 'deposit_paid')}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Marcar Pago
                        </button>
                        <button
                          onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelled')}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {reservation.status === 'deposit_paid' && (
                      <button
                        onClick={() => handleUpdateReservationStatus(reservation.id, 'completed')}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Finalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Pré-Venda */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Criar Nova Pré-Venda</h3>
            <form onSubmit={handleCreatePreSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product ID</label>
                <input
                  type="text"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="UUID do produto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Lançamento</label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Percentual de Sinal (%)</label>
                <input
                  type="number"
                  value={formData.deposit_percentage}
                  onChange={(e) => setFormData({ ...formData, deposit_percentage: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="10"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Limite de Vagas</label>
                <input
                  type="number"
                  value={formData.stock_limit}
                  onChange={(e) => setFormData({ ...formData, stock_limit: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Pré-Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
