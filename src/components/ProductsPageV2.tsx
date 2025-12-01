import { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown, Grid3x3, List, SlidersHorizontal, Zap } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductGridSkeleton, EmptyState } from './LoadingStates';
import { Product, getProducts, trackEvent, getSessionId } from '../utils/api';
import { useProductSearch, SortOption } from '../hooks/useProductSearch';
import { AdBanner } from './AdBanner';
import { FlashSaleBanner } from './FlashSaleBanner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { toast } from 'sonner';

type ProductsPageProps = {
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isInWishlist?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
};

export function ProductsPageV2({ 
  onViewProduct, 
  onAddToCart, 
  selectedCategory, 
  onCategoryChange,
  isInWishlist,
  onToggleWishlist 
}: ProductsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    updateFilter,
    updateSpecificationFilter,
    clearFilters,
    filteredProducts,
    availableSpecs,
    categories,
    priceRange,
    activeFilterCount
  } = useProductSearch(products);

  // Buscar produtos da API
  useEffect(() => {
    fetchProductsFromAPI();
  }, []);

  async function fetchProductsFromAPI() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      
      // Track analytics
      trackEvent({
        event_type: 'page_view',
        event_category: 'navigation',
        session_id: getSessionId(),
        page_url: window.location.href,
        page_title: 'Produtos',
        metadata: { products_count: data.length }
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Sync selected category with filters
  useEffect(() => {
    if (selectedCategory) {
      updateFilter('category', selectedCategory);
    }
  }, [selectedCategory]);

  // Filtrar apenas produtos com flash sale ativa
  const flashSaleProducts = filteredProducts.filter(p => 
    p.flash_sale && 
    p.flash_sale.is_active &&
    new Date(p.flash_sale.start_date) <= new Date() &&
    new Date(p.flash_sale.end_date) >= new Date()
  );

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Mais Relevantes' },
    { value: 'price-asc', label: 'Menor Preço' },
    { value: 'price-desc', label: 'Maior Preço' },
    { value: 'name-asc', label: 'A-Z' },
    { value: 'name-desc', label: 'Z-A' },
    { value: 'newest', label: 'Mais Recentes' }
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flash Sale Banner */}
      <FlashSaleBanner 
        onViewProduct={onViewProduct}
      />
      
      {/* Category Advertisement Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <AdBanner position="category-top" />
      </div>

      {/* Flash Sales Section */}
      {flashSaleProducts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 py-6 sm:py-8 mb-6 sm:mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Zap className="size-6 sm:size-8 text-white animate-pulse" />
                <h2 className="text-xl sm:text-3xl font-bold text-white">
                  Flash Sales Ativos
                </h2>
              </div>
              <span className="text-xs sm:text-sm text-white/90 font-medium">
                {flashSaleProducts.length} {flashSaleProducts.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {flashSaleProducts.slice(0, 5).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewProduct}
                  onAddToCart={onAddToCart}
                  isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
          {/* Title and Result Count */}
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-3xl font-bold text-gray-900 truncate">
                Catálogo de Produtos
              </h1>
              <p className="text-xs sm:text-base text-gray-600 mt-0.5">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                {activeFilterCount > 0 && ` (${activeFilterCount} ${activeFilterCount === 1 ? 'filtro ativo' : 'filtros ativos'})`}
              </p>
            </div>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <div className="flex gap-2 mb-2 sm:mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-12 pr-8 sm:pr-12 py-1.5 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-3.5 sm:size-5" />
                </button>
              )}
            </div>
          </div>

          {/* Controls - Mobile Optimized */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Filter Button - Mobile */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none relative text-xs sm:text-sm h-7 sm:h-10 px-2 sm:px-4"
                >
                  <SlidersHorizontal className="size-3 sm:size-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                  <span className="sm:hidden">Filtrar</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 sm:size-5 rounded-full bg-red-600 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProductFilters
                    categories={categories}
                    priceRange={priceRange}
                    availableSpecs={availableSpecs}
                    filters={filters}
                    onFilterChange={updateFilter}
                    onSpecFilterChange={updateSpecificationFilter}
                    onClearFilters={clearFilters}
                    onCategoryChange={onCategoryChange}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-lg border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-white cursor-pointer h-7 sm:h-10"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle - Desktop Only */}
            <div className="hidden sm:flex gap-1 border-2 border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Visualização em grade"
              >
                <Grid3x3 className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Visualização em lista"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                <ProductFilters
                  categories={categories}
                  priceRange={priceRange}
                  availableSpecs={availableSpecs}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onSpecFilterChange={updateSpecificationFilter}
                  onClearFilters={clearFilters}
                  onCategoryChange={onCategoryChange}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon={<Search className="size-16 text-gray-300" />}
                  title="Nenhum produto encontrado"
                  description="Tente ajustar seus filtros ou fazer uma nova busca"
                  action={
                    activeFilterCount > 0 ? (
                      <Button onClick={clearFilters} variant="outline">
                        Limpar Filtros
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6'
                    : 'flex flex-col gap-4'
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={onViewProduct}
                      onAddToCart={onAddToCart}
                      isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Grid */}
        <div className="lg:hidden">
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Search className="size-12 sm:size-16 text-gray-300" />}
              title="Nenhum produto encontrado"
              description="Tente ajustar seus filtros ou fazer uma nova busca"
              action={
                activeFilterCount > 0 ? (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Limpar Filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewProduct}
                  onAddToCart={onAddToCart}
                  isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Advertisement Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <AdBanner position="category-bottom" />
      </div>
    </div>
  );
}
