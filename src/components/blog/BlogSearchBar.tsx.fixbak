import { useState } from 'react';
import { Search, Filter, Calendar, User, Tag, X } from 'lucide-react';
import { Button } from '../ui/button';

type SearchFilters = {
  query: string;
  category: string;
  dateRange: string;
  author: string;
  sortBy: string;
};

type BlogSearchBarProps = {
  onSearch: (filters: SearchFilters) => void;
  categories: string[];
  authors?: string[];
};

export function BlogSearchBar({ onSearch, categories, authors = [] }: BlogSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    dateRange: 'all',
    author: 'all',
    sortBy: 'recent'
  });

  const handleSearch = () => {
    onSearch({ ...filters, query });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      query: '',
      category: 'all',
      dateRange: 'all',
      author: 'all',
      sortBy: 'recent'
    });
    onSearch({
      query: '',
      category: 'all',
      dateRange: 'all',
      author: 'all',
      sortBy: 'recent'
    });
  };

  const hasActiveFilters = 
    query !== '' ||
    filters.category !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.author !== 'all' ||
    filters.sortBy !== 'recent';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Procurar artigos... (ex: 'melhor smartphone')"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-[#E31E24] hover:bg-[#C01920] px-6"
        >
          Procurar
        </Button>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-gray-300"
        >
          <Filter className="size-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 size-2 bg-[#E31E24] rounded-full"></span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="size-4" />
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
              >
                <option value="all">Todas</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="size-4" />
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
              >
                <option value="all">Todo período</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
                <option value="year">Último ano</option>
              </select>
            </div>

            {/* Author Filter */}
            {authors.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="size-4" />
                  Autor
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  {authors.map(author => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
              >
                <option value="recent">Mais recentes</option>
                <option value="popular">Mais populares</option>
                <option value="views">Mais vistos</option>
                <option value="comments">Mais comentados</option>
                <option value="oldest">Mais antigos</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-[#E31E24] hover:bg-[#C01920]"
            >
              Aplicar Filtros
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                size="sm"
                variant="ghost"
                className="text-gray-600"
              >
                <X className="size-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {query && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  "{query}"
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  Categoria: {filters.category}
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  Período: {filters.dateRange}
                </span>
              )}
              {filters.author !== 'all' && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  Autor: {filters.author}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
