/**
 * 🔥 UNIFIED ADMIN PANEL - VERSÃO ÚNICA E DEFINITIVA
 * Este é o ÚNICO painel administrativo da KZSTORE
 * Criado para resolver o problema de painéis duplicados
 */

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, BarChart3, ArrowLeft, LayoutDashboard, Megaphone, UserCog, Tag, Zap, Sparkles, LogOut, Ticket, Repeat, FileText, Bell, Star, Edit2, Trash2, MessageSquare, Search, Folder, Menu, X, PenSquare, Mail, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useAdminData, setAuthToken } from '../hooks/useAdminData';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProductForm } from './admin/ProductForm'; // 🔥 CORRETO: Usar o ProductForm do admin com upload
import { OrderManagement } from './OrderManagement';
import { AdsManager } from './admin/AdsManager'; // 🔥 CORRIGIDO: Usar versão completa do admin
import { TeamManager } from './TeamManager';
import { HeroSettingsManager } from './admin/HeroSettingsManager'; // 🔥 NOVO: Gestão de página inicial
import { CategoriesManager } from './admin/CategoriesManager'; // 🔥 NOVO: Gestão de categorias
import { FooterSettingsManager } from './admin/FooterSettingsManager'; // 🔥 NOVO: Gestão do footer
import { FlashSalesManager } from './admin/FlashSalesManager';
import { CouponsManager } from './admin/CouponsManager';
import PreOrdersManager from './admin/PreOrdersManager';
import { PreOrderProductsManager } from './admin/PreOrderProductsManager';
import TradeInManager from './admin/TradeInManager';
import QuotesManager from './admin/QuotesManager';
import TicketsManager from './admin/TicketsManager';
import AffiliatesManager from './admin/AffiliatesManager';
import { ReviewsManager } from './admin/ReviewsManager'; // 🔥 NOVO: Gestão de avaliações
import { DataMigrationTool } from './admin/DataMigrationTool'; // 🔥 Ferramenta de migração
import { BlogManager } from './admin/BlogManager'; // 🔥 NOVO: Gestão de blog
import { NewsletterManager } from './admin/NewsletterManager'; // 🔥 BUILD 131: Email marketing
import { CronJobsManager } from './admin/CronJobsManager'; // 🔥 NOVO: Gestão de Cron Jobs

type UnifiedAdminPanelProps = {
  onBack: () => void;
  onLogout?: () => void;
};

type Tab = 'dashboard' | 'products' | 'orders' | 'coupons' | 'flash-sales' | 'customers' | 'ads' | 'team' | 'reviews' | 'tickets' | 'pre-orders' | 'pre-order-products' | 'trade-in' | 'quotes' | 'affiliates' | 'newsletter' | 'migration' | 'hero-settings' | 'categories' | 'footer-settings' | 'blog' | 'cron-jobs';

