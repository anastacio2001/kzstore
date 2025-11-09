import { ShoppingCart, Package, Menu, X, Search, User, Phone, Heart, ChevronDown, ShoppingBag, Settings, LogOut, MessageCircle, Bell, RefreshCw, Share2, DollarSign, FileText, Building } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { LanguageSelector } from './LanguageSelector';

type Page = 'home' | 'products' | 'cart' | 'admin' | 'wishlist' | 'faq' | 'about' | 'contact' | 'my-orders' | 'my-account' | 'my-tickets' | 'my-price-alerts' | 'affiliate' | 'trade-in' | 'trade-in-credits' | 'quote-request' | 'b2b-register';

type HeaderProps = {
  cartCount: number;
  wishlistCount?: number;
  onNavigate: (page: Page) => void;
  onCategorySelect?: (category: string) => void;
  onAdminClick?: () => void;
};

export function Header({ cartCount, wishlistCount = 0, onNavigate, onCategorySelect, onAdminClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, signOut } = useAuth();

  const navItems = [
    { label: 'Início', page: 'home' as const },
    { label: 'Produtos', page: 'products' as const },
    { label: 'Sobre', page: 'about' as const },
    { label: 'Contato', page: 'contact' as const },
    { label: 'FAQ', page: 'faq' as const },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50 animate-slide-in-top">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar - Contact Info */}
        <div className="hidden md:flex items-center justify-between px-6 py-2 bg-gradient-primary text-white text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+244931054015" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
              <Phone className="size-3.5" />
              <span>+244 931 054 015</span>
            </a>
            <span className="text-white/70">|</span>
            <span>Segunda - Sábado: 8h - 18h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70">Envios para toda Angola</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Logo */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-primary shadow-lg group-hover:shadow-xl transition-all">
              <Package className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xl font-extrabold text-gradient leading-none">KZSTORE</span>
              <span className="text-xs text-gray-500 font-medium">Tech & Electronics</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="px-4 py-2.5 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-100 hover:text-red-600"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Desktop */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex items-center justify-center size-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-all"
            >
              <Search className="size-5" />
            </button>

            {/* User/Login Button */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="size-6 rounded-full" />
                  ) : (
                    <User className="size-5 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown className={`size-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
                    <button
                      onClick={() => {
                        onNavigate('my-orders');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingBag className="size-4" />
                      <span>Meus Pedidos</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-account');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="size-4" />
                      <span>Minha Conta</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-tickets');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="size-4" />
                      <span>Meus Tickets</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-price-alerts');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Bell className="size-4" />
                      <span>Meus Alertas</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('trade-in');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="size-4" />
                      <span>Trade-In</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('trade-in-credits');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <DollarSign className="size-4" />
                      <span>Meus Créditos</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('affiliate');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="size-4" />
                      <span>Afiliados</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('quote-request');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="size-4" />
                      <span>Solicitar Orçamento</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('b2b-register');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Building className="size-4" />
                      <span>Cadastro B2B</span>
                    </button>
                    <div className="h-px bg-gray-200 my-1" />
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="size-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 transition-all font-medium"
              >
                <User className="size-4" />
                Entrar
              </button>
            )}

            {/* Admin Button */}
            <button
              onClick={() => onNavigate('admin')}
              className="hidden md:flex items-center justify-center size-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-all"
              title="Admin"
            >
              <Package className="size-5" />
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="size-5" />
              <span className="hidden sm:inline font-medium">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center size-6 rounded-full bg-yellow-400 text-red-900 text-xs font-bold shadow-md animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center size-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Desktop Expanded */}
        {searchOpen && (
          <div className="hidden md:block px-6 pb-4 animate-slide-in-top">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos (RAM, SSD, Mini PC, Câmeras...)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-in-top">
          <div className="px-4 py-4 space-y-2">
            {/* Search - Mobile */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-600 focus:outline-none transition-all text-sm"
              />
            </div>

            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50"
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
            >
              <User className="size-5" />
              Admin Panel
            </button>

            {/* Contact Info - Mobile */}
            <div className="pt-3 mt-3 border-t">
              <a
                href="tel:+244931054015"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <Phone className="size-4" />
                <span>+244 931 054 015</span>
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </header>
  );
}