/**
 * Categories Service - Gerenciamento de Categorias usando API Local
 * @author KZSTORE
 */

const API_BASE = '/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  parent_id?: string | null;
  order?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * CATEGORIAS
 */

/**
 * Buscar todas as categorias
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    
    const response = await fetch(`${API_BASE}/categories`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('❌ [CATEGORIES] Error fetching categories:', error);
    throw error;
  }
}

/**
 * Buscar categorias ativas
 */
export async function getActiveCategories(): Promise<Category[]> {
  try {
    
    const allCategories = await getAllCategories();
    const activeCategories = allCategories.filter(cat => cat.active);
    
    return activeCategories;
  } catch (error) {
    console.error('❌ [CATEGORIES] Error fetching active categories:', error);
    throw error;
  }
}

/**
 * Buscar categoria por ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    
    const response = await fetch(`${API_BASE}/categories/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [CATEGORIES] Error fetching category ${id}:`, error);
    return null;
  }
}

/**
 * Buscar categoria por slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    
    const allCategories = await getAllCategories();
    const category = allCategories.find(cat => cat.slug === slug);
    
    if (category) {
    } else {
    }
    
    return category || null;
  } catch (error) {
    console.error(`❌ [CATEGORIES] Error fetching category by slug:`, error);
    return null;
  }
}

/**
 * Criar categoria
 */
export async function createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  try {
    
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [CATEGORIES] Error creating category:', error);
    throw error;
  }
}

/**
 * Atualizar categoria
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  try {
    
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [CATEGORIES] Error updating category ${id}:`, error);
    throw error;
  }
}

/**
 * Deletar categoria (soft delete)
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    
    await updateCategory(id, { active: false });
    
  } catch (error) {
    console.error(`❌ [CATEGORIES] Error deleting category ${id}:`, error);
    throw error;
  }
}

/**
 * SUBCATEGORIAS
 */

/**
 * Buscar todas as subcategorias
 */
export async function getAllSubcategories(): Promise<Subcategory[]> {
  try {
    
    const response = await fetch(`${API_BASE}/subcategories`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('❌ [SUBCATEGORIES] Error fetching subcategories:', error);
    throw error;
  }
}

/**
 * Buscar subcategorias de uma categoria
 */
export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  try {
    
    const allSubcategories = await getAllSubcategories();
    const filtered = allSubcategories.filter(
      sub => sub.category_id === categoryId && sub.active
    );
    
    return filtered;
  } catch (error) {
    console.error(`❌ [SUBCATEGORIES] Error fetching subcategories for category ${categoryId}:`, error);
    throw error;
  }
}

/**
 * Buscar subcategoria por ID
 */
export async function getSubcategoryById(id: string): Promise<Subcategory | null> {
  try {
    
    const response = await fetch(`${API_BASE}/subcategories/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [SUBCATEGORIES] Error fetching subcategory ${id}:`, error);
    return null;
  }
}

/**
 * Criar subcategoria
 */
export async function createSubcategory(subcategoryData: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>): Promise<Subcategory> {
  try {
    
    const response = await fetch(`${API_BASE}/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subcategoryData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [SUBCATEGORIES] Error creating subcategory:', error);
    throw error;
  }
}

/**
 * Atualizar subcategoria
 */
export async function updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<Subcategory> {
  try {
    
    const response = await fetch(`${API_BASE}/subcategories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [SUBCATEGORIES] Error updating subcategory ${id}:`, error);
    throw error;
  }
}

/**
 * Deletar subcategoria (soft delete)
 */
export async function deleteSubcategory(id: string): Promise<void> {
  try {
    
    await updateSubcategory(id, { active: false });
    
  } catch (error) {
    console.error(`❌ [SUBCATEGORIES] Error deleting subcategory ${id}:`, error);
    throw error;
  }
}

/**
 * Buscar categorias com suas subcategorias
 */
export async function getCategoriesWithSubcategories() {
  try {
    
    const categories = await getActiveCategories();
    const subcategories = await getAllSubcategories();
    
    const categoriesWithSubs = categories.map(category => ({
      ...category,
      subcategories: subcategories.filter(sub => sub.category_id === category.id && sub.active)
    }));
    
    return categoriesWithSubs;
  } catch (error) {
    console.error('❌ [CATEGORIES] Error fetching categories with subcategories:', error);
    throw error;
  }
}
