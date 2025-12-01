import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, DollarSign, Package, Sliders } from 'lucide-react';
import { Button } from './ui/button';
import { FilterOptions } from '../hooks/useProductSearch';

interface CategoryWithIcon {
  id: string;
  name: string;
  icon?: string;
}

type ProductFiltersProps = {
  categories: CategoryWithIcon[] | string[];
  availableSpecs: Record<string, string[]>;
  priceRange: { min: number; max: number };
  filters: FilterOptions;
  onUpdateFilter: (key: keyof FilterOptions, value: any) => void;
  onUpdateSpecFilter: (specKey: string, values: string[]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
};

export function ProductFilters({
  categories,
  availableSpecs,
  priceRange,
  filters,
  onUpdateFilter,
  onUpdateSpecFilter,
  onClearFilters,
  activeFilterCount
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    stock: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSpecChange = (specKey: string, value: string, checked: boolean) => {
    const currentValues = filters.specifications?.[specKey] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    onUpdateSpecFilter(specKey, newValues);
  };

  return (
    <>
      {/* Filters Panel - No mobile button needed, controlled by ProductsPage Sheet */}
      <div className="bg-white rounded-xl lg:rounded-2xl border-2 border-gray-100 overflow-hidden">
        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="size-4 sm:size-5 text-red-600" />
              <span className="hidden sm:inline">Filtros</span>
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <X className="size-4" />
                Limpar
              </button>
            )}
          </div>
          {activeFilterCount > 0 && (
            <p className="text-sm text-gray-600">
              {activeFilterCount} {activeFilterCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            </p>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[600px] overflow-y-auto">
          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                Categoria
              </h4>
              {expandedSections.category ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            {expandedSections.category && (
              <div className="space-y-2">
                <button
                  onClick={() => onUpdateFilter('category', 'all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                    !filters.category || filters.category === 'all'
                      ? 'bg-red-600 text-white font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Todas as Categorias
                </button>
                {categories.map(category => {
                  // Suportar tanto string[] quanto CategoryWithIcon[]
                  const catId = typeof category === 'string' ? category : category.id;
                  const catName = typeof category === 'string' ? category : category.name;
                  const catIcon = typeof category === 'string' ? '' : category.icon;
                  
                  return (
                    <button
                      key={catId}
                      onClick={() => onUpdateFilter('category', catId)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                        filters.category === catId
                          ? 'bg-red-600 text-white font-semibold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {catIcon && <span className="text-lg">{catIcon}</span>}
                      <span>{catName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-2">
                <DollarSign className="size-4" />
                Faixa de Preço
              </h4>
              {expandedSections.price ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            {expandedSections.price && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Preço Mínimo: {(filters.minPrice || priceRange.min || 0).toLocaleString('pt-AO')} AOA
                  </label>
                  <input
                    type="range"
                    min={priceRange.min || 0}
                    max={priceRange.max || 100000}
                    value={filters.minPrice || priceRange.min || 0}
                    onChange={(e) => onUpdateFilter('minPrice', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Preço Máximo: {(filters.maxPrice || priceRange.max || 100000).toLocaleString('pt-AO')} AOA
                  </label>
                  <input
                    type="range"
                    min={priceRange.min || 0}
                    max={priceRange.max || 100000}
                    value={filters.maxPrice || priceRange.max || 100000}
                    onChange={(e) => onUpdateFilter('maxPrice', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Faixa selecionada:</span>
                  <span className="font-semibold text-gray-900">
                    {(filters.minPrice || priceRange.min || 0).toLocaleString('pt-AO')} - {(filters.maxPrice || priceRange.max || 100000).toLocaleString('pt-AO')} AOA
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Stock Filter */}
          <div>
            <button
              onClick={() => toggleSection('stock')}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-2">
                <Package className="size-4" />
                Disponibilidade
              </h4>
              {expandedSections.stock ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>

            {expandedSections.stock && (
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => onUpdateFilter('inStock', e.target.checked)}
                  className="size-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700 font-medium">Apenas em Estoque</span>
              </label>
            )}
          </div>

          {/* Technical Specifications Filters */}
          {Object.entries(availableSpecs).map(([specKey, values]) => (
            <div key={specKey}>
              <div className="divider" />
              <button
                onClick={() => toggleSection(specKey)}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                  {specKey}
                </h4>
                {expandedSections[specKey] ? (
                  <ChevronUp className="size-4 text-gray-400" />
                ) : (
                  <ChevronDown className="size-4 text-gray-400" />
                )}
              </button>

              {expandedSections[specKey] && (
                <div className="space-y-2">
                  {values.map(value => (
                    <label
                      key={value}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={filters.specifications?.[specKey]?.includes(value) || false}
                        onChange={(e) => handleSpecChange(specKey, value, e.target.checked)}
                        className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{value}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Apply Button */}
        <div className="lg:hidden p-4 border-t border-gray-100">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
          >
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </>
  );
}