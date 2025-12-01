import React, { useState, useEffect, useRef } from 'react';
import { checkAndUpdateVersion, clearDeprecatedStorage } from './utils/clearCache';
import { useKZStore } from './hooks/useKZStore';
import { useWishlist } from './hooks/useWishlist';
import { useAuth } from './hooks/useAuth';
import type { Product, CartItem } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import { DataMigration } from './components/DataMigration'; // 🔥 NOVO: Limpeza de dados antigos
import { ClearDataButton } from './components/ClearDataButton'; // 🔥 DEBUG: Botão de limpeza manual
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AIChatbot } from './components/AIChatbot';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminPanel } from './components/AdminPanel';
import { UnifiedAdminPanel } from './components/UnifiedAdminPanel'; // 🔥 NOVO: Painel unificado
import { WishlistPage } from './components/WishlistPage';
import { FAQPage } from './components/FAQPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { ReturnPolicyPage } from './components/ReturnPolicyPage';
import { CookiePolicyPage } from './components/CookiePolicyPage';
import { NotFoundPage } from './components/NotFoundPage';
import { PromocoesPage } from './components/PromocoesPage';
import { BlogPage } from './components/BlogPage';
import { CarreirasPage } from './components/CarreirasPage';
import { DevolucaoPage } from './components/DevolucaoPage';
import { GarantiaPage } from './components/GarantiaPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { MyAccountPage } from './components/MyAccountPage';
import { MyLoyaltyPage } from './components/MyLoyaltyPage';
import TradeInForm from './components/TradeInForm';
import { QuoteForm } from './components/QuoteForm';
import { PreOrdersPage } from './components/PreOrdersPage';
import { SupportTicketsPage } from './components/SupportTicketsPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { SEO } from './components/SEO';
import { Analytics } from './components/Analytics';
import { seoConfigs } from './config/seo';
import { API_ENDPOINTS } from './config/api';
import { products as initialProducts } from './data/products';

// 🔥 NOVO: Importar utilitários de verificação do Supabase
// Dev-only: carregar utilitários de verificação do Supabase somente em modo DEV
if (import.meta.env.DEV && typeof window !== 'undefined') {
  import('./utils/verificar-dados-supabase')
    .then(() => console.log('[Debug] Supabase verificator loaded (DEV)'))
    .catch(() => {});
}

// 🔥 DEBUG: Teste de API
import { testAPIConnection } from './utils/testAPI';

// Re-export types for backwards compatibility
export type { Product, CartItem } from './types';

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'admin' | 'wishlist' | 'faq' | 'about' | 'contact' | 'login' | 'forgot-password' | 'reset-password' | 'privacy' | 'terms' | 'return' | 'cookie' | 'not-found' | 'promocoes' | 'blog' | 'carreiras' | 'devolucao' | 'garantia' | 'my-orders' | 'my-account' | 'my-loyalty' | 'trade-in' | 'quote-request' | 'pre-orders' | 'support-tickets';

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

