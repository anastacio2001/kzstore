import { useState, useEffect } from 'react';
import { ArrowLeft, LayoutDashboard, Package, ShoppingCart, Users, Plus, Edit, Trash2, Megaphone, UserCog, LogOut, Zap, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useKZStore, setAuthToken } from '../hooks/useKZStore';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProductForm } from './admin/ProductForm';
import { OrderManagement } from './admin/OrderManagement';
import { AdsManager } from './admin/AdsManager';
import { TeamManager } from './admin/TeamManager';
import { FlashSaleManager } from './admin/FlashSaleManager';
import AdminTicketsPanel from './admin/AdminTicketsPanel';
import { Product } from '../App';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

type AdminPanelProps = {
  onBack: () => void;
};

type Tab = 'dashboard' | 'products' | 'orders' | 'customers' | 'ads' | 'team' | 'flash-sales' | 'tickets';

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { user } = useAuth();
  
  const { 
    products, 
    orders, 
    customers,
    fetchProducts, 
    fetchOrders, 
    fetchCustomers,
    createProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus 
  } = useKZStore();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
  }, []);

  // Set auth token when user changes
  useEffect(() => {
    if (user?.access_token) {
      console.log('🔐 Setting auth token for admin user');
      setAuthToken(user.access_token);
    } else {
      console.log('⚠️ No auth token found, using public key');
      setAuthToken(undefined);
    }
  }, [user]);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData as Omit<Product, 'id'>);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSyncUsers = async () => {
    setSyncing(true);
    try {
      console.log('🔄 Starting user sync...');
      
      // Buscar todos os usuários autenticados
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
      }

      console.log(`� Found ${users?.length || 0} users in auth`);

      let synced = 0;
      let skipped = 0;
      let errors = 0;

      // Para cada usuário, verificar se já existe na tabela customers
      for (const user of users || []) {
        try {
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (existing) {
            skipped++;
            continue;
          }

          // Criar novo customer
          const customerData = {
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            phone: user.user_metadata?.phone || user.phone || '',
            address: user.user_metadata?.address || '',
            total_orders: 0,
            total_spent: 0
          };

          const { error: insertError } = await supabase
            .from('customers')
            .insert([customerData]);

          if (insertError) {
            console.error(`❌ Error syncing user ${user.email}:`, insertError);
            errors++;
          } else {
            console.log(`✅ Synced user: ${user.email}`);
            synced++;
          }
        } catch (err) {
          console.error(`❌ Exception syncing user:`, err);
          errors++;
        }
      }

      alert(
        `Sincronização concluída!\n\n` +
        `Total de usuários: ${users?.length || 0}\n` +
        `Sincronizados: ${synced}\n` +
        `Já existiam: ${skipped}\n` +
        `Erros: ${errors}`
      );

      // Recarregar lista de clientes
      await fetchCustomers();
    } catch (error) {
      console.error('❌ Sync exception:', error);
      alert(`Erro ao sincronizar usuários:\n${error instanceof Error ? error.message : error}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
      try {
        await supabase.auth.signOut();
        setAuthToken(undefined);
        onBack();
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Erro ao fazer logout');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header com botão voltar e logout */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 size-4" />
          Voltar
        </Button>

        {/* User info and logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm">{user.user_metadata?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white"
              >
                <LogOut className="mr-2 size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h1 className="mb-2">Painel Administrativo KZSTORE</h1>
        <p className="text-gray-600">Gerencie produtos, pedidos e clientes da sua loja</p>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="inline-block mr-2 size-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="inline-block mr-2 size-4" />
              Produtos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="inline-block mr-2 size-4" />
              Pedidos ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="inline-block mr-2 size-4" />
              Clientes ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'ads'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Megaphone className="inline-block mr-2 size-4" />
              Anúncios
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'team'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCog className="inline-block mr-2 size-4" />
              Equipe
            </button>
            <button
              onClick={() => setActiveTab('flash-sales')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'flash-sales'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="inline-block mr-2 size-4" />
              Flash Sales
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'tickets'
                  ? 'border-[#E31E24] text-[#E31E24]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="inline-block mr-2 size-4" />
              Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AdminDashboard 
          products={products}
          orders={orders}
          customers={customers}
        />
      )}

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2>Gestão de Produtos</h2>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              className="bg-[#E31E24] hover:bg-[#C71A1F]"
            >
              <Plus className="mr-2 size-4" />
              Adicionar Produto
            </Button>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Produto</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Categoria</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Preço (AOA)</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Estoque</th>
                    <th className="text-right px-6 py-3 text-sm text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Nenhum produto cadastrado. Clique em "Adicionar Produto" para começar.
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.imagem_url} 
                              alt={product.nome}
                              className="size-12 rounded object-cover"
                            />
                            <div className="max-w-xs">
                              <p className="text-sm line-clamp-1">{product.nome}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{product.descricao}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-[#FDD835] text-[#E31E24] px-2 py-1 rounded text-xs">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {product.preco_aoa.toLocaleString('pt-AO')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            product.estoque === 0 ? 'bg-red-100 text-red-700' :
                            product.estoque < 10 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {product.estoque}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
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
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="mb-6">Gestão de Pedidos</h2>
          <OrderManagement 
            orders={orders}
            onUpdateStatus={updateOrderStatus}
          />
        </div>
      )}

      {activeTab === 'customers' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="mb-0">Clientes</h2>
            <Button
              onClick={handleSyncUsers}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncing ? 'Sincronizando...' : '🔄 Sincronizar Usuários'}
            </Button>
          </div>
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Nome</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Telefone</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Email</th>
                    <th className="text-left px-6 py-3 text-sm text-gray-600">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Nenhum cliente cadastrado ainda.
                      </td>
                    </tr>
                  ) : (
                    customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{customer.nome}</td>
                        <td className="px-6 py-4 text-sm">{customer.telefone}</td>
                        <td className="px-6 py-4 text-sm text-[#E31E24]">{customer.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(customer.created_at).toLocaleDateString('pt-AO')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div>
          <h2 className="mb-6">Gestão de Anúncios</h2>
          <AdsManager />
        </div>
      )}

      {activeTab === 'team' && (
        <div>
          <h2 className="mb-6">Gestão de Equipe</h2>
          <TeamManager />
        </div>
      )}

      {activeTab === 'flash-sales' && (
        <FlashSaleManager products={products} />
      )}

      {activeTab === 'tickets' && (
        <AdminTicketsPanel />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct || undefined}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}