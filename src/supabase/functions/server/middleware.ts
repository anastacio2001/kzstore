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

// Rate limiting simples em memória
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return async (c: Context, next: () => Promise<void>) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    
    let record = rateLimitStore.get(ip);
    
    // Resetar se a janela expirou
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(ip, record);
    }
    
    record.count++;
    
    if (record.count > maxRequests) {
      return c.json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((record.resetTime - now) / 1000) 
      }, 429);
    }
    
    await next();
  };
}

// Validação de dados usando Zod-like pattern
export function validateProduct(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nome || typeof data.nome !== 'string' || data.nome.length < 3) {
    errors.push('Nome do produto é obrigatório e deve ter pelo menos 3 caracteres');
  }
  
  if (data.nome && data.nome.length > 200) {
    errors.push('Nome do produto não pode ter mais de 200 caracteres');
  }
  
  if (!data.descricao || typeof data.descricao !== 'string') {
    errors.push('Descrição é obrigatória');
  }
  
  if (data.descricao && data.descricao.length > 2000) {
    errors.push('Descrição não pode ter mais de 2000 caracteres');
  }
  
  if (!data.categoria || typeof data.categoria !== 'string') {
    errors.push('Categoria é obrigatória');
  }
  
  // Validar condição (opcional)
  if (data.condicao && !['Novo', 'Usado', 'Refurbished'].includes(data.condicao)) {
    errors.push('Condição deve ser "Novo", "Usado" ou "Refurbished"');
  }
  
  if (typeof data.preco_aoa !== 'number' || data.preco_aoa <= 0) {
    errors.push('Preço deve ser um número positivo');
  }
  
  if (typeof data.peso_kg !== 'number' || data.peso_kg <= 0) {
    errors.push('Peso deve ser um número positivo');
  }
  
  if (typeof data.estoque !== 'number' || data.estoque < 0) {
    errors.push('Estoque deve ser um número não-negativo');
  }
  
  if (!data.imagem_url || typeof data.imagem_url !== 'string') {
    errors.push('URL da imagem é obrigatória');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateOrder(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.customer || typeof data.customer !== 'object') {
    errors.push('Dados do cliente são obrigatórios');
  } else {
    if (!data.customer.nome || typeof data.customer.nome !== 'string') {
      errors.push('Nome do cliente é obrigatório');
    }
    if (!data.customer.telefone || typeof data.customer.telefone !== 'string') {
      errors.push('Telefone do cliente é obrigatório');
    }
    if (!data.customer.email || typeof data.customer.email !== 'string' || !data.customer.email.includes('@')) {
      errors.push('Email válido do cliente é obrigatório');
    }
    if (!data.customer.endereco || typeof data.customer.endereco !== 'string') {
      errors.push('Endereço do cliente é obrigatório');
    }
  }
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Pedido deve conter pelo menos um item');
  } else {
    data.items.forEach((item: any, index: number) => {
      if (!item.product_id) {
        errors.push(`Item ${index + 1}: ID do produto é obrigatório`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade deve ser um número positivo`);
      }
    });
  }
  
  if (typeof data.total !== 'number' || data.total <= 0) {
    errors.push('Total do pedido deve ser um número positivo');
  }
  
  if (!data.payment_method || typeof data.payment_method !== 'string') {
    errors.push('Método de pagamento é obrigatório');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Limpeza periódica do rate limit store (executar a cada hora)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);
