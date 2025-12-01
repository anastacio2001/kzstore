/**
 * Utilitário para operações Key-Value usando Edge Function
 * Usa o edge function que tem acesso ao Service Role Key
 */

import { projectId, publicAnonKey } from './info';

const KV_API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/kv`;

export type KVValue = {
  key: string;
  value: any;
  created_at?: string;
  updated_at?: string;
};

/**
 * Helper para fazer requisições ao edge function
 */
async function kvRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${KV_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KV Error: ${response.statusText} - ${error}`);
  }

  return response.json();
}

/**
 * Get - Obtém um único valor por chave
 */
export async function kvGet<T = any>(key: string): Promise<T | null> {
  try {
    const result = await kvRequest<{ value: T | null }>(`/get?key=${encodeURIComponent(key)}`);
    return result.value;
  } catch (error) {
    console.error(`[KV] Error getting key "${key}":`, error);
    return null;
  }
}

/**
 * Set - Define um valor para uma chave
 */
export async function kvSet<T = any>(key: string, value: T): Promise<boolean> {
  try {
    await kvRequest('/set', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
    return true;
  } catch (error) {
    console.error(`[KV] Error setting key "${key}":`, error);
    return false;
  }
}

/**
 * Delete - Remove uma chave
 */
export async function kvDelete(key: string): Promise<boolean> {
  try {
    await kvRequest(`/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`[KV] Error deleting key "${key}":`, error);
    return false;
  }
}

/**
 * MGet - Obtém múltiplos valores por chaves
 */
export async function kvMGet<T = any>(keys: string[]): Promise<(T | null)[]> {
  try {
    const result = await kvRequest<{ values: (T | null)[] }>('/mget', {
      method: 'POST',
      body: JSON.stringify({ keys }),
    });
    return result.values;
  } catch (error) {
    console.error(`[KV] Error getting multiple keys:`, error);
    return keys.map(() => null);
  }
}

/**
 * MSet - Define múltiplos valores
 */
export async function kvMSet(entries: Array<{ key: string; value: any }>): Promise<boolean> {
  try {
    await kvRequest('/mset', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
    return true;
  } catch (error) {
    console.error(`[KV] Error setting multiple keys:`, error);
    return false;
  }
}

/**
 * MDelete - Remove múltiplas chaves
 */
export async function kvMDelete(keys: string[]): Promise<boolean> {
  try {
    await kvRequest('/mdelete', {
      method: 'DELETE',
      body: JSON.stringify({ keys }),
    });
    return true;
  } catch (error) {
    console.error(`[KV] Error deleting multiple keys:`, error);
    return false;
  }
}

/**
 * GetByPrefix - Obtém todos os valores com um prefixo
 */
export async function kvGetByPrefix<T = any>(prefix: string): Promise<Array<{ key: string; value: T }>> {
  try {
    const result = await kvRequest<{ items: Array<{ key: string; value: T }> }>(
      `/prefix?prefix=${encodeURIComponent(prefix)}`
    );
    return result.items || [];
  } catch (error) {
    console.error(`[KV] Error getting by prefix "${prefix}":`, error);
    return [];
  }
}

/**
 * DeleteByPrefix - Remove todos os valores com um prefixo
 */
export async function kvDeleteByPrefix(prefix: string): Promise<boolean> {
  try {
    await kvRequest(`/prefix?prefix=${encodeURIComponent(prefix)}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`[KV] Error deleting by prefix "${prefix}":`, error);
    return false;
  }
}

/**
 * Count - Conta quantas chaves existem com um prefixo
 */
export async function kvCount(prefix?: string): Promise<number> {
  try {
    const url = prefix ? `/count?prefix=${encodeURIComponent(prefix)}` : '/count';
    const result = await kvRequest<{ count: number }>(url);
    return result.count;
  } catch (error) {
    console.error(`[KV] Error counting keys:`, error);
    return 0;
  }
}

/**
 * Exists - Verifica se uma chave existe
 */
export async function kvExists(key: string): Promise<boolean> {
  try {
    const result = await kvRequest<{ exists: boolean }>(`/exists?key=${encodeURIComponent(key)}`);
    return result.exists;
  } catch (error) {
    console.error(`[KV] Error checking existence of key "${key}":`, error);
    return false;
  }
}
