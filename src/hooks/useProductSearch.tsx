import { useState, useMemo } from 'react';
import { Product } from '../App';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest';

export type FilterOptions = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  specifications?: Record<string, string[]>;
};

export function useProductSearch(products: Product[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Extract unique specification keys from all products
  const availableSpecs = useMemo(() => {
    const specs: Record<string, Set<string>> = {};
    
    products.forEach(product => {
      if (product.especificacoes) {
        Object.entries(product.especificacoes).forEach(([key, value]) => {
          if (!specs[key]) {
            specs[key] = new Set();
          }
          specs[key].add(String(value));
        });
      }
    });

    // Convert Sets to Arrays
    const result: Record<string, string[]> = {};
    Object.entries(specs).forEach(([key, values]) => {
      result[key] = Array.from(values).sort();
    });

    return result;
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoria));
    return Array.from(cats).sort();
  }, [products]);

  // Get price range
  const priceRange = useMemo(() => {
    const prices = products.map(p => p.preco_aoa);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Search and filter products
  const filteredProducts = useMemo(() => {
    let results = [...products];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => {
        const searchableText = [
          product.nome,
          product.descricao,
          product.categoria,
          ...Object.values(product.especificacoes || {}).map(String)
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      results = results.filter(p => p.categoria === filters.category);
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.preco_aoa >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.preco_aoa <= filters.maxPrice!);
    }

    // Stock filter
    if (filters.inStock) {
      results = results.filter(p => p.estoque > 0);
    }

    // Specifications filter
    if (filters.specifications) {
      Object.entries(filters.specifications).forEach(([key, values]) => {
        if (values.length > 0) {
          results = results.filter(product => {
            const productValue = product.especificacoes?.[key];
            return productValue && values.includes(String(productValue));
          });
        }
      });
    }

    // Sort results
    switch (sortBy) {
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
        // Assume products are already in newest-first order
        break;
      case 'relevance':
      default:
        // If there's a search query, keep relevance order
        // Otherwise, keep original order
        break;
    }

    return results;
  }, [products, searchQuery, sortBy, filters]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateSpecificationFilter = (specKey: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specKey]: values
      }
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSortBy('relevance');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.inStock) count++;
    if (filters.specifications) {
      count += Object.values(filters.specifications).filter(v => v.length > 0).length;
    }
    return count;
  }, [filters]);

  return {
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
  };
}
