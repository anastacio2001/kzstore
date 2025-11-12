import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../App';
import { Button } from './ui/button';

interface AdvancedSearchProps {
  products: Product[];
  onSearchResults: (results: Product[]) => void;
}

interface Filters {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onSale: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';
}

export function AdvancedSearch({ products, onSearchResults }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    minPrice: 0,
    maxPrice: Infinity,
    inStock: false,
    onSale: false,
    sortBy: 'newest'
  });

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete - sugestões enquanto digita
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products
      .filter(p => 
        p.nome.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.descricao.toLowerCase().includes(query)
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchQuery, products]);

  // Aplicar filtros e busca
  useEffect(() => {
    let results = [...products];

    // Filtro de texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.nome.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.descricao.toLowerCase().includes(query)
      );
    }

    // Filtro de categoria
    if (filters.category !== 'all') {
      results = results.filter(p => p.categoria === filters.category);
    }

    // Filtro de preço
    results = results.filter(p =>
      p.preco_aoa >= filters.minPrice &&
      p.preco_aoa <= (filters.maxPrice === Infinity ? Infinity : filters.maxPrice)
    );

    // Filtro de estoque
    if (filters.inStock) {
      results = results.filter(p => p.estoque > 0);
    }

    // Filtro de promoção
    if (filters.onSale) {
      results = results.filter(p => p.preco_anterior && p.preco_anterior > p.preco_aoa);
    }

    // Ordenação
    switch (filters.sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.preco_aoa - b.preco_aoa);
        break;
      case 'price-desc':
        results.sort((a, b) => b.preco_aoa - a.preco_aoa);
        break;
      case 'name-asc':
        results.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'name-desc':
        results.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'newest':
        // Assumindo que produtos mais recentes têm IDs maiores
        results.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    onSearchResults(results);
  }, [searchQuery, filters, products]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.categoria)))];

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.nome);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: Infinity,
      inStock: false,
      onSale: false,
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      {/* Barra de Busca */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos, categorias..."
            className="w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-[#E31E24]"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <SlidersHorizontal className="size-5" />
            Filtros
          </Button>
        </div>

        {/* Sugestões Autocomplete */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {suggestions.map(product => (
              <button
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left"
              >
                <img
                  src={product.imagem_url}
                  alt={product.nome}
                  className="size-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{product.nome}</p>
                  <p className="text-xs text-gray-500">{product.categoria}</p>
                </div>
                <p className="font-bold text-[#E31E24]">
                  {product.preco_aoa.toLocaleString('pt-AO')} Kz
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Todas</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Faixa de Preço */}
            <div>
              <label className="block text-sm font-medium mb-2">Preço Mínimo</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preço Máximo</label>
              <input
                type="number"
                value={filters.maxPrice === Infinity ? '' : filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : Infinity })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ilimitado"
              />
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium mb-2">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="newest">Mais recentes</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                className="size-4 text-[#E31E24] rounded"
              />
              <span className="text-sm">Apenas em estoque</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => setFilters({ ...filters, onSale: e.target.checked })}
                className="size-4 text-[#E31E24] rounded"
              />
              <span className="text-sm">Em promoção</span>
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="size-4 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
