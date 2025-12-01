import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { rateLimit } from './middleware.ts';
import { 
  productRoutesV2, 
  orderRoutesV2, 
  authRoutesV2, 
  chatbotRoutesV2,
  reviewRoutesV2,
  couponRoutesV2,
  priceAlertRoutesV2,
  loyaltyRoutesV2,
  flashSaleRoutesV2
} from './routes-v2.tsx';
import { kvRoutes } from './kv-routes.tsx';
import * as db from './supabase-helpers.tsx';

const app = new Hono();

// Middleware global
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}));
app.use('*', logger(console.log));

// Rate limiting global (100 requisições por 15 minutos)
app.use('/make-server-d8a4dffd/*', rateLimit(100, 15 * 60 * 1000));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Montar rotas principais (V2 - usando Supabase direto)
app.route('/make-server-d8a4dffd/products', productRoutesV2);
app.route('/make-server-d8a4dffd/orders', orderRoutesV2);
app.route('/make-server-d8a4dffd/auth', authRoutesV2);
app.route('/make-server-d8a4dffd/chatbot', chatbotRoutesV2);
app.route('/make-server-d8a4dffd/reviews', reviewRoutesV2);
app.route('/make-server-d8a4dffd/coupons', couponRoutesV2);
app.route('/make-server-d8a4dffd/price-alerts', priceAlertRoutesV2);
app.route('/make-server-d8a4dffd/loyalty', loyaltyRoutesV2);
app.route('/make-server-d8a4dffd/flash-sales', flashSaleRoutesV2);
app.route('/make-server-d8a4dffd/kv', kvRoutes);

// Health check
app.get('/make-server-d8a4dffd/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    server: 'KZSTORE Backend',
    features: {
      auth: true,
      rateLimit: true,
      validation: true,
      chatbotAI: !!Deno.env.get('GEMINI_API_KEY'),
      emailNotifications: !!Deno.env.get('RESEND_API_KEY'),
      backup: true,
      ads: true,
      team: true,
      reviews: true,
      coupons: true,
      loyalty: true,
      flashSales: true
    }
  });
});

// Root path - redirect to health
app.get('/make-server-d8a4dffd', (c) => {
  return c.redirect('/make-server-d8a4dffd/health');
});

// Analytics endpoint
app.post('/make-server-d8a4dffd/analytics/track', async (c) => {
  try {
    const event = await c.req.json();
    
    // Salvar evento de analytics usando Supabase
    await db.trackEvent({
      ...event,
      ip_address: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Analytics tracking error:', error);
    return c.json({ error: 'Failed to track event' }, 500);
  }
});

// Error handler global
app.onError((err, c) => {
  console.error('❌ Global error handler:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// Not found handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.url} not found`,
    timestamp: new Date().toISOString()
  }, 404);
});

// BACKUP AUTOMÁTICO DESABILITADO (antiga versão que usava KV Store)
// A aplicação agora usa Supabase diretamente
// Para backups, use o Supabase Dashboard ou export SQL

// Get customer profiles (usando Supabase)
app.get('/make-server-d8a4dffd/customers', async (c) => {
  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return c.json({ customers: data || [] });
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers', details: String(error) }, 500);
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 KZSTORE Server v4.0 - Started Successfully!');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('📊 Enabled Features:');
console.log('  ✅ Supabase Auth & Storage');
console.log('  ✅ Rate Limiting (100 req/15min)');
console.log('  ✅ Data Validation');
console.log('  ⚠️  Manual Backups Only (POST /backup/create)');
console.log('  ✅ Product Management');
console.log('  ✅ Order Management');
console.log('  ✅ Customer Management');
console.log('  ✅ Ad System (7 positions)');
console.log('  ✅ Team Management');
console.log('  ✅ Review System');
console.log('  ✅ Coupon System');
console.log('  ✅ Loyalty Program');
console.log('  ✅ Flash Sales');
console.log('  ✅ Price Alerts');
console.log(`  ${Deno.env.get('GEMINI_API_KEY') ? '✅' : '⚠️'} AI Chatbot (Google Gemini)`);
console.log(`  ${Deno.env.get('RESEND_API_KEY') ? '✅' : '⚠️'} Email Notifications (Resend)`);
console.log('');
console.log('🆕 Advanced Features:');
console.log('  ✅ Pre-Order System (Sistema de Pré-venda)');
console.log('  ✅ Trade-In Program (Programa Trade-In)');
console.log('  ✅ Custom Quotes (Orçamento Personalizado)');
console.log('  ✅ B2B Accounts (Contas Empresariais)');
console.log('  ✅ Affiliate System (Sistema de Afiliados)');
console.log('  ✅ Ticket System (Sistema de Suporte)');
console.log('  ✅ Advanced Analytics (Analytics Avançado)');
console.log('');
console.log('🌍 Server URL:');
console.log(`  https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-d8a4dffd`);
console.log('');
console.log('📖 API Documentation:');
console.log('  Health: GET /make-server-d8a4dffd/health');
console.log('  Products: /make-server-d8a4dffd/products');
console.log('  Orders: /make-server-d8a4dffd/orders');
console.log('  Pre-Orders: /make-server-d8a4dffd/pre-orders');
console.log('  Trade-In: /make-server-d8a4dffd/trade-in');
console.log('  Quotes: /make-server-d8a4dffd/quotes');
console.log('  B2B: /make-server-d8a4dffd/b2b-accounts');
console.log('  Affiliates: /make-server-d8a4dffd/affiliates');
console.log('  Tickets: /make-server-d8a4dffd/tickets');
console.log('  Analytics: /make-server-d8a4dffd/analytics');
console.log('  Ads: /make-server-d8a4dffd/ads');
console.log('  Team: /make-server-d8a4dffd/team');
console.log('  Auth: /make-server-d8a4dffd/auth');
console.log('  Chatbot: /make-server-d8a4dffd/chatbot');
console.log('  Backup: POST /make-server-d8a4dffd/backup/create');
console.log('');
console.log('⚠️  Note: Automatic backups disabled to prevent timeouts');
console.log('   Use manual backup endpoint when needed');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('💰 KZSTORE - Plataforma Completa de E-commerce! 🇦🇴');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

Deno.serve(app.fetch);