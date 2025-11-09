import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, DollarSign, Package, Sliders } from 'lucide-react';
import { Button } from './ui/button';
import { FilterOptions } from '../hooks/useProductSearch';

type ProductFiltersProps = {
  categories: string[];
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
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full flex items-center justify-between py-3 rounded-xl border-2"
        >
          <span className="flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="size-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`
        lg:block bg-white rounded-2xl border-2 border-gray-100 overflow-hidden
        ${isOpen ? 'block' : 'hidden'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sliders className="size-5 text-red-600" />
              Filtros
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

        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
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
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => onUpdateFilter('category', category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                      filters.category === category
                        ? 'bg-red-600 text-white font-semibold'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
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
                    Preço Mínimo: {(filters.minPrice || priceRange.min).toLocaleString('pt-AO')} AOA
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.minPrice || priceRange.min}
                    onChange={(e) => onUpdateFilter('minPrice', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Preço Máximo: {(filters.maxPrice || priceRange.max).toLocaleString('pt-AO')} AOA
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.maxPrice || priceRange.max}
                    onChange={(e) => onUpdateFilter('maxPrice', Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Faixa selecionada:</span>
                  <span className="font-semibold text-gray-900">
                    {(filters.minPrice || priceRange.min).toLocaleString('pt-AO')} - {(filters.maxPrice || priceRange.max).toLocaleString('pt-AO')} AOA
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
