import { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Middleware de autenticação para rotas admin
export async function requireAuth(c: Context, next: () => Promise<void>) {
  try {
    const authHeader = c.req.header('Authorization');
    
    console.log('🔒 Auth middleware - Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    console.log('🔒 Auth middleware - Token:', token.substring(0, 20) + '...');
    
    // Verificar token demo admin
    if (token === Deno.env.get('SUPABASE_ANON_KEY')) {
      console.log('⚠️ Using public anon key - checking for demo_admin_token');
      // Token público - verificar se há um user_id no body ou query
      const body = await c.req.json().catch(() => ({}));
      if (body.demo_admin_token === 'demo-admin') {
        await next();
        return;
      }
    }

    // Verificar token real do Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('🔒 Auth middleware - User:', user ? user.email : 'None', 'Error:', error);

    if (error || !user) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    // Verificar se é admin
    console.log('🔒 Auth middleware - User metadata:', JSON.stringify(user.user_metadata));
    
    if (user.user_metadata?.role !== 'admin') {
      return c.json({ 
        error: 'Forbidden: Admin access required',
        debug: {
          user_email: user.email,
          user_metadata: user.user_metadata,
          role: user.user_metadata?.role
        }
      }, 403);
    }

    console.log('✅ Auth middleware - Admin access granted');
    
    // Adicionar user ao contexto
    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication error', details: String(error) }, 500);
  }
}

// Middleware de autenticação para usuários normais (não precisa ser admin)
export async function requireAuthUser(c: Context, next: () => Promise<void>) {
  try {
    const authHeader = c.req.header('Authorization');
    
    console.log('🔒 User auth middleware - Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    console.log('🔒 User auth middleware - Token:', token.substring(0, 20) + '...');
    
    // Verificar token real do Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('🔒 User auth middleware - User:', user ? user.email : 'None', 'Error:', error);

    if (error || !user) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    console.log('✅ User auth middleware - User authenticated:', user.email);
    
    // Adicionar user ao contexto
    c.set('user', user);
    await next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    return c.json({ error: 'Authentication error', details: String(error) }, 500);
  }
}