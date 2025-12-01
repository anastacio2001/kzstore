/**
 * Products Service - Gerenciamento de Produtos usando API Local
 * @author KZSTORE
 */

const API_BASE = '/api';

export interface Product {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  descricao: string;
  preco_aoa: number;
  preco_usd?: number;
  estoque: number;
  marca?: string;
  modelo?: string;
  imagem_url?: string;
  imagens?: string[];
  especificacoes?: Record<string, any>;
  tags?: string[];
  ativo: boolean;
  destaque?: boolean;
  desconto_percentual?: number;
  preco_promocional?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  preco_min?: number;
  preco_max?: number;
  em_estoque?: boolean;
  destaque?: boolean;
  search?: string;
}

/**
 * Buscar todos os produtos
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching products:', error);
    throw error;
  }
}

/**
 * Buscar produto por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Buscar produtos com filtros
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    
    let filtered = products;
    
    if (filters.categoria) {
      filtered = filtered.filter(p => p.categoria.toLowerCase() === filters.categoria!.toLowerCase());
    }
    
    if (filters.subcategoria) {
      filtered = filtered.filter(p => p.subcategoria?.toLowerCase() === filters.subcategoria!.toLowerCase());
    }
    
    if (filters.marca) {
      filtered = filtered.filter(p => p.marca?.toLowerCase() === filters.marca!.toLowerCase());
    }
    
    if (filters.preco_min !== undefined) {
      filtered = filtered.filter(p => p.preco_aoa >= filters.preco_min!);
    }
    
    if (filters.preco_max !== undefined) {
      filtered = filtered.filter(p => p.preco_aoa <= filters.preco_max!);
    }
    
    if (filters.em_estoque) {
      filtered = filtered.filter(p => p.estoque > 0);
    }
    
    if (filters.destaque) {
      filtered = filtered.filter(p => p.destaque === true);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(searchLower) ||
        p.descricao.toLowerCase().includes(searchLower) ||
        p.marca?.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  } catch (error) {
    console.error('❌ [PRODUCTS] Error filtering products:', error);
    throw error;
  }
}

/**
 * Criar produto
 */
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  try {
    
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...productData,
        ativo: true,
      }),
    });

    if (!response.ok) throw new Error('Failed to create product');
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('❌ [PRODUCTS] Error creating product:', error);
    throw error;
  }
}

/**
 * Atualizar produto
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {

    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update product');
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error updating product ${id}:`, error);
    throw error;
  }
}

/**
 * Deletar produto
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete product');
    
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error deleting product ${id}:`, error);
    throw error;
  }
}

/**
 * Atualizar estoque
 */
export async function updateProductStock(id: string, quantity: number): Promise<Product> {
  try {

    const response = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) throw new Error('Failed to update stock');
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error updating stock:`, error);
    throw error;
  }
}

/**
 * Buscar produtos em destaque
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ destaque: true });
}

/**
 * Buscar produtos por categoria
 */
export async function getProductsByCategory(categoria: string): Promise<Product[]> {
  return getProducts({ categoria });
}

/**
 * Buscar produtos com estoque baixo
 */
export async function getLowStockProducts(threshold: number = 10): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    return products.filter(p => p.estoque > 0 && p.estoque <= threshold);
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching low stock products:', error);
    throw error;
  }
}

/**
 * Buscar produtos sem estoque
 */
export async function getOutOfStockProducts(): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    return products.filter(p => p.estoque === 0);
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching out of stock products:', error);
    throw error;
  }
}

/**
 * Desativar produto
 */
export async function deactivateProduct(id: string): Promise<Product> {
  return await updateProduct(id, { ativo: false });
}

/**
 * Ativar produto
 */
export async function activateProduct(id: string): Promise<Product> {
  return await updateProduct(id, { ativo: true });
}

/**
 * Buscar produtos relacionados
 */
export async function getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product) return [];
    
    const products = await getProducts({
      categoria: product.categoria,
      em_estoque: true,
    });
    
    return products
      .filter(p => p.id !== productId)
      .slice(0, limit);
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching related products:', error);
    return [];
  }
}
