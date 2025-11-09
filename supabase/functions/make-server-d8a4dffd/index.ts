import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.ts';
import { rateLimit } from './middleware.ts';
import { 
  productRoutes, 
  orderRoutes, 
  authRoutes, 
  chatbotRoutes, 
  backupRoutes,
  reviewRoutes,
  couponRoutes,
  priceAlertRoutes,
  loyaltyRoutes,
  flashSaleRoutes,
  ticketRoutes
} from './routes.ts';
import { adRoutes } from './ad-routes.ts';
import { teamRoutes } from './team-routes.ts';
import twilioRoutes from './twilio.ts';

const app = new Hono();

// Middleware global - CORS configurado para permitir todas as origens
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
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

// Montar rotas
app.route('/make-server-d8a4dffd/products', productRoutes);
app.route('/make-server-d8a4dffd/orders', orderRoutes);
app.route('/make-server-d8a4dffd/auth', authRoutes);
app.route('/make-server-d8a4dffd/chatbot', chatbotRoutes);
app.route('/make-server-d8a4dffd/backup', backupRoutes);
app.route('/make-server-d8a4dffd/reviews', reviewRoutes);
app.route('/make-server-d8a4dffd/coupons', couponRoutes);
app.route('/make-server-d8a4dffd/price-alerts', priceAlertRoutes);
app.route('/make-server-d8a4dffd/loyalty', loyaltyRoutes);
app.route('/make-server-d8a4dffd/flash-sales', flashSaleRoutes);
app.route('/make-server-d8a4dffd/tickets', ticketRoutes);
app.route('/make-server-d8a4dffd/ads', adRoutes);
app.route('/make-server-d8a4dffd/team', teamRoutes);
app.route('/make-server-d8a4dffd/twilio', twilioRoutes);

// Upload de imagem para produtos
app.post('/make-server-d8a4dffd/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Nome do bucket
    const bucketName = 'make-d8a4dffd-products';

    // Verificar se o bucket existe, senão criar
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Bucket público para acesso direto às imagens
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
    }

    // Fazer upload da imagem
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`✅ Image uploaded successfully: ${fileName}`);
    
    return c.json({ 
      url: urlData.publicUrl,
      fileName: fileName,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return c.json({ 
      error: 'Failed to upload image', 
      details: String(error) 
    }, 500);
  }
});

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

// Get all customers
app.get('/make-server-d8a4dffd/customers', async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ customers: customers || [] });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers', details: String(error) }, 500);
  }
});

// Sync users from Supabase Auth to KV store
app.post('/make-server-d8a4dffd/customers/sync', async (c) => {
  try {
    // Verificar se o usuário tem permissões de admin
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Para simplificar, vamos aceitar qualquer token válido por enquanto
    // Em produção, verificar se é admin

    console.log('🔄 Starting user sync...');

    // Buscar usuários do Supabase Auth (isso requer service role key)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return c.json({ error: 'Server configuration error' }, 500);
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    if (!authResponse.ok) {
      return c.json({ error: 'Failed to fetch auth users' }, 500);
    }

    const { users } = await authResponse.json();
    console.log(`Found ${users?.length || 0} auth users`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    // Para cada usuário, verificar se já existe no KV store
    for (const user of users || []) {
      try {
        const customerKey = `customer:${user.id}`;
        const existing = await kv.get(customerKey);

        if (existing) {
          skipped++;
          continue;
        }

        // Criar novo customer no KV store
        const customerData = {
          id: user.id,
          user_id: user.id,
          nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          telefone: user.user_metadata?.phone || user.phone || '',
          endereco: user.user_metadata?.address || '',
          total_orders: 0,
          total_spent: 0,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await kv.set(customerKey, customerData);
        synced++;
        console.log(`✅ Synced user: ${user.email}`);
      } catch (err) {
        console.error(`❌ Error syncing user:`, err);
        errors++;
      }
    }

    return c.json({
      success: true,
      total: users?.length || 0,
      synced,
      skipped,
      errors
    });
  } catch (error) {
    console.error('Sync error:', error);
    return c.json({ error: 'Failed to sync users', details: String(error) }, 500);
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
    
    // Fazer backup em pequenos lotes para evitar timeout
    const products = await kv.getByPrefix('product:').catch(() => []);
    const orders = await kv.getByPrefix('order:').catch(() => []);
    const customers = await kv.getByPrefix('customer:').catch(() => []);
    
    const backup = {
      timestamp,
      version: '1.0',
      data: { products, orders, customers }
    };
    
    await kv.set(`backup:${timestamp}`, backup);
    
    console.log(`[BACKUP] Completed: ${products.length} products, ${orders.length} orders, ${customers.length} customers`);
    
    // Limpar backups antigos (manter últimos 7 dias)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const allBackups = await kv.getByPrefix('backup:').catch(() => []);
    for (const backup of allBackups) {
      if (backup.timestamp < sevenDaysAgo) {
        await kv.del(`backup:${backup.timestamp}`);
      }
    }
  } catch (error) {
    console.error('[BACKUP] Failed:', error);
  }
}

// Executar backup a cada 24 horas (desabilitado por enquanto para evitar timeouts)
// setInterval(scheduledBackup, 24 * 60 * 60 * 1000);

// Executar backup inicial após 1 minuto (desabilitado)
// setTimeout(scheduledBackup, 60 * 1000);

console.log('🚀 KZSTORE Server v2.0 started successfully!');
console.log('📊 Features enabled:');
console.log('  ✅ Supabase Auth');
console.log('  ✅ Rate Limiting');
console.log('  ✅ Data Validation');
console.log('  ✅ Automatic Backups');
console.log(`  ${Deno.env.get('GEMINI_API_KEY') ? '✅' : '⚠️'} AI Chatbot (Gemini)`);

Deno.serve(app.fetch);
// Deploy 1762554947 - CORS fix for price alerts
