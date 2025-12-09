import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, BarChart3, ArrowLeft, LayoutDashboard, Megaphone, UserCog, Tag, Zap, Sparkles, LogOut, Ticket, Repeat, FileText, Bell, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useAdminData, setAuthToken } from '../hooks/useAdminData';
import { AdminDashboard } from './admin/AdminDashboard'; // 🔥 CORRIGIDO: Usar a versão COMPLETA do admin
import { ProductForm } from './ProductForm';
import { OrderManagement } from './OrderManagement';
import { AdsManager } from './AdsManager';
import { TeamManager } from './TeamManager';
import { OrderManagementComplete } from './admin/OrderManagementComplete';
import { FlashSalesManager } from './admin/FlashSalesManager';
import { FlashSaleBanner } from './FlashSaleBanner';
import { CouponsManager } from './admin/CouponsManager';
import AdvancedFeaturesAdmin from './admin/AdvancedFeaturesAdmin';
import PreOrdersManager from './admin/PreOrdersManager';
import TradeInManager from './admin/TradeInManager';
import QuotesManager from './admin/QuotesManager';
import TicketsManager from './admin/TicketsManager';
import AffiliatesManager from './admin/AffiliatesManager';
import { NewsletterManager } from './admin/NewsletterManager';

type AdminPanelProps = {
  onBack: () => void;
  onLogout?: () => void;
};

type Tab = 'dashboard' | 'products' | 'orders' | 'coupons' | 'flash-sales' | 'customers' | 'ads' | 'team' | 'tickets' | 'pre-orders' | 'trade-in' | 'quotes' | 'affiliates' | 'newsletter' | 'advanced-features';

export function AdminPanel({ onBack, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);

  const { user, isAdmin } = useAuth();
  
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
  } = useAdminData();

  // Debug: Log user info
  useEffect(() => {
    if (user) {
      console.log('👤 Admin User Info:', {
        email: user.email,
        name: user.name,
        provider: user.app_metadata?.provider,
        userId: user.id
      });
    }
  }, [user]);

  // Set auth token when user changes and fetch data
  useEffect(() => {
    // Fetch admin data when the logged-in user is an admin
    if (user && isAdmin()) {
      console.log('🔐 Admin user signed in, fetching admin data:', { email: user.email, id: user.id });
      if (user.access_token) {
        setAuthToken(user.access_token);
      } else {
        console.log('⚠️ No access_token present on user; proceeding with cookie-based session');
      }

      // Small delay to ensure any state is set before fetching
      setTimeout(() => {
        console.log('📊 Fetching admin data (products, orders, customers)...');
        fetchProducts();
        fetchOrders();
        fetchCustomers();
      }, 100);
    }
  }, [user, isAdmin]);

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      toast('Produto criado com sucesso!');
      setShowProductForm(false);
      fetchProducts();
    } catch (error) {
      toast('Erro ao criar produto: ' + String(error));
    }
  };

  const handleRefreshData = () => {
    console.log('🔄 Refreshing all admin data...');
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    toast('Dados atualizados!');
  };

  const handleClearCacheAndReload = () => {
    if (confirm('Isso irá limpar o cache e recarregar a página. Continuar?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flash Sale Banner */}
      <FlashSaleBanner />
      
      {/* Header - Mobile Optimized */}
      <header className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0 px-2 sm:px-3">
                <ArrowLeft className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <h1 className="text-base sm:text-2xl font-bold text-[#E31E24] truncate">
                <span className="hidden sm:inline">Painel Admin - KZSTORE</span>
                <span className="sm:hidden">Admin</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Debug Info */}
              <div className="hidden md:flex items-center gap-2 text-xs bg-gray-100 px-3 py-1 rounded">
                <span className="font-semibold">User ID:</span>
                <span className="text-gray-600">{user?.id?.substring(0, 8)}...</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="flex-shrink-0 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">🔄 Atualizar</span>
                <span className="sm:hidden">🔄</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCacheAndReload}
                className="flex-shrink-0 px-2 sm:px-3 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <span className="hidden sm:inline">🗑️ Limpar Cache</span>
                <span className="sm:hidden">🗑️</span>
              </Button>
              
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">
                {user?.email || user?.name || 'Admin'}
              </span>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="flex-shrink-0 px-2 sm:px-3"
                >
                  <LogOut className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Data Info Bar */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            <span>📊 <strong>Produtos:</strong> {products.length}</span>
            <span>📦 <strong>Pedidos:</strong> {orders.length}</span>
            <span>👥 <strong>Clientes:</strong> {customers.length}</span>
            <span className="ml-auto">
              🔐 Login: <strong>{user?.app_metadata?.provider || 'Email'}</strong>
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}