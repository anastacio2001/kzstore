import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { rateLimit } from './middleware.tsx';
import { productRoutes, orderRoutes, authRoutes, chatbotRoutes, backupRoutes } from './routes.tsx';

const app = new Hono();

// Middleware global
app.use('*', cors());
app.use('*', logger(console.log));

// Rate limiting global (100 requisições por 15 minutos)
app.use('/make-server-d8a4dffd/*', rateLimit(100, 15 * 60 * 1000));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Montar rotas
app.route('/make-server-d8a4dffd/products', productRoutes);
app.route('/make-server-d8a4dffd/orders', orderRoutes);
app.route('/make-server-d8a4dffd/auth', authRoutes);
app.route('/make-server-d8a4dffd/chatbot', chatbotRoutes);
app.route('/make-server-d8a4dffd/backup', backupRoutes);

// Create customer (legacy - manter compatibilidade)
app.post('/make-server-d8a4dffd/customers', async (c) => {
  try {
    const customerData = await c.req.json();
    
    const customer = {
      id: `cust_${Date.now()}`,
      ...customerData,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`customer:${customer.id}`, customer);
    
    return c.json({ customer, message: 'Customer created successfully' }, 201);
  } catch (error) {
    console.log('Error creating customer:', error);
    return c.json({ error: 'Failed to create customer', details: String(error) }, 500);
  }
});

// Get all customers (legacy - manter compatibilidade)
app.get('/make-server-d8a4dffd/customers', async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ customers: customers || [] });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers', details: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-d8a4dffd/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      auth: true,
      rateLimit: true,
      validation: true,
      chatbotAI: !!Deno.env.get('GEMINI_API_KEY'),
      backup: true
    }
  });
});

// Analytics endpoint
app.post('/make-server-d8a4dffd/analytics/track', async (c) => {
  try {
    const event = await c.req.json();
    
    // Salvar evento de analytics
    const analyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    };
    
    await kv.set(`analytics:${Date.now()}`, analyticsEvent);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Analytics tracking error:', error);
    return c.json({ error: 'Failed to track event' }, 500);
  }
});

// Sistema de backup automático (executar diariamente)
async function scheduledBackup() {
  try {
    console.log('[BACKUP] Starting scheduled backup...');
    
    const timestamp = new Date().toISOString();
    const products = await kv.getByPrefix('product:');
    const orders = await kv.getByPrefix('order:');
    const customers = await kv.getByPrefix('customer:');
    
    const backup = {
      timestamp,
      version: '1.0',
      data: { products, orders, customers }
    };
    
    await kv.set(`backup:${timestamp}`, backup);
    
    console.log(`[BACKUP] Completed: ${products.length} products, ${orders.length} orders, ${customers.length} customers`);
    
    // Limpar backups antigos (manter últimos 7 dias)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const allBackups = await kv.getByPrefix('backup:');
    for (const backup of allBackups) {
      if (backup.timestamp < sevenDaysAgo) {
        await kv.del(`backup:${backup.timestamp}`);
      }
    }
  } catch (error) {
    console.error('[BACKUP] Failed:', error);
  }
}

// Executar backup a cada 24 horas
setInterval(scheduledBackup, 24 * 60 * 60 * 1000);

// Executar backup inicial após 1 minuto
setTimeout(scheduledBackup, 60 * 1000);

console.log('🚀 KZSTORE Server v2.0 started successfully!');
console.log('📊 Features enabled:');
console.log('  ✅ Supabase Auth');
console.log('  ✅ Rate Limiting');
console.log('  ✅ Data Validation');
console.log('  ✅ Automatic Backups');
console.log(`  ${Deno.env.get('GEMINI_API_KEY') ? '✅' : '⚠️'} AI Chatbot (Gemini)`);

Deno.serve(app.fetch);
