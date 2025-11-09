import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Cliente Supabase singleton compartilhado por toda aplicação
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
