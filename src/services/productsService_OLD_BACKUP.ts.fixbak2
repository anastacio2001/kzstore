/**
 * Products Service - Gerenciamento de Produtos usando APENAS Supabase
 * @author KZSTORE
 * @description Gerenciamento completo de produtos sem KV Store
 */

import { getSupabaseClient } from '../utils/supabase/client';

const supabase = getSupabaseClient();

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco_aoa: number;
  preco_usd?: number;
  categoria: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  imagens?: string[];
  especificacoes?: Record<string, any>;
  tags?: string[];
  destaque?: boolean;
  peso_kg?: number;
  dimensoes?: {
    comprimento: number;
    largura: number;
    altura: number;
  };
  sku?: string;
  codigo_barras?: string;
  fornecedor?: string;
  custo_aoa?: number;
  margem_lucro?: number;
  created_at?: string;
  updated_at?: string;
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
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
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
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Buscar produtos com filtros
 */
export async function getProductsWithFilters(filters: ProductFilters): Promise<Product[]> {
  try {
    
    let query = supabase
      .from('products')
      .select('*');

    // Aplicar filtros
    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria);
    }
    
    if (filters.subcategoria) {
      query = query.eq('subcategoria', filters.subcategoria);
    }
    
    if (filters.marca) {
      query = query.eq('marca', filters.marca);
    }
    
    if (filters.preco_min !== undefined) {
      query = query.gte('preco_aoa', filters.preco_min);
    }
    
    if (filters.preco_max !== undefined) {
      query = query.lte('preco_aoa', filters.preco_max);
    }
    
    if (filters.em_estoque) {
      query = query.gt('estoque', 0);
    }
    
    if (filters.destaque) {
      query = query.eq('destaque', true);
    }
    
    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching products with filters:', error);
    throw error;
  }
}

/**
 * Buscar produtos por categoria
 */
export async function getProductsByCategory(categoria: string): Promise<Product[]> {
  return getProductsWithFilters({ categoria });
}

/**
 * Buscar produtos em destaque
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return getProductsWithFilters({ destaque: true });
}

/**
 * Buscar produtos disponíveis (em estoque)
 */
export async function getProductsInStock(): Promise<Product[]> {
  return getProductsWithFilters({ em_estoque: true });
}

/**
 * Criar produto (Admin)
 */
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  try {
    
    const newProduct = {
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('❌ [PRODUCTS] Error creating product:', error);
    throw error;
  }
}

/**
 * Atualizar produto (Admin)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error updating product ${id}:`, error);
    throw error;
  }
}

/**
 * Atualizar estoque
 */
export async function updateProductStock(productId: string, quantity: number): Promise<Product> {
  try {
    
    // Buscar produto atual
    const product = await getProductById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const newStock = Math.max(0, (product.estoque || 0) + quantity);
    
    return await updateProduct(productId, { estoque: newStock });
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error updating stock for ${productId}:`, error);
    throw error;
  }
}

/**
 * Deletar produto (Admin) - HARD DELETE
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
  } catch (error) {
    console.error(`❌ [PRODUCTS] Error deleting product ${id}:`, error);
    throw error;
  }
}

/**
 * Buscar produtos com estoque baixo
 */
export async function getLowStockProducts(threshold: number = 5): Promise<Product[]> {
  try {
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('estoque', 0)
      .lte('estoque', threshold)
      .order('estoque', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching low stock products:', error);
    throw error;
  }
}

/**
 * Buscar estatísticas de produtos
 */
export async function getProductStats() {
  try {
    
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    const stats = {
      total_products: data.length,
      total_value: data.reduce((sum, p) => sum + (p.preco_aoa * p.estoque), 0),
      in_stock: data.filter(p => p.estoque > 0).length,
      out_of_stock: data.filter(p => p.estoque === 0).length,
      low_stock: data.filter(p => p.estoque > 0 && p.estoque <= (p.estoque_minimo || 5)).length,
      categories: [...new Set(data.map(p => p.categoria))].length,
      brands: [...new Set(data.map(p => p.marca).filter(Boolean))].length,
    };
    
    return stats;
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching product stats:', error);
    throw error;
  }
}
