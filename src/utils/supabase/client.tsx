import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Cliente Supabase para uso público (com RLS)
 */
export function getSupabaseClient() {
  // Deprecated: Supabase usage removed in favor of backend JWT authentication.
  // If you see this called in code, update the component to use /api/auth endpoints.
  throw new Error('Supabase client is deprecated. Use backend JWT auth via /api/auth endpoints.');
}