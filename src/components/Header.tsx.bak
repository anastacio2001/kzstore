import { ShoppingCart, Package, Menu, X, Search, User, Phone, Heart, ChevronDown, ShoppingBag, Settings, LogOut, Repeat, FileText, PackagePlus, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

type Page = 'home' | 'products' | 'cart' | 'admin' | 'wishlist' | 'faq' | 'about' | 'contact' | 'my-orders' | 'my-account' | 'trade-in' | 'quote-request' | 'pre-orders' | 'support-tickets';

type HeaderProps = {
  cartCount: number;
  wishlistCount?: number;
  onNavigate: (page: Page) => void;
  onCategorySelect?: (category: string) => void;
  onAdminClick?: () => void;
  onOpenAuthModal?: () => void;
};

export function Header({ cartCount, wishlistCount = 0, onNavigate, onCategorySelect, onAdminClick, onOpenAuthModal }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const navItems = [
    { label: 'Início', page: 'home' as const },
    { label: 'Produtos', page: 'products' as const },
    { label: 'Pré-vendas', page: 'pre-orders' as const },
    { label: 'Sobre', page: 'about' as const },
    { label: 'Contato', page: 'contact' as const },
    { label: 'FAQ', page: 'faq' as const },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200/50 animate-slide-in-top">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar - Contact Info - Desktop Only */}
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

        {/* Main Header - Mobile Optimized */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          {/* Logo - Mobile Optimized */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 group"
          >
            <div className="flex items-center justify-center size-10 sm:size-12 rounded-lg sm:rounded-xl bg-gradient-primary shadow-lg group-hover:shadow-xl transition-all">
              <Package className="size-5 sm:size-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base sm:text-xl font-extrabold text-gradient leading-none">KZSTORE</span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block">Tech & Electronics</span>
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

          {/* Right Actions - Mobile Optimized */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wishlist Button - Mobile Optimized */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative flex items-center justify-center size-9 sm:size-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-all"
              title="Lista de Desejos"
            >
              <Heart className="size-4 sm:size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center size-4 sm:size-5 rounded-full bg-red-600 text-white text-[10px] sm:text-xs font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

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
                  {isLoading ? (
                    <div className="size-5 flex items-center justify-center text-gray-400">...</div>
                  ) : (user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="size-6 rounded-full" />
                    ) : (
                      <User className="size-5 text-gray-600" />
                    ))}
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
                    <div className="h-px bg-gray-200 my-1" />
                    <button
                      onClick={() => {
                        onNavigate('trade-in');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Repeat className="size-4" />
                      <span>Trade-In</span>
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
                        onNavigate('pre-orders');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <PackagePlus className="size-4" />
                      <span>Minhas Pré-vendas</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('support-tickets');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Ticket className="size-4" />
                      <span>Suporte</span>
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
                onClick={() => onOpenAuthModal?.()}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 transition-all font-medium"
              >
                <User className="size-4" />
                {isLoading ? 'Carregando...' : 'Entrar'}
              </button>
            )}

            {/* Cart Button - Mobile Optimized */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="size-4 sm:size-5" />
              <span className="hidden sm:inline font-medium">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 sm:size-6 rounded-full bg-yellow-400 text-red-900 text-[10px] sm:text-xs font-bold shadow-md animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center size-9 sm:size-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
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

            {/* Login/User Section - Mobile */}
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="size-10 rounded-full" />
                  ) : (
                    <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="size-5 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onNavigate('my-orders');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <ShoppingBag className="size-5" />
                  Meus Pedidos
                </button>
                <button
                  onClick={() => {
                    onNavigate('my-account');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <Settings className="size-5" />
                  Minha Conta
                </button>
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={() => {
                    onNavigate('trade-in');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <Repeat className="size-5" />
                  Trade-In
                </button>
                <button
                  onClick={() => {
                    onNavigate('quote-request');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <FileText className="size-5" />
                  Solicitar Orçamento
                </button>
                <button
                  onClick={() => {
                    onNavigate('pre-orders');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <PackagePlus className="size-5" />
                  Minhas Pré-vendas
                </button>
                <button
                  onClick={() => {
                    onNavigate('support-tickets');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
                >
                  <Ticket className="size-5" />
                  Suporte
                </button>
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all"
                >
                  <LogOut className="size-5" />
                  Sair
                </button>
                <div className="h-px bg-gray-200 my-2" />
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onOpenAuthModal?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-all shadow-md mb-2"
                >
                  <User className="size-5" />
                  Entrar ou Criar Conta
                </button>
                <div className="h-px bg-gray-200 my-2" />
              </>
            )}

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
    </header>
  );
}