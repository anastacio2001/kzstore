/**
 * Coupons Service - Gerenciamento de Cupons usando API Local (Prisma/MySQL)
 * @author KZSTORE
 */

const API_BASE = '/api';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_value?: number;
  max_discount?: number;
  
  // Novos campos
  category_id?: string | null;
  first_purchase_only?: boolean;
  user_specific?: string | null;
  
  usage_limit?: number;
  used_count?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean; // API retorna is_active (snake_case do Prisma)
  applicable_categories?: string[];
  applicable_products?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Buscar todos os cupons
 */
export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    
    const response = await fetch(`${API_BASE}/coupons`);
    if (!response.ok) throw new Error('Failed to fetch coupons');
    
    const data = await response.json();
    return data.coupons || [];
  } catch (error) {
    console.error('❌ [COUPONS] Error fetching coupons:', error);
    throw error;
  }
}

/**
 * Buscar cupons ativos
 */
export async function getActiveCoupons(): Promise<Coupon[]> {
  try {
    
    const response = await fetch(`${API_BASE}/coupons/active`);
    if (!response.ok) throw new Error('Failed to fetch active coupons');
    
    const data = await response.json();
    return data.coupons || [];
  } catch (error) {
    console.error('❌ [COUPONS] Error fetching active coupons:', error);
    throw error;
  }
}

/**
 * Buscar cupom por código
 */
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    
    const response = await fetch(`${API_BASE}/coupons/code/${code.toUpperCase()}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch coupon');
    }
    
    const data = await response.json();
    return data.coupon;
  } catch (error) {
    console.error(`❌ [COUPONS] Error fetching coupon ${code}:`, error);
    return null;
  }
}

/**
 * Validar cupom
 */
export async function validateCoupon(
  code: string, 
  cartTotal: number,
  productIds?: string[],
  categories?: string[]
): Promise<{ valid: boolean; message: string; coupon?: Coupon }> {
  try {
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Cupom não encontrado' };
    }

    // Verificar se está ativo (API retorna is_active)
    if (!coupon.is_active) {
      return { valid: false, message: 'Cupom inativo' };
    }

    // Verificar validade (data)
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { valid: false, message: 'Cupom ainda não está válido' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, message: 'Cupom expirado' };
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: 'Cupom esgotado' };
    }

    // Verificar valor mínimo de compra
    if (coupon.minimum_order_value && cartTotal < coupon.minimum_order_value) {
      return {
        valid: false,
        message: `Compra mínima de ${coupon.minimum_order_value.toLocaleString('pt-AO')} AOA necessária`
      };
    }

    // Verificar produtos aplicáveis
    if (coupon.applicable_products && coupon.applicable_products.length > 0 && productIds) {
      const hasValidProduct = productIds.some(id => 
        coupon.applicable_products!.includes(id)
      );
      if (!hasValidProduct) {
        return { valid: false, message: 'Cupom não aplicável aos produtos no carrinho' };
      }
    }

    // Verificar categorias aplicáveis
    if (coupon.applicable_categories && coupon.applicable_categories.length > 0 && categories) {
      const hasValidCategory = categories.some(cat => 
        coupon.applicable_categories!.includes(cat)
      );
      if (!hasValidCategory) {
        return { valid: false, message: 'Cupom não aplicável às categorias no carrinho' };
      }
    }

    return { valid: true, message: 'Cupom válido!', coupon };
  } catch (error) {
    console.error('❌ [COUPONS] Error validating coupon:', error);
    return { valid: false, message: 'Erro ao validar cupom' };
  }
}

/**
 * Calcular desconto do cupom
 */
export function calculateDiscount(coupon: Coupon, cartTotal: number): number {
  let discount = 0;
  
  if (coupon.discount_type === 'percentage') {
    discount = cartTotal * (coupon.discount_value / 100);
    
    // Aplicar desconto máximo se definido
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else if (coupon.discount_type === 'fixed') {
    discount = coupon.discount_value;
  }
  
  // Desconto não pode ser maior que o total
  return Math.min(discount, cartTotal);
}

/**
 * Criar cupom
 */
export async function createCoupon(couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>): Promise<Coupon> {
  try {
    
    const newCoupon = {
      ...couponData,
      code: couponData.code.toUpperCase(),
      used_count: 0,
    };

    const response = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create coupon');
    }

    const data = await response.json();
    return data.coupon;
  } catch (error) {
    console.error('❌ [COUPONS] Error creating coupon:', error);
    throw error;
  }
}

/**
 * Atualizar cupom
 */
export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
  try {

    const response = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update coupon');
    }

    const data = await response.json();
    return data.coupon;
  } catch (error) {
    console.error(`❌ [COUPONS] Error updating coupon ${id}:`, error);
    throw error;
  }
}

/**
 * Incrementar contador de uso do cupom
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const coupon = await getCouponByCode(code);
    if (!coupon) throw new Error('Coupon not found');

    await updateCoupon(coupon.id, {
      used_count: (coupon.used_count || 0) + 1
    });
    
  } catch (error) {
    console.error('❌ [COUPONS] Error incrementing usage:', error);
    throw error;
  }
}

/**
 * Deletar cupom
 */
export async function deleteCoupon(id: string): Promise<void> {
  try {

    const response = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete coupon');
    }
    
  } catch (error) {
    console.error(`❌ [COUPONS] Error deleting coupon ${id}:`, error);
    throw error;
  }
}

/**
 * Desativar cupom
 */
export async function deactivateCoupon(id: string): Promise<Coupon> {
  return await updateCoupon(id, { active: false });
}

/**
 * Ativar cupom
 */
export async function activateCoupon(id: string): Promise<Coupon> {
  return await updateCoupon(id, { active: true });
}
