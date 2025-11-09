import { useState, useEffect } from 'react';
import { Search, X, ArrowUpDown, Grid3x3, List, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductGridSkeleton } from './LoadingStates';
import { EmptyState } from './LoadingStates';
import { Product } from '../App';
import { useKZStore } from '../hooks/useKZStore';
import { useProductSearch, SortOption } from '../hooks/useProductSearch';
import { AdBanner } from './AdBanner';

type ProductsPageProps = {
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isInWishlist?: (productId: string) => boolean;
  onToggleWishlist?: (product: Product) => void;
};

export function ProductsPage({ 
  onViewProduct, 
  onAddToCart, 
  selectedCategory, 
  onCategoryChange,
  isInWishlist,
  onToggleWishlist 
}: ProductsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { products, fetchProducts, loading } = useKZStore();
  
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync selected category with filters
  useEffect(() => {
    if (selectedCategory) {
      updateFilter('category', selectedCategory);
    }
  }, [selectedCategory]);

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
      {/* Category Advertisement Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdBanner position="category-top" />
      </div>

      {/* Header */}
      <div className="bg-white border-b sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Catálogo de Produtos
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Visualização em Grade"
              >
                <Grid3x3 className="size-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Visualização em Lista"
              >
                <List className="size-5" />
              </button>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, descrição ou especificações..."
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[200px]">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Filtros ativos:</span>
              
              {filters.category && filters.category !== 'all' && (
                <button
                  onClick={() => {
                    updateFilter('category', 'all');
                    onCategoryChange('all');
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                >
                  {filters.category}
                  <X className="size-4" />
                </button>
              )}

              {filters.inStock && (
                <button
                  onClick={() => updateFilter('inStock', false)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                >
                  Em estoque
                  <X className="size-4" />
                </button>
              )}

              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <button
                  onClick={() => {
                    updateFilter('minPrice', undefined);
                    updateFilter('maxPrice', undefined);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                >
                  Faixa de preço
                  <X className="size-4" />
                </button>
              )}

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
              >
                Limpar todos
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[280px]">
              <ProductFilters
                categories={categories}
                availableSpecs={availableSpecs}
                priceRange={priceRange}
                filters={filters}
                onUpdateFilter={(key, value) => {
                  updateFilter(key, value);
                  if (key === 'category') {
                    onCategoryChange(value);
                  }
                }}
                onUpdateSpecFilter={updateSpecificationFilter}
                onClearFilters={() => {
                  clearFilters();
                  onCategoryChange('all');
                }}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Nenhum produto encontrado"
                description={
                  searchQuery
                    ? `Não encontramos produtos para "${searchQuery}". Tente ajustar os filtros ou buscar por outros termos.`
                    : 'Não há produtos disponíveis nesta categoria no momento.'
                }
                actionLabel="Limpar Filtros"
                onAction={clearFilters}
              />
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-in-bottom"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onViewDetails={onViewProduct}
                      onAddToCart={onAddToCart}
                      isInWishlist={isInWishlist?.(product.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination could go here in the future */}
          </div>
        </div>
      </div>
    </div>
  );
}