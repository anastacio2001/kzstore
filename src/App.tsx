import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminPanel } from './components/AdminPanel';
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
import { MyTicketsPage } from './components/MyTicketsPage';
import { SEO, seoConfigs } from './components/SEO';
import { Analytics } from './components/Analytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import { WhatsAppChat } from './components/WhatsAppChat';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { useKZStore } from './hooks/useKZStore';
import { I18nProvider } from './i18n';
import { useWishlist } from './hooks/useWishlist';
import { useAuth } from './hooks/useAuth';
import { useFlashSales } from './hooks/useFlashSales';
import { products as initialProducts } from './data/products';
import { projectId, publicAnonKey } from './utils/supabase/info';

export type Product = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  condicao?: 'Novo' | 'Usado' | 'Refurbished';
  preco_aoa: number;
  peso_kg: number;
  estoque: number;
  imagem_url: string; // Imagem principal (primeira da lista)
  imagens?: string[]; // Array de URLs de imagens (inclui a principal)
  especificacoes?: Record<string, string>;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'admin' | 'wishlist' | 'faq' | 'about' | 'contact' | 'login' | 'forgot-password' | 'reset-password' | 'privacy' | 'terms' | 'return' | 'cookie' | 'not-found' | 'promocoes' | 'blog' | 'carreiras' | 'devolucao' | 'garantia' | 'my-orders' | 'my-account' | 'my-tickets';

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
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
    logout
  } = useAuth();

  const { flashSales } = useFlashSales();

  // Helper: calcula preço com desconto de flash sale
  const getItemPrice = (item: CartItem) => {
    const flashSale = flashSales.find(sale => 
      sale.product_id === item.product.id && sale.is_active
    );
    
    if (flashSale) {
      return item.product.preco_aoa * (1 - flashSale.discount_percentage / 100);
    }
    
    return item.product.preco_aoa;
  };

  const accessToken = user?.access_token;

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
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('kzstore_cart', JSON.stringify(cart));
  }, [cart]);

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
        // Setup admin user first
        try {
          console.log('🔧 Setting up admin user...');
          const setupResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/auth/setup-admin`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          const setupData = await setupResponse.json();
          console.log('🔧 Admin setup result:', setupData.message);
        } catch (setupError) {
          console.log('⚠️ Admin setup failed (non-critical):', setupError);
        }
        
        console.log('📦 Fetching products from server...');
        await fetchProducts();
        
        // Esperar um pouco para garantir que o estado foi atualizado
        setTimeout(async () => {
          // Verificar se precisa inicializar produtos
          const currentProducts = await fetchProducts();
          
          if (!currentProducts || currentProducts.length === 0) {
            try {
              console.log('📦 No products found, initializing with defaults...');
              await initializeProducts(initialProducts);
              console.log('✅ Products initialized successfully');
            } catch (error) {
              console.error('❌ Error initializing products:', error);
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

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.estoque) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`${product.nome} adicionado ao carrinho!`, 'success');
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

  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = getItemPrice(item);
    return total + (itemPrice * item.quantity);
  }, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const success = await login(email, password);
    if (success) {
      showToast('Login realizado com sucesso!', 'success');
      navigateTo('admin');
      return true;
    }
    return false;
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
    if (isAuthenticated && isAdmin()) {
      navigateTo('admin');
    } else {
      navigateTo('login');
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
    <I18nProvider>
    <ErrorBoundary>
      <SEO {...getSEOConfig()} />
      <Analytics googleAnalyticsId={gaId} />
      
      <div className="min-h-screen flex flex-col">
        {/* Header - Hide on admin and login pages */}
        {currentPage !== 'admin' && currentPage !== 'login' && (
          <Header
            cartCount={cartCount}
            onNavigate={navigateTo}
            onCategorySelect={handleCategorySelect}
            onAdminClick={handleAdminAccess}
            wishlistCount={wishlist.length}
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
              onBack={() => navigateTo('products')}
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
            />
          )}

          {currentPage === 'checkout' && (
            <CheckoutPage
              cart={cart}
              cartTotal={cartTotal}
              onOrderComplete={handleOrderComplete}
              onBack={() => navigateTo('cart')}
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
            />
          )}

          {currentPage === 'forgot-password' && (
            <ForgotPassword
              onBack={() => navigateTo('login')}
            />
          )}

          {currentPage === 'reset-password' && (
            <ResetPassword />
          )}

          {currentPage === 'admin' && (
            <>
              {isAuthenticated && isAdmin() ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                <LoginPage
                  onLogin={handleLogin}
                  onBack={() => navigateTo('home')}
                />
              )}
            </>
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

          {currentPage === 'blog' && <BlogPage onBack={() => navigateTo('home')} />}

          {currentPage === 'carreiras' && <CarreirasPage onBack={() => navigateTo('home')} />}

          {currentPage === 'devolucao' && <DevolucaoPage onBack={() => navigateTo('home')} />}

          {currentPage === 'garantia' && <GarantiaPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-orders' && <MyOrdersPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-account' && <MyAccountPage onBack={() => navigateTo('home')} />}

          {currentPage === 'my-tickets' && <MyTicketsPage onBack={() => navigateTo('home')} />}
        </main>

        {/* Footer - Hide on admin and login pages */}
        {currentPage !== 'admin' && currentPage !== 'login' && (
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

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* WhatsApp Chat with AI - Show on all pages except admin and login */}
        {currentPage !== 'admin' && currentPage !== 'login' && (
          <WhatsAppChat />
        )}
      </div>
    </ErrorBoundary>
      </I18nProvider>
  );
}