/**
 * Customers Service - Gerenciamento de Clientes usando APENAS Supabase
 * @author KZSTORE
 */

import { getSupabaseClient } from '../utils/supabase/client';

const supabase = getSupabaseClient();

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  addresses?: Address[];
  preferences?: CustomerPreferences;
  loyalty_points?: number;
  loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_spent?: number;
  total_orders?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code?: string;
  landmark?: string;
  is_default: boolean;
}

export interface CustomerPreferences {
  newsletter: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  favorite_categories?: string[];
  language?: string;
}

/**
 * Buscar todos os clientes
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error fetching customers:', error);
    throw error;
  }
}

/**
 * Buscar cliente por ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error fetching customer ${id}:`, error);
    return null;
  }
}

/**
 * Buscar cliente por email
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  try {
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error fetching customer by email:`, error);
    return null;
  }
}

/**
 * Buscar cliente por user_id (Supabase Auth)
 */
export async function getCustomerByUserId(userId: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error fetching customer by user_id:`, error);
    return null;
  }
}

/**
 * Criar cliente
 */
export async function createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  try {
    
    const newCustomer = {
      ...customerData,
      email: customerData.email.toLowerCase(),
      active: true,
      loyalty_points: 0,
      loyalty_tier: 'bronze' as const,
      total_spent: 0,
      total_orders: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error creating customer:', error);
    throw error;
  }
}

/**
 * Atualizar cliente
 */
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  try {
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error updating customer ${id}:`, error);
    throw error;
  }
}

/**
 * Atualizar pontos de fidelidade
 */
export async function updateLoyaltyPoints(
  customerId: string, 
  points: number, 
  orderTotal?: number
): Promise<Customer> {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const newPoints = (customer.loyalty_points || 0) + points;
    const newTotalSpent = (customer.total_spent || 0) + (orderTotal || 0);
    const newTotalOrders = (customer.total_orders || 0) + (orderTotal ? 1 : 0);

    // Calcular tier baseado no total gasto
    let tier: Customer['loyalty_tier'] = 'bronze';
    if (newTotalSpent >= 500000) tier = 'platinum';
    else if (newTotalSpent >= 250000) tier = 'gold';
    else if (newTotalSpent >= 100000) tier = 'silver';

    return await updateCustomer(customerId, {
      loyalty_points: newPoints,
      loyalty_tier: tier,
      total_spent: newTotalSpent,
      total_orders: newTotalOrders,
    });
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error updating loyalty points:', error);
    throw error;
  }
}

/**
 * Adicionar endereço ao cliente
 */
export async function addCustomerAddress(customerId: string, address: Omit<Address, 'id'>): Promise<Customer> {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const addresses = customer.addresses || [];
    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Se for o primeiro endereço ou marcado como padrão, definir como padrão
    if (addresses.length === 0 || newAddress.is_default) {
      addresses.forEach(addr => addr.is_default = false);
      newAddress.is_default = true;
    }

    return await updateCustomer(customerId, {
      addresses: [...addresses, newAddress]
    });
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error adding address:', error);
    throw error;
  }
}

/**
 * Atualizar endereço do cliente
 */
export async function updateCustomerAddress(
  customerId: string, 
  addressId: string, 
  updates: Partial<Address>
): Promise<Customer> {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const addresses = customer.addresses || [];
    const addressIndex = addresses.findIndex(a => a.id === addressId);
    
    if (addressIndex === -1) throw new Error('Address not found');

    // Se estiver marcando como padrão, desmarcar outros
    if (updates.is_default) {
      addresses.forEach(addr => addr.is_default = false);
    }

    addresses[addressIndex] = { ...addresses[addressIndex], ...updates };

    return await updateCustomer(customerId, { addresses });
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error updating address:', error);
    throw error;
  }
}

/**
 * Remover endereço do cliente
 */
export async function removeCustomerAddress(customerId: string, addressId: string): Promise<Customer> {
  try {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const addresses = (customer.addresses || []).filter(a => a.id !== addressId);

    // Se removeu o endereço padrão, definir outro como padrão
    if (addresses.length > 0 && !addresses.some(a => a.is_default)) {
      addresses[0].is_default = true;
    }

    return await updateCustomer(customerId, { addresses });
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error removing address:', error);
    throw error;
  }
}

/**
 * Deletar cliente (soft delete)
 */
export async function deleteCustomer(id: string): Promise<void> {
  try {
    
    await updateCustomer(id, { active: false });
    
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error deleting customer ${id}:`, error);
    throw error;
  }
}

/**
 * Buscar clientes por tier de fidelidade
 */
export async function getCustomersByTier(tier: Customer['loyalty_tier']): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('loyalty_tier', tier)
      .eq('active', true)
      .order('loyalty_points', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`❌ [CUSTOMERS] Error fetching customers by tier:`, error);
    throw error;
  }
}

/**
 * Buscar estatísticas de clientes
 */
export async function getCustomerStats() {
  try {
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('active', true);

    if (error) throw error;

    const stats = {
      total_customers: data.length,
      total_value: data.reduce((sum, c) => sum + (c.total_spent || 0), 0),
      average_spent: data.length > 0 
        ? data.reduce((sum, c) => sum + (c.total_spent || 0), 0) / data.length 
        : 0,
      by_tier: {
        bronze: data.filter(c => c.loyalty_tier === 'bronze').length,
        silver: data.filter(c => c.loyalty_tier === 'silver').length,
        gold: data.filter(c => c.loyalty_tier === 'gold').length,
        platinum: data.filter(c => c.loyalty_tier === 'platinum').length,
      },
      total_loyalty_points: data.reduce((sum, c) => sum + (c.loyalty_points || 0), 0),
    };
    
    return stats;
  } catch (error) {
    console.error('❌ [CUSTOMERS] Error fetching customer stats:', error);
    throw error;
  }
}