// Componente separado para renderizar a página de admin
function AdminPageContent({
  isAuthenticated,
  isAdmin,
  navigateTo,
  handleLogout,
  handleLogin,
  handleSocialLogin,
  showToast,
}: {
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  navigateTo: (page: Page) => void;
  handleLogout: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleSocialLogin: (token: string, user: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  React.useEffect(() => {
    // Verificar se autenticado mas não é admin após um pequeno delay
    // para garantir que o estado user foi atualizado
    if (isAuthenticated && !isAdmin()) {
      console.log('🚫 [AdminPageContent] User authenticated but not admin');
      setShouldRedirect(true);
      showToast('Acesso negado. Área restrita a administradores.', 'error');
      const timer = setTimeout(() => navigateTo('home'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAdmin]);

  // Se autenticado e é admin, mostrar painel
  if (isAuthenticated && isAdmin()) {
    console.log('✅ [AdminPageContent] Showing admin panel');
    return (
      <UnifiedAdminPanel
        onBack={() => navigateTo('home')}
        onLogout={handleLogout}
      />
    );
  }

  // Se deve redirecionar ou não está autenticado, mostrar tela de login
  return (
    <LoginPage
      onLogin={handleLogin}
      onBack={() => navigateTo('home')}
      onForgotPassword={() => navigateTo('forgot-password')}
      onSocialLogin={handleSocialLogin}
    />
  );
}

export default function App() {
  // Carregar página atual do localStorage ou URL hash, ou usar 'home' como padrão
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Primeiro, tentar obter da URL hash
    const hash = window.location.hash.slice(1); // Remove o #
    if (hash) {
      const validPages: Page[] = ['home', 'products', 'product-detail', 'cart', 'checkout', 'admin', 'wishlist', 'faq', 'about', 'contact', 'login', 'forgot-password', 'reset-password', 'privacy', 'terms', 'return', 'cookie', 'not-found', 'promocoes', 'blog', 'carreiras', 'devolucao', 'garantia', 'my-orders', 'my-account', 'my-loyalty', 'trade-in', 'quote-request', 'pre-orders', 'support-tickets'];
      if (validPages.includes(hash as Page)) {
        return hash as Page;
      }
    }
    
    // Se não houver hash válido, tentar localStorage
    const savedPage = localStorage.getItem('kzstore_current_page');
    if (savedPage) {
      return savedPage as Page;
    }
    
    // Padrão
    return 'home';
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [intendedPage, setIntendedPage] = useState<Page | null>(null);
  
  // Use useRef para controlar inicialização (evita loop infinito)
  const hasInitialized = useRef(false);

  // Google Analytics ID - carrega do localStorage se configurado
  const [gaId, setGaId] = useState<string>(() => {
    return localStorage.getItem('kzstore_ga_id') || '';
  });

  const { 
    products, 
    fetchProducts, 
    initializeProducts,
    createOrder,
    loading 
  } = useKZStore();

  const { 
    wishlist, 
    isInWishlist,
    toggleWishlist
  } = useWishlist();

  const {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkSession
  } = useAuth();

  const accessToken = user?.access_token;

  // 🧹 LIMPAR CACHE E DADOS DEPRECATED - EXECUTAR PRIMEIRO
  useEffect(() => {
    console.log('🔄 Verificando versão da aplicação...');
    const versionChanged = checkAndUpdateVersion();
    
    if (versionChanged) {
      console.log('✅ Cache limpo após atualização de versão');
    }
    
    // Sempre limpar dados deprecated
    clearDeprecatedStorage();
  }, []); // Executar apenas uma vez no mount

  // 🔐 CAPTURAR TOKEN DO OAUTH CALLBACK
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    
    if (authToken) {
      console.log('🔑 [OAuth] Token recebido do callback OAuth');
      
      // Salvar token no localStorage
      localStorage.setItem('user', JSON.stringify({ access_token: authToken }));
      
      // Recarregar sessão do usuário
      checkSession().then(() => {
        console.log('✅ [OAuth] Sessão recarregada com sucesso');
        showToast('Login realizado com sucesso!', 'success');
      }).catch(err => {
        console.error('❌ [OAuth] Erro ao recarregar sessão:', err);
        showToast('Erro ao fazer login. Tente novamente.', 'error');
      });
      
      // Remover token da URL
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); // Executar apenas uma vez no mount

  // 🔐 CAPTURAR TOKEN DE RESET PASSWORD DA URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    const path = window.location.pathname;
    
    console.log('🔐 [Reset Password Check]', { path, resetToken, hasToken: !!resetToken });
    
    // Se estiver na rota /reset-password, mudar para página reset-password
    if (path === '/reset-password') {
      console.log('🔐 [Reset Password] Detectado caminho /reset-password, mudando página');
      setCurrentPage('reset-password');
      // NÃO adicionar hash - manter só os query params com o token
      return; // Retornar para evitar que outros useEffects mudem a página
    }
  }, []); // Executar apenas uma vez no mount

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('kzstore_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []); // Executar apenas uma vez no mount

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('kzstore_cart', JSON.stringify(cart));
  }, [cart]);

  // Salvar página atual no localStorage e atualizar URL sempre que mudar
  useEffect(() => {
    localStorage.setItem('kzstore_current_page', currentPage);
    // Atualizar URL hash para manter sincronizado
    window.history.replaceState(null, '', `#${currentPage}`);
  }, [currentPage]);

  // Salvar e carregar produto selecionado
  useEffect(() => {
    // Carregar produto do localStorage se estiver na página de detalhes
    if (currentPage === 'product-detail' && !selectedProduct) {
      const savedProduct = localStorage.getItem('kzstore_selected_product');
      if (savedProduct) {
        try {
          setSelectedProduct(JSON.parse(savedProduct));
        } catch (error) {
          console.error('Error loading selected product:', error);
          // Se falhar, voltar para produtos
          navigateTo('products');
        }
      }
    }
    
    // Salvar produto selecionado quando mudar
    if (selectedProduct) {
      localStorage.setItem('kzstore_selected_product', JSON.stringify(selectedProduct));
    }
  }, [currentPage, selectedProduct]);

  // Escutar mudanças no hash da URL para permitir navegação direta
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove o #
      const validPages: Page[] = ['home', 'products', 'product-detail', 'cart', 'checkout', 'admin', 'wishlist', 'faq', 'about', 'contact', 'login', 'privacy', 'terms', 'return', 'cookie', 'not-found', 'promocoes', 'blog', 'carreiras', 'devolucao', 'garantia', 'my-orders', 'my-account', 'my-loyalty', 'trade-in', 'quote-request', 'pre-orders', 'support-tickets', 'reset-password'];

      if (hash && validPages.includes(hash as Page)) {
        setCurrentPage(hash as Page);
      }
    };

    // Adicionar listener para mudanças no hash
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize products on first load ONLY ONCE
  useEffect(() => {
    if (hasInitialized.current) {
      return; // Já inicializou, não fazer nada
    }

    const init = async () => {
      try {
        console.log('📦 Fetching products from KV store...');
        await fetchProducts();
        
        // Esperar um pouco para garantir que o estado foi atualizado
        setTimeout(async () => {
          // Verificar se precisa inicializar produtos
          const currentProducts = products || [];
          
          if (currentProducts.length === 0) {
            // Only initialize products (server-side protected) if user is admin or in DEV
            const runningAsAdmin = isAdmin();
            const isDev = import.meta.env.DEV;
            if (!runningAsAdmin && !isDev) {
              console.log('⚠️ Skipping initializeProducts: user not admin and not in DEV');
            } else {
            try {
              console.log('📦 No products found, initializing with defaults...');
              await initializeProducts(initialProducts);
              console.log('✅ Products initialized successfully');
            } catch (error) {
              console.error('❌ Error initializing products:', error);
            }
            }
          } else {
            console.log(`✅ Found ${currentProducts.length} products`);
          }
          
          hasInitialized.current = true;
        }, 100);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        hasInitialized.current = true;
      }
    };
    
    init();
  }, []); // Array vazio = executa apenas UMA VEZ no mount

  // Use products from backend, fallback to initial products
  const displayProducts = products.length > 0 ? products : initialProducts;

  const addToCart = async (product: Product, quantity: number = 1) => {
    let productToAdd = { ...product };
    
    try {
      // Check if product is in active flash sale
      const response = await fetch(`${API_ENDPOINTS.FLASH_SALES}?product_id=${product.id}`);
      
      if (response.ok) {
        const data = await response.json();
        const activeFlashSales = data.flashSales?.filter((fs: any) => {
          const now = new Date();
          const startDate = new Date(fs.start_date);
          const endDate = new Date(fs.end_date);
          return fs.is_active && now >= startDate && now <= endDate;
        }) || [];
        
        if (activeFlashSales.length > 0) {
          const flashSale = activeFlashSales[0];
          // Apply flash sale price
          productToAdd = {
            ...product,
            preco_aoa: flashSale.sale_price,
            flash_sale_id: flashSale.id,
            is_flash_sale: true,
            original_price: flashSale.original_price,
            discount_percentage: flashSale.discount_percentage
          } as any;
        }
      }
    } catch (error) {
      console.error('Error checking flash sale:', error);
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productToAdd.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === productToAdd.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, productToAdd.estoque), product: productToAdd }
            : item
        );
      }
      return [...prev, { product: productToAdd, quantity }];
    });
    
    const priceMessage = (productToAdd as any).is_flash_sale 
      ? ` com desconto de ${(productToAdd as any).discount_percentage}% (Flash Sale)!`
      : '!';
    showToast(`${productToAdd.nome} adicionado ao carrinho${priceMessage}`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.estoque) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Produto removido do carrinho', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.preco_aoa * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = page; // Atualizar URL hash
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateWithAuth = (page: Page, requireLogin: boolean = false) => {
    if (requireLogin && !isAuthenticated) {
      setIntendedPage(page);
      localStorage.setItem('kzstore_intended_page', page);
      setAuthModalOpen(true);
      return;
    }
    setIntendedPage(null);
    localStorage.removeItem('kzstore_intended_page');
    navigateTo(page);
  };

  const viewProductDetail = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product-detail');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    navigateTo('products');
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await login(email, password);
      // Ensure the global session is updated across all useAuth hook instances
      try {
        await checkSession();
      } catch (err) {
        // ignore
      }
      showToast('Login realizado com sucesso!', 'success');
      navigateTo('admin');
      return true;
    } catch (error: any) {
      // Only log if it's not an invalid credentials error (which is expected)
      if (!error?.message?.includes('Invalid login credentials')) {
        console.error('Login failed:', error);
      }
      // Show user-friendly toast on failure
      showToast('Email ou senha incorretos', 'error');
      return false;
    }
  };

  const handleSocialLogin = (token: string, user: any) => {
    // Salvar token no localStorage (não precisa do setAuthToken)
    localStorage.setItem('kzstore_auth_token', token);
    localStorage.setItem('kzstore_user', JSON.stringify(user));
    
    // Atualizar sessão
    try {
      checkSession();
    } catch (err) {
      // ignore
    }
    
    showToast(`Bem-vindo, ${user.name}!`, 'success');
    
    // Redirecionar para a página pretendida ou home
    if (intendedPage) {
      navigateTo(intendedPage);
      setIntendedPage(null);
      localStorage.removeItem('kzstore_intended_page');
    } else {
      navigateTo('home');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logout realizado com sucesso', 'info');
    navigateTo('home');
  };

  const handleOrderComplete = () => {
    clearCart();
    showToast('Pedido realizado com sucesso! Verifique seu WhatsApp.', 'success');
    navigateTo('home');
  };

  const handleAdminAccess = () => {
    // If not authenticated, show login modal and set intended page to admin
    if (!isAuthenticated) {
      setIntendedPage('admin');
      setAuthModalOpen(true);
      return;
    }
    // If authenticated but not admin, navigate to login or home
    if (isAuthenticated && isAdmin()) {
      navigateTo('admin');
    } else {
      navigateTo('home');
    }
  };

  // Get SEO config based on current page
  const getSEOConfig = () => {
    switch (currentPage) {
      case 'home':
        return seoConfigs.home;
      case 'products':
        return seoConfigs.products;
      case 'cart':
        return seoConfigs.cart;
      case 'about':
        return seoConfigs.about;
      case 'contact':
        return seoConfigs.contact;
      case 'faq':
        return seoConfigs.faq;
      case 'product-detail':
        if (selectedProduct) {
          return {
            title: `${selectedProduct.nome} - KZSTORE`,
            description: selectedProduct.descricao,
            keywords: `${selectedProduct.nome}, ${selectedProduct.categoria}, comprar ${selectedProduct.categoria} angola`,
            image: selectedProduct.imagem_url
          };
        }
        return seoConfigs.products;
      default:
        return seoConfigs.home;
    }
  };

  return (
    <ErrorBoundary>
      <SEO {...getSEOConfig()} />
      <Analytics googleAnalyticsId={gaId} />
      
      {/* 🔥 Data Migration: Limpa dados antigos do localStorage */}
      <DataMigration />
      
      {/* Auth Modal - Rendered at root level to ensure proper z-index */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        onLoginSuccess={async () => {
          setAuthModalOpen(false);
          // Re-check session to sync state across the app
          let sessionUser: any = null;
          try {
              sessionUser = await checkSession();
            } catch (err) {
              // ignore
            }
            // If we had an intended page, redirect there
            if (intendedPage) {
              navigateTo(intendedPage);
              setIntendedPage(null);
              return;
            }
            // Navigate depending on role based on freshly returned sessionUser
          if (sessionUser && sessionUser.role === 'admin') {
            showToast('Bem-vindo ao Painel Admin!', 'success');
            navigateTo('admin');
          } else {
            showToast('Bem-vindo! Login realizado com sucesso', 'success');
            navigateTo('home');
          }
        }}
        notify={showToast}
      />
      
      <div className="min-h-screen flex flex-col">
        {/* Header - Hide on admin, login and reset-password pages */}
        {currentPage !== 'admin' && currentPage !== 'login' && currentPage !== 'reset-password' && (
          <Header
            cartCount={cartCount}
            onNavigate={navigateTo}
            onCategorySelect={handleCategorySelect}
            onAdminClick={handleAdminAccess}
            wishlistCount={wishlist.length}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1">
          {currentPage === 'home' && (
            <HomePage
              products={displayProducts}
              onViewProduct={viewProductDetail}
              onAddToCart={addToCart}
              onNavigateToProducts={() => navigateTo('products')}
              onCategorySelect={handleCategorySelect}
              isInWishlist={isInWishlist}
              onToggleWishlist={toggleWishlist}
            />
          )}

          {currentPage === 'products' && (
            <ProductsPage
              onViewProduct={viewProductDetail}
              onAddToCart={addToCart}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              isInWishlist={isInWishlist}
              onToggleWishlist={toggleWishlist}
            />
          )}

          {currentPage === 'product-detail' && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              onAddToCart={addToCart}
              onBack={() => {
                setSelectedProduct(null);
                navigateTo('products');
              }}
              userEmail={user?.email}
              userName={user?.user_metadata?.name || user?.nome || user?.name || user?.email?.split('@')[0] || 'Usuário'}
              accessToken={accessToken}
            />
          )}

          {currentPage === 'cart' && (
              <CartPage
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={() => navigateTo('checkout')}
              onContinueShopping={() => navigateTo('products')}
              onViewProduct={(productId) => {
                console.log('🔍 CartPage: Looking for product ID:', productId);
                console.log('🔍 Available products:', displayProducts.length);
                const product = displayProducts.find(p => p.id === productId);
                console.log('🔍 CartPage: Found product:', product);
                if (product) {
                  setSelectedProduct(product);
                  navigateTo('product-detail');
                } else {
                  console.error('❌ Product not found in displayProducts');
                }
              }}
            />
          )}

          {currentPage === 'checkout' && (
            <CheckoutPage
              cart={cart}
              cartTotal={cartTotal}
              onOrderComplete={handleOrderComplete}
              onBack={() => navigateTo('cart')}
              onViewProduct={(productId) => {
                const product = displayProducts.find(p => p.id === productId);
                if (product) {
                  setSelectedProduct(product);
                  navigateTo('product-detail');
                }
              }}
            />
          )}

          {currentPage === 'wishlist' && (
            <WishlistPage
              wishlist={wishlist}
              onAddToCart={addToCart}
              onRemoveFromWishlist={toggleWishlist}
              onViewProduct={viewProductDetail}
              onBack={() => navigateTo('home')}
            />
          )}

          {currentPage === 'faq' && <FAQPage />}

          {currentPage === 'about' && <AboutPage />}

          {currentPage === 'contact' && <ContactPage />}

          {currentPage === 'login' && (
            <LoginPage
              onLogin={handleLogin}
              onBack={() => navigateTo('home')}
              onForgotPassword={() => navigateTo('forgot-password')}
              onSocialLogin={handleSocialLogin}
            />
          )}

          {currentPage === 'forgot-password' && (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
              <ForgotPassword
                onBack={() => navigateTo('login')}
              />
            </div>
          )}

          {currentPage === 'reset-password' && (
            <ResetPassword />
          )}

          {currentPage === 'admin' && (
            <AdminPageContent
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              navigateTo={navigateTo}
              handleLogout={handleLogout}
              handleLogin={handleLogin}
              handleSocialLogin={handleSocialLogin}
              showToast={showToast}
            />
          )}

          {currentPage === 'privacy' && <PrivacyPolicyPage onBack={() => navigateTo('home')} />}

          {currentPage === 'terms' && <TermsOfServicePage onBack={() => navigateTo('home')} />}

          {currentPage === 'return' && <ReturnPolicyPage onBack={() => navigateTo('home')} />}

          {currentPage === 'cookie' && <CookiePolicyPage onBack={() => navigateTo('home')} />}

          {currentPage === 'not-found' && (
            <NotFoundPage
              onNavigateHome={() => navigateTo('home')}
              onNavigateProducts={() => navigateTo('products')}
            />
          )}

          {currentPage === 'promocoes' && <PromocoesPage onBack={() => navigateTo('home')} />}

          {currentPage === 'blog' && (
            <BlogPage 
              onBack={() => navigateTo('home')}
              onViewProduct={async (productId) => {
                console.log('🔍 Buscando produto:', productId);
                console.log('📦 Produtos disponíveis:', displayProducts.length);
                
                // Tentar encontrar nos produtos já carregados
                let product = displayProducts.find(p => p.id === productId);
                
                // Se não encontrar, buscar diretamente da API
                if (!product) {
                  console.log('⚠️ Produto não encontrado localmente, buscando da API...');
                  try {
                    const response = await fetch(`/api/products/${productId}`);
                    if (response.ok) {
                      product = await response.json();
                      console.log('✅ Produto encontrado na API:', product);
                    }
                  } catch (error) {
                    console.error('❌ Erro ao buscar produto:', error);
                  }
                }
                
                if (product) {
                  console.log('✅ Abrindo produto:', product.nome);
                  setSelectedProduct(product);
                  navigateTo('product-detail');
                } else {
                  console.error('❌ Produto não encontrado:', productId);
                }
              }}
            />
          )}

          {currentPage === 'carreiras' && <CarreirasPage onBack={() => navigateTo('home')} />}

          {currentPage === 'devolucao' && <DevolucaoPage onBack={() => navigateTo('home')} />}

          {currentPage === 'garantia' && <GarantiaPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-orders' && <MyOrdersPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-account' && <MyAccountPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-loyalty' && (
            <MyLoyaltyPage 
              userEmail={user?.email}
              onBack={() => navigateTo('home')} 
            />
          )}

          {currentPage === 'trade-in' && <TradeInForm />}

          {currentPage === 'quote-request' && <QuoteForm onBack={() => navigateTo('home')} />}

          {currentPage === 'pre-orders' && (
            <PreOrdersPage 
              onBack={() => navigateTo('home')} 
              onViewProduct={(productId) => {
                const product = displayProducts.find(p => p.id === productId);
                if (product) {
                  setSelectedProduct(product);
                  navigateTo('product-detail');
                }
              }}
            />
          )}

          {currentPage === 'support-tickets' && (
            <SupportTicketsPage onBack={() => navigateTo('home')} />
          )}

          {currentPage === 'reset-password' && (
            <ResetPasswordPage />
          )}
        </main>

        {/* Footer - Hide on admin, login and reset-password pages */}
        {currentPage !== 'admin' && currentPage !== 'login' && currentPage !== 'reset-password' && (
          <Footer onNavigate={navigateTo} />
        )}

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        {/* AI Chatbot with WhatsApp - Show on all pages except admin and login */}
        {currentPage !== 'admin' && currentPage !== 'login' && (
          <AIChatbot />
        )}
      </div>
    </ErrorBoundary>
  );
}