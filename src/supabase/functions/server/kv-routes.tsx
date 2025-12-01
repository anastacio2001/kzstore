/**
 * 🗄️ KV ROUTES - KZSTORE
 * Rotas para o Key-Value Store (tabela kv_store_d8a4dffd)
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

export const kvRoutes = new Hono();

// GET /kv/:key - Buscar valor por chave
kvRoutes.get('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    console.log('🔍 [KV] Getting key:', key);
    
    const value = await kv.get(key);
    
    if (value === null) {
      return c.json({ error: 'Key not found' }, 404);
    }
    
    return c.json({ key, value });
  } catch (error) {
    console.error('❌ [KV] Error getting key:', error);
    return c.json({ error: 'Failed to get key', details: String(error) }, 500);
  }
});

// GET /kv/prefix - Buscar valores por prefixo (usando query parameter)
kvRoutes.get('/prefix', async (c) => {
  try {
    const prefix = c.req.query('prefix');
    
    if (!prefix) {
      return c.json({ error: 'Prefix query parameter is required' }, 400);
    }
    
    console.log('🔍 [KV] Getting by prefix:', prefix);
    
    const values = await kv.getByPrefix(prefix);
    
    console.log(`✅ [KV] Found ${values.length} values for prefix:`, prefix);
    
    return c.json({ prefix, values, count: values.length });
  } catch (error) {
    console.error('❌ [KV] Error getting by prefix:', error);
    return c.json({ error: 'Failed to get by prefix', details: String(error) }, 500);
  }
});

// POST /kv/set - Definir valor para chave
kvRoutes.post('/set', async (c) => {
  try {
    const { key, value } = await c.req.json();
    
    if (!key) {
      return c.json({ error: 'Key is required' }, 400);
    }
    
    console.log('💾 [KV] Setting key:', key);
    
    await kv.set(key, value);
    
    return c.json({ message: 'Key set successfully', key });
  } catch (error) {
    console.error('❌ [KV] Error setting key:', error);
    return c.json({ error: 'Failed to set key', details: String(error) }, 500);
  }
});

// POST /kv/mset - Definir múltiplos valores
kvRoutes.post('/mset', async (c) => {
  try {
    const { entries } = await c.req.json();
    
    if (!entries || !Array.isArray(entries)) {
      return c.json({ error: 'Entries array is required' }, 400);
    }
    
    console.log('💾 [KV] Setting multiple keys:', entries.length);
    
    await kv.mset(entries);
    
    return c.json({ message: 'Keys set successfully', count: entries.length });
  } catch (error) {
    console.error('❌ [KV] Error setting multiple keys:', error);
    return c.json({ error: 'Failed to set keys', details: String(error) }, 500);
  }
});

// DELETE /kv/:key - Deletar chave
kvRoutes.delete('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    console.log('🗑️ [KV] Deleting key:', key);
    
    await kv.del(key);
    
    return c.json({ message: 'Key deleted successfully', key });
  } catch (error) {
    console.error('❌ [KV] Error deleting key:', error);
    return c.json({ error: 'Failed to delete key', details: String(error) }, 500);
  }
});

// POST /kv/mdel - Deletar múltiplas chaves
kvRoutes.post('/mdel', async (c) => {
  try {
    const { keys } = await c.req.json();
    
    if (!keys || !Array.isArray(keys)) {
      return c.json({ error: 'Keys array is required' }, 400);
    }
    
    console.log('🗑️ [KV] Deleting multiple keys:', keys.length);
    
    await kv.mdel(keys);
    
    return c.json({ message: 'Keys deleted successfully', count: keys.length });
  } catch (error) {
    console.error('❌ [KV] Error deleting multiple keys:', error);
    return c.json({ error: 'Failed to delete keys', details: String(error) }, 500);
  }
});

console.log('✅ KV Routes loaded successfully');