export function UnifiedAdminPanel({ onBack, onLogout }: UnifiedAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Set auth token when user changes and fetch data
  useEffect(() => {
    // Debug: log user and isAdmin result
    // Debug check
    // If the current user is admin, fetch all admin data (cookie-based sessions also work)
    if (user && isAdmin && isAdmin()) {
      // Admin detected
      if (user.access_token) {
        setAuthToken(user.access_token);
      } else {
      }
      // Fetch apenas uma vez, não criar timeout
      fetchProducts();
      fetchOrders();
      fetchCustomers();
    }
  }, [user?.id]); // Simplificar dependências para evitar re-fetches

  // When the orders tab is activated, ensure we fetch the latest orders.
  useEffect(() => {
    if (activeTab === 'orders') {
      if (user && isAdmin && isAdmin()) {
        try {
          fetchOrders();
        } catch (err) {
          console.error('❌ UNIFIED ADMIN PANEL - Error when fetching orders on tab activation:', err);
        }
      }
    }
  }, [activeTab, user, isAdmin, fetchOrders]);

  // When the customers tab is activated, ensure we fetch the latest customers.
  // This avoids a race where login happened but the admin detection update hasn't completed
  // before the tab renders for the first time.
  useEffect(() => {
    if (activeTab === 'customers') {
      if (user && isAdmin && isAdmin()) {
        try {
          fetchCustomers();
        } catch (err) {
          console.error('❌ UNIFIED ADMIN PANEL - Error when fetching customers on tab activation:', err);
        }
      } else {
      }
    }
  }, [activeTab, user, isAdmin, fetchCustomers]);

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      toast('Produto criado com sucesso!');
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast('Erro ao criar produto: ' + String(error));
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, productData);
      toast('Produto atualizado com sucesso!');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast('Erro ao atualizar produto: ' + String(error));
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleRefreshData = () => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    toast('Dados atualizados!');
  };

  const handleClearCacheAndReload = () => {
    if (confirm('⚠️ ATENÇÃO: Isso irá limpar TODO o cache local e recarregar a página.\n\nTodos os dados não salvos serão perdidos.\n\nContinuar?')) {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear IndexedDB
      if (window.indexedDB) {
        window.indexedDB.databases().then((dbs) => {
          dbs.forEach(db => {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          });
        });
      }
      
      // Force reload
      window.location.href = window.location.href;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔥 UNIFIED HEADER */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="flex-shrink-0 text-white hover:bg-red-800 p-2"
              >
                <ArrowLeft className="size-4" />
              </Button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex-shrink-0 text-white hover:bg-red-800 p-2 rounded"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold truncate">
                  🔥 Admin
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 p-2"
                title="Atualizar"
              >
                🔄
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCacheAndReload}
                className="bg-orange-500 border-orange-600 text-white hover:bg-orange-600 p-2 hidden sm:flex"
                title="Limpar Cache"
              >
                🗑️ Limpar Cache
              </Button>
              
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-white hover:bg-red-800"
                >
                  <LogOut className="size-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </div>

          {/* Info Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Package className="size-4" />
                <strong>{products.length}</strong> Produtos
              </span>
              <span className="flex items-center gap-2">
                <ShoppingCart className="size-4" />
                <strong>{orders.length}</strong> Pedidos
              </span>
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                <strong>{customers.length}</strong> Clientes
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>
                👤 {user?.email || user?.name || 'Admin'}
              </span>
              <span>
                🔐 {user?.app_metadata?.provider || 'Email'}
              </span>
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded">
                ID: {user?.id?.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between">
              <h2 className="font-bold text-lg">Menu Admin</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="p-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'products', icon: Package, label: 'Produtos' },
                { id: 'categories', icon: Folder, label: 'Categorias' },
                { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
                { id: 'coupons', icon: Tag, label: 'Cupons' },
                { id: 'flash-sales', icon: Zap, label: 'Flash Sales' },
                { id: 'customers', icon: Users, label: 'Clientes' },
                { id: 'ads', icon: Megaphone, label: 'Anúncios' },
                { id: 'team', icon: UserCog, label: 'Equipe' },
                { id: 'hero-settings', icon: Sparkles, label: 'Página Inicial' },
                { id: 'blog', icon: PenSquare, label: 'Blog' },
                { id: 'newsletter', icon: Mail, label: 'Newsletter' },
                { id: 'cron-jobs', icon: Clock, label: 'Cron Jobs' },
                { id: 'reviews', icon: MessageSquare, label: 'Avaliações' },
                { id: 'tickets', icon: Ticket, label: 'Tickets' },
                { id: 'pre-orders', icon: Bell, label: 'Pedidos Pré-venda' },
                { id: 'pre-order-products', icon: Package, label: 'Produtos Pré-venda' },
                { id: 'trade-in', icon: Repeat, label: 'Trade-In' },
                { id: 'quotes', icon: FileText, label: 'Cotações' },
                { id: 'affiliates', icon: Sparkles, label: 'Afiliados' },
                { id: 'migration', icon: FileText, label: 'Migração' },
                { id: 'footer-settings', icon: FileText, label: 'Footer' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      // If the user clicked the customers tab, explicitly fetch customers
                      if (item.id === 'customers') {
                        try { fetchCustomers(); } catch (err) { console.error('Error fetching customers via mobile menu click', err); }
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 🔥 MOBILE BREADCRUMB - Mostra seção ativa */}
      <div className="lg:hidden bg-white border-b px-4 py-2 sticky top-[72px] z-40">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="font-medium text-red-600">
            {activeTab === 'dashboard' && '📊 Dashboard'}
            {activeTab === 'products' && '📦 Produtos'}
            {activeTab === 'categories' && '📁 Categorias'}
            {activeTab === 'orders' && '🛒 Pedidos'}
            {activeTab === 'coupons' && '🏷️ Cupons'}
            {activeTab === 'flash-sales' && '⚡ Flash Sales'}
            {activeTab === 'customers' && '👥 Clientes'}
            {activeTab === 'ads' && '📢 Anúncios'}
            {activeTab === 'team' && '👨‍💼 Equipe'}
            {activeTab === 'hero-settings' && '✨ Página Inicial'}
            {activeTab === 'reviews' && '💬 Avaliações'}
            {activeTab === 'tickets' && '🎫 Tickets'}
            {activeTab === 'pre-orders' && '🔔 Pedidos Pré-venda'}
            {activeTab === 'pre-order-products' && '📦 Produtos Pré-venda'}
            {activeTab === 'trade-in' && '🔄 Trade-In'}
            {activeTab === 'quotes' && '📄 Cotações'}
            {activeTab === 'affiliates' && '⭐ Afiliados'}
            {activeTab === 'migration' && '📂 Migração'}
            {activeTab === 'footer-settings' && '📄 Footer'}
          </span>
        </div>
      </div>

      {/* 🔥 DESKTOP NAVIGATION TABS */}
      <div className="hidden lg:block bg-white border-b sticky top-[120px] z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="w-full">
            <TabsList className="w-full inline-flex flex-wrap justify-start h-auto p-1 gap-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3 px-4">
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger value="products" className="flex items-center gap-2 py-3 px-4">
                <Package className="size-4" />
                <span>Produtos</span>
              </TabsTrigger>
              
              <TabsTrigger value="categories" className="flex items-center gap-2 py-3 px-4">
                <Folder className="size-4" />
                <span>Categorias</span>
              </TabsTrigger>
              
              <TabsTrigger value="orders" className="flex items-center gap-2 py-3 px-4">
                <ShoppingCart className="size-4" />
                <span>Pedidos</span>
              </TabsTrigger>
              
              <TabsTrigger value="coupons" className="flex items-center gap-2 py-3 px-4">
                <Tag className="size-4" />
                <span>Cupons</span>
              </TabsTrigger>
              
              <TabsTrigger value="flash-sales" className="flex items-center gap-2 py-3 px-4">
                <Zap className="size-4" />
                <span>Flash Sales</span>
              </TabsTrigger>
              
              <TabsTrigger value="customers" className="flex items-center gap-2 py-3 px-4" onClick={() => { try { fetchCustomers(); } catch (err) { console.error('Error fetching customers via desktop tab click', err); } }}>
                <Users className="size-4" />
                <span>Clientes</span>
              </TabsTrigger>
              
              <TabsTrigger value="ads" className="flex items-center gap-2 py-3 px-4">
                <Megaphone className="size-4" />
                <span>Anúncios</span>
              </TabsTrigger>
              
              <TabsTrigger value="team" className="flex items-center gap-2 py-3 px-4">
                <UserCog className="size-4" />
                <span>Equipe</span>
              </TabsTrigger>
              
              <TabsTrigger value="hero-settings" className="flex items-center gap-2 py-3 px-4">
                <Sparkles className="size-4" />
                <span>Página Inicial</span>
              </TabsTrigger>
              
              <TabsTrigger value="blog" className="flex items-center gap-2 py-3 px-4">
                <PenSquare className="size-4" />
                <span>Blog</span>
              </TabsTrigger>
              
              <TabsTrigger value="newsletter" className="flex items-center gap-2 py-3 px-4">
                <Mail className="size-4" />
                <span>Newsletter</span>
              </TabsTrigger>
              
              <TabsTrigger value="reviews" className="flex items-center gap-2 py-3 px-4">
                <MessageSquare className="size-4" />
                <span>Avaliações</span>
              </TabsTrigger>
              
              <TabsTrigger value="tickets" className="flex items-center gap-2 py-3 px-4">
                <Ticket className="size-4" />
                <span>Tickets</span>
              </TabsTrigger>
              
              <TabsTrigger value="pre-orders" className="flex items-center gap-2 py-3 px-4">
                <Bell className="size-4" />
                <span>Pedidos Pré-venda</span>
              </TabsTrigger>
              
              <TabsTrigger value="pre-order-products" className="flex items-center gap-2 py-3 px-4">
                <Package className="size-4" />
                <span>Produtos Pré-venda</span>
              </TabsTrigger>
              
              <TabsTrigger value="trade-in" className="flex items-center gap-2 py-3 px-4">
                <Repeat className="size-4" />
                <span>Trade-In</span>
              </TabsTrigger>
              
              <TabsTrigger value="quotes" className="flex items-center gap-2 py-3 px-4">
                <FileText className="size-4" />
                <span>Cotações</span>
              </TabsTrigger>
              
              <TabsTrigger value="affiliates" className="flex items-center gap-2 py-3 px-4">
                <Sparkles className="size-4" />
                <span>Afiliados</span>
              </TabsTrigger>
              
              <TabsTrigger value="migration" className="flex items-center gap-2 py-3 px-4">
                <FileText className="size-4" />
                <span>Migração</span>
              </TabsTrigger>
              
              <TabsTrigger value="footer-settings" className="flex items-center gap-2 py-3 px-4">
                <FileText className="size-4" />
                <span>Footer</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 🔥 UNIFIED CONTENT */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            products={products}
            orders={orders}
            customers={customers}
          />
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Gestão de Produtos</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const exportData = products.map(p => ({
                      ID: p.id,
                      Nome: p.nome,
                      Categoria: p.categoria,
                      Marca: p.marca || 'N/A',
                      'Preço (AOA)': p.preco_aoa || 0,
                      Estoque: p.estoque || 0,
                      SKU: p.sku || 'N/A',
                      Status: p.is_active ? 'Ativo' : 'Inativo',
                      'Data Criação': p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : 'N/A'
                    }));
                    
                    import('xlsx').then(XLSX => {
                      const ws = XLSX.utils.json_to_sheet(exportData);
                      
                      // Ajustar largura das colunas
                      const colWidths = [
                        { wch: 10 }, // ID
                        { wch: 40 }, // Nome
                        { wch: 15 }, // Categoria
                        { wch: 15 }, // Marca
                        { wch: 12 }, // Preço
                        { wch: 10 }, // Estoque
                        { wch: 15 }, // SKU
                        { wch: 10 }, // Status
                        { wch: 15 }  // Data Criação
                      ];
                      ws['!cols'] = colWidths;
                      
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
                      XLSX.writeFile(wb, `produtos_kzstore_${new Date().toISOString().split('T')[0]}.xlsx`);
                    });
                  }}
                >
                  <Package className="size-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button onClick={() => setShowProductForm(true)}>
                  <Package className="size-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar produtos por nome, categoria, marca, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  {products.filter(p => 
                    p.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} produtos encontrados
                </p>
              )}
            </div>
            
            {(showProductForm || editingProduct) && (
              <ProductForm
                product={editingProduct}
                onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={handleCancelEdit}
              />
            )}

            <div className="grid gap-4">
              {products
                .filter(product => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    product.nome?.toLowerCase().includes(query) ||
                    product.categoria?.toLowerCase().includes(query) ||
                    product.marca?.toLowerCase().includes(query) ||
                    product.sku?.toLowerCase().includes(query) ||
                    product.descricao?.toLowerCase().includes(query)
                  );
                })
                .map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.categoria}</p>
                      {product.marca && (
                        <p className="text-xs text-gray-500">Marca: {product.marca}</p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Estoque: <strong>{product.estoque}</strong> unidades
                      </p>
                      <p className="font-semibold text-[#E31E24] mt-2">
                        {(product.preco_aoa || 0).toLocaleString('pt-AO')} AOA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit2 className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {products.filter(product => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              return (
                product.nome?.toLowerCase().includes(query) ||
                product.categoria?.toLowerCase().includes(query) ||
                product.marca?.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query) ||
                product.descricao?.toLowerCase().includes(query)
              );
            }).length === 0 && (
              <div className="text-center py-12">
                <Package className="size-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600">
                  Tente pesquisar com outros termos
                </p>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <OrderManagement 
            orders={orders} 
            onUpdateStatus={updateOrderStatus}
            onRefresh={fetchOrders}
          />
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <CouponsManager />
        )}

        {/* Flash Sales */}
        {activeTab === 'flash-sales' && (
          <FlashSalesManager products={products} />
        )}

        {/* Customers */}
        {activeTab === 'customers' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Clientes Cadastrados</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Gerencie todos os clientes da KZSTORE
                </p>
              </div>
              <div className="bg-[#E31E24] text-white px-4 py-2 rounded-lg">
                <span className="font-bold">{customers.length}</span> clientes
              </div>
            </div>
            
            {customers.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Users className="size-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">Nenhum cliente cadastrado ainda</p>
                <p className="text-gray-500 text-sm">
                  Os clientes aparecerão aqui quando criarem uma conta na loja
                </p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Nome</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Email</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Telefone</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Tipo</th>
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Data de Cadastro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                                {customer.nome?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">{customer.nome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{customer.email}</td>
                          <td className="px-6 py-4 text-gray-700">{customer.telefone || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              customer.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {customer.role === 'admin' ? 'Administrador' : 'Cliente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {customer.created_at 
                              ? new Date(customer.created_at).toLocaleDateString('pt-AO', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ads */}
        {activeTab === 'ads' && <AdsManager />}

        {/* Team */}
        {activeTab === 'team' && <TeamManager />}

        {/* Hero Settings */}
        {activeTab === 'hero-settings' && <HeroSettingsManager />}

        {/* Categories */}
        {activeTab === 'categories' && <CategoriesManager />}

        {/* Reviews */}
        {activeTab === 'reviews' && <ReviewsManager />}

        {/* Tickets */}
        {activeTab === 'tickets' && (
          <TicketsManager />
        )}

        {/* Pre-Orders */}
        {activeTab === 'pre-orders' && (
          <PreOrdersManager />
        )}

        {/* Pre-Order Products */}
        {activeTab === 'pre-order-products' && (
          <PreOrderProductsManager />
        )}

        {/* Trade-In */}
        {activeTab === 'trade-in' && (
          <TradeInManager />
        )}

        {/* Quotes */}
        {activeTab === 'quotes' && (
          <QuotesManager />
        )}

        {/* Affiliates */}
        {activeTab === 'affiliates' && (
          <AffiliatesManager />
        )}

        {/* Newsletter - BUILD 131 */}
        {activeTab === 'newsletter' && (
          <NewsletterManager />
        )}

        {/* Blog */}
        {activeTab === 'blog' && (
          <BlogManager />
        )}

        {/* Cron Jobs */}
        {activeTab === 'cron-jobs' && (
          <CronJobsManager />
        )}

        {/* Migration */}
        {activeTab === 'migration' && (
          <DataMigrationTool />
        )}

        {/* Footer Settings */}
        {activeTab === 'footer-settings' && <FooterSettingsManager />}
      </div>
    </div>
  );
}