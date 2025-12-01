import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { requireAuth, requireAuthUser, validateProduct, validateOrder } from './middleware.ts';
import { 
  getOrderConfirmationTemplate, 
  getStatusUpdateTemplate, 
  sendEmail, 
  sendWhatsAppNotification 
} from './email-service.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export const productRoutes = new Hono();
export const orderRoutes = new Hono();
export const authRoutes = new Hono();
export const chatbotRoutes = new Hono();
export const backupRoutes = new Hono();
export const reviewRoutes = new Hono();
export const couponRoutes = new Hono();
export const priceAlertRoutes = new Hono();
export const loyaltyRoutes = new Hono();
export const flashSaleRoutes = new Hono();

// ============ AUTH ROUTES ============

// Criar usuário admin inicial (rota pública para setup)
authRoutes.post('/setup-admin', async (c) => {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Verificar se já existe algum admin
    const existingUsers = await kv.getByPrefix('customer:');
    const hasAdmin = existingUsers.some((u: any) => u.email === 'admin@kzstore.ao');
    
    if (hasAdmin) {
      console.log('⚠️ Admin user already exists');
      return c.json({ message: 'Admin user already exists' }, 200);
    }
    
    // Criar admin no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@kzstore.ao',
      password: 'kzstore2024',
      email_confirm: true,
      user_metadata: {
        name: 'Administrador KZSTORE',
        role: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Error creating admin user:', error);
      return c.json({ error: 'Failed to create admin user', details: error.message }, 500);
    }
    
    console.log('✅ Admin user created successfully:', data.user?.email);
    
    // Salvar também no KV para lista de clientes
    const customer = {
      id: data.user!.id,
      nome: 'Administrador KZSTORE',
      email: 'admin@kzstore.ao',
      telefone: '+244931054015',
      created_at: new Date().toISOString()
    };
    
    await kv.set(`customer:${customer.id}`, customer);
    
    return c.json({ 
      message: 'Admin user created successfully',
      user: {
        id: data.user!.id,
        email: data.user!.email
      }
    }, 201);
  } catch (error) {
    console.error('❌ Error in setup-admin:', error);
    return c.json({ error: 'Failed to setup admin', details: String(error) }, 500);
  }
});

// 🔥 NOVO: Rota de signup para clientes (pública)
authRoutes.post('/signup', async (c) => {
  try {
    const { email, password, nome, telefone } = await c.req.json();
    
    console.log('📝 [SIGNUP] Creating new customer account:', { email, nome, telefone });
    
    // Validar dados
    if (!email || !password || !nome) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, 400);
    }
    
    // Verificar se email já existe
    const existingUsers = await kv.getByPrefix('customer:');
    const emailExists = existingUsers.some((u: any) => u.email === email.toLowerCase());
    
    if (emailExists) {
      return c.json({ error: 'Este email já está cadastrado' }, 400);
    }
    
    // 🔥 IMPORTANTE: Usar auth.admin.createUser com email_confirm: true
    // Isso evita o erro "Email not confirmed" porque confirma o email automaticamente
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Auto-confirmar email
      user_metadata: {
        name: nome,
        phone: telefone,
        role: 'customer'
      }
    });
    
    if (error) {
      console.error('❌ [SIGNUP] Supabase auth error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    console.log('✅ [SIGNUP] User created successfully in Supabase Auth:', data.user?.email);
    
    // Salvar no KV store também
    const customerId = data.user?.id || `CUST${Date.now()}`;
    const customer = {
      id: customerId,
      email: email.toLowerCase(),
      nome,
      telefone: telefone || '',
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`customer:${customerId}`, customer);
    console.log('✅ [SIGNUP] Customer saved to KV store:', customerId);
    
    return c.json({ 
      message: 'Conta criada com sucesso!',
      user: {
        id: customerId,
        email: customer.email,
        nome: customer.nome,
        role: 'customer'
      }
    }, 201);
  } catch (error) {
    console.error('❌ [SIGNUP] Error:', error);
    return c.json({ error: 'Erro ao criar conta', details: String(error) }, 500);
  }
});

// ============ PRODUCT ROUTES ============

// Get all products (public)
productRoutes.get('/', async (c) => {
  try {
    console.log('📦 [PRODUCTS] Fetching all products from Supabase...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [PRODUCTS] Supabase error:', error);
      throw error;
    }
    
    console.log(`✅ [PRODUCTS] Fetched ${products?.length || 0} products from Supabase`);
    
    return c.json({ products: products || [] });
  } catch (error) {
    console.error('❌ [PRODUCTS] Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products', details: String(error) }, 500);
  }
});

// LEGACY: Get all products (public) - FOR BACKWARDS COMPATIBILITY
productRoutes.get('/legacy', async (c) => {
  try {
    const allData = await kv.getByPrefix('product:');
    
    console.log(`🔍 [GET PRODUCTS - LEGACY] Raw data from KV (${allData?.length || 0} items):`);
    allData?.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ID: ${item?.id || 'NO_ID'}, Nome: ${item?.nome || 'NO_NAME'}, Type: ${Array.isArray(item) ? 'ARRAY' : typeof item}`);
    });
    
    // Filtrar apenas produtos válidos
    const products = (allData || []).filter((item: any) => {
      // Deve ter estrutura de produto
      if (!item) return false;
      
      // Não pode ser array (pré-encomendas retornam array)
      if (Array.isArray(item)) {
        console.warn('⚠️ Skipping array data in products:', item);
        return false;
      }
      
      // Deve ter campos obrigatórios de produto
      if (!item.id || !item.nome || typeof item.preco_aoa !== 'number') {
        console.warn('⚠️ Skipping invalid product:', item);
        return false;
      }
      
      return true;
    });
    
    console.log(`✅ Fetched ${products.length} valid products (filtered from ${allData?.length || 0} total items)`);
    
    return c.json({ products });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products', details: String(error) }, 500);
  }
});

// Initialize products (public - for first-time setup)
productRoutes.post('/initialize', async (c) => {
  try {
    console.log('🔧 [PRODUCTS] Initializing products...');
    
    const { products } = await c.req.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      return c.json({ error: 'Products array is required' }, 400);
    }
    
    // Verificar se já existem produtos
    const existing = await kv.get('products:list');
    if (existing && existing.length > 0) {
      console.log('⚠️ [PRODUCTS] Products already initialized');
      return c.json({ message: 'Products already initialized', count: existing.length }, 200);
    }
    
    // Salvar cada produto
    const productIds: string[] = [];
    for (const product of products) {
      const id = product.id || `PRD${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const productData = {
        ...product,
        id,
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await kv.set(`product:${id}`, productData);
      productIds.push(id);
    }
    
    // Salvar lista de IDs
    await kv.set('products:list', productIds);
    
    console.log(`✅ [PRODUCTS] Initialized ${productIds.length} products`);
    return c.json({ 
      message: 'Products initialized successfully',
      count: productIds.length,
      productIds 
    }, 201);
  } catch (error) {
    console.error('❌ [PRODUCTS] Error initializing:', error);
    return c.json({ error: 'Failed to initialize products', details: String(error) }, 500);
  }
});

// Get product by ID (public)
productRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product', details: String(error) }, 500);
  }
});

// Create product (admin only)
productRoutes.post('/', requireAuth, async (c) => {
  try {
    const productData = await c.req.json();
    
    console.log('📦 Creating product:', productData.nome);
    
    // Validar dados
    const validation = validateProduct(productData);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.errors);
      return c.json({ error: 'Validation failed', errors: validation.errors }, 400);
    }
    
    const product = {
      id: `PRD${Date.now()}`,
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`product:${product.id}`, product);
    
    console.log('✅ Product created successfully:', product.id);
    return c.json({ product, message: 'Product created successfully' }, 201);
  } catch (error) {
    console.log('❌ Error creating product:', error);
    return c.json({ error: 'Failed to create product', details: String(error) }, 500);
  }
});

// Update product (admin only)
productRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const productData = await c.req.json();
    
    console.log('📝 Updating product:', id);
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Validar dados
    const validation = validateProduct(productData);
    if (!validation.valid) {
      console.log('❌ Validation failed:', validation.errors);
      return c.json({ error: 'Validation failed', errors: validation.errors }, 400);
    }
    
    const updated = {
      ...existing,
      ...productData,
      id, // Preservar o ID original
      created_at: existing.created_at,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`product:${id}`, updated);
    
    console.log('✅ Product updated successfully:', id);
    return c.json({ product: updated, message: 'Product updated successfully' });
  } catch (error) {
    console.log('❌ Error updating product:', error);
    return c.json({ error: 'Failed to update product', details: String(error) }, 500);
  }
});

// Delete product (admin only)
productRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    await kv.del(`product:${id}`);
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product', details: String(error) }, 500);
  }
});

// Get low stock products (admin only)
productRoutes.get('/alerts/low-stock', requireAuth, async (c) => {
  try {
    const threshold = parseInt(c.req.query('threshold') || '5');
    const products = await kv.getByPrefix('product:');
    
    const lowStockProducts = products.filter((p: any) => {
      const stock = p.estoque || 0;
      return stock > 0 && stock <= threshold;
    });
    
    const outOfStockProducts = products.filter((p: any) => {
      const stock = p.estoque || 0;
      return stock === 0;
    });
    
    return c.json({
      low_stock: lowStockProducts,
      out_of_stock: outOfStockProducts,
      threshold,
      low_stock_count: lowStockProducts.length,
      out_of_stock_count: outOfStockProducts.length
    });
  } catch (error) {
    console.log('Error fetching low stock alerts:', error);
    return c.json({ error: 'Failed to fetch low stock alerts', details: String(error) }, 500);
  }
});

// 🔥 DEBUG: List all product IDs and names (temporary debug route)
productRoutes.get('/debug/ids', async (c) => {
  try {
    const allData = await kv.getByPrefix('product:');
    
    const productInfo = allData.map((p: any) => ({
      id: p?.id || 'NO_ID',
      nome: p?.nome || 'NO_NAME',
      kv_key: `product:${p?.id}`,
      has_price: typeof p?.preco_aoa === 'number',
      has_stock: typeof p?.estoque === 'number',
      stock: p?.estoque || 0
    }));
    
    console.log('📊 All products in KV store:', productInfo);
    
    return c.json({
      total_count: allData.length,
      products: productInfo
    });
  } catch (error) {
    console.log('Error in debug route:', error);
    return c.json({ error: 'Failed to debug products', details: String(error) }, 500);
  }
});

// Get stock history for a product (admin only)
productRoutes.get('/:id/stock-history', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const history = await kv.getByPrefix(`stock_history:${id}:`);
    
    // Sort by timestamp descending
    const sortedHistory = history.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return c.json({ 
      product_id: id,
      history: sortedHistory 
    });
  } catch (error) {
    console.log('Error fetching stock history:', error);
    return c.json({ error: 'Failed to fetch stock history', details: String(error) }, 500);
  }
});

// ============ ORDER ROUTES ============

// Email notification helper
async function sendOrderNotification(order: any) {
  // TODO: Implement email notification
  console.log('📧 Order notification would be sent for:', order.id);
}

// Create order (public)
orderRoutes.post('/', async (c) => {
  try {
    const orderData = await c.req.json();
    
    // Validar dados
    const validation = validateOrder(orderData);
    if (!validation.valid) {
      return c.json({ error: 'Validation failed', errors: validation.errors }, 400);
    }
    
    // Verificar estoque disponível ANTES de criar pedido
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        console.log(`🔍 [CREATE ORDER] Checking stock for item:`, item);
        console.log(`🔍 [CREATE ORDER] Looking for product with key: product:${item.product_id}`);
        
        const product = await kv.get(`product:${item.product_id}`);
        
        if (!product) {
          console.error(`❌ [CREATE ORDER] Product not found! Searched key: product:${item.product_id}`);
          console.error(`❌ [CREATE ORDER] Full item data:`, JSON.stringify(item, null, 2));
          
          // 🔥 DEBUG: List all available products to help diagnose
          const allProducts = await kv.getByPrefix('product:');
          console.error(`❌ [CREATE ORDER] Available products in KV store (${allProducts.length}):`);
          allProducts.forEach((p: any) => {
            console.error(`   - ID: ${p?.id || 'NO_ID'}, Nome: ${p?.nome || 'NO_NAME'}`);
          });
          
          return c.json({ 
            error: `Produto '${item.product_name || item.product_id}' não encontrado`, 
            product_id: item.product_id,
            searched_key: `product:${item.product_id}`,
            debug_available_products: allProducts.map((p: any) => ({
              id: p?.id,
              nome: p?.nome
            }))
          }, 404);
        }
        
        console.log(`✅ [CREATE ORDER] Product found:`, product.nome);
        
        const currentStock = product.estoque || 0;
        if (currentStock < item.quantity) {
          return c.json({ 
            error: 'Insufficient stock', 
            product: product.nome,
            available: currentStock,
            requested: item.quantity
          }, 400);
        }
      }
    }
    
    const order = {
      id: `KZS${Date.now().toString().slice(-8)}`,
      ...orderData,
      status: 'Pendente',
      created_at: new Date().toISOString()
    };
    
    await kv.set(`order:${order.id}`, order);
    
    console.log(`📦 Order ${order.id} created, updating stock...`);
    
    // Update product stock with detailed logging
    const stockUpdates: any[] = [];
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const product = await kv.get(`product:${item.product_id}`);
        if (product) {
          const oldStock = product.estoque || 0;
          const newStock = Math.max(0, oldStock - item.quantity);
          
          await kv.set(`product:${item.product_id}`, {
            ...product,
            estoque: newStock,
            updated_at: new Date().toISOString()
          });
          
          // Criar registro de histórico de movimentação
          const stockHistory = {
            product_id: item.product_id,
            product_name: product.nome,
            order_id: order.id,
            type: 'sale',
            old_stock: oldStock,
            new_stock: newStock,
            quantity: item.quantity,
            timestamp: new Date().toISOString()
          };
          
          await kv.set(`stock_history:${item.product_id}:${Date.now()}`, stockHistory);
          
          stockUpdates.push({
            product: product.nome,
            old_stock: oldStock,
            new_stock: newStock,
            low_stock: newStock < 5
          });
          
          console.log(`   ✅ ${product.nome}: ${oldStock} → ${newStock} ${newStock < 5 ? '⚠️ LOW STOCK!' : ''}`);
        }
      }
    }
    
    // Enviar notificação (se email estiver configurado)
    try {
      console.log('📧 Sending order confirmation notifications...');
      
      // Preparar dados para o email
      const emailData = {
        order_id: order.id,
        customer_name: orderData.customer.nome,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.telefone,
        customer_address: orderData.customer.endereco,
        customer_city: orderData.customer.cidade,
        items: orderData.items,
        total: order.total,
        payment_method: orderData.payment_method,
        status: order.status,
        created_at: order.created_at
      };
      
      // Enviar email de confirmação
      const confirmationTemplate = getOrderConfirmationTemplate(emailData);
      const emailSent = await sendEmail(orderData.customer.email, confirmationTemplate);
      
      if (emailSent) {
        console.log('✅ Confirmation email sent to:', orderData.customer.email);
      }
      
      // Enviar notificação WhatsApp
      const whatsappSent = await sendWhatsAppNotification(orderData.customer.telefone, emailData);
      
      if (whatsappSent) {
        console.log('✅ WhatsApp notification prepared for:', orderData.customer.telefone);
      }
    } catch (notificationError) {
      console.log('⚠️ Notification failed (non-critical):', notificationError);
    }
    
    console.log(`✅ Order ${order.id} completed successfully`);
    
    return c.json({ 
      order, 
      stock_updates: stockUpdates,
      message: 'Order created successfully' 
    }, 201);
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: 'Failed to create order', details: String(error) }, 500);
  }
});

// Get all orders (usa RLS do Supabase para controle de acesso)
orderRoutes.get('/', async (c) => {
  try {
    console.log('📋 [GET /orders] Fetching orders from Supabase...');
    
    // Obter user_id da query string (para filtrar pedidos do usuário)
    const user_id = c.req.query('user_id');
    
    // Buscar pedidos do Supabase
    let query = supabase
      .from('orders')
      .select('*');
    
    // Se user_id foi fornecido, filtrar por esse usuário
    if (user_id) {
      console.log('📋 [GET /orders] Filtering by user_id:', user_id);
      query = query.eq('user_id', user_id);
    }
    
    const { data: orders, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [GET /orders] Error:', error);
      throw error;
    }
    
    console.log(`✅ [GET /orders] Loaded ${orders?.length || 0} orders`);
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders', details: String(error) }, 500);
  }
});

// Get order by ID
orderRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('📋 [GET /orders/:id] Fetching order:', id);
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !order) {
      console.error('❌ [GET /orders/:id] Order not found:', id);
      return c.json({ error: 'Order not found' }, 404);
    }
    
    console.log('✅ [GET /orders/:id] Order found:', order.order_number);
    return c.json({ order });
  } catch (error) {
    console.log('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order', details: String(error) }, 500);
  }
});

// Update order status (admin only)
orderRoutes.patch('/:id/status', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { status, tracking_code } = await c.req.json();
    
    console.log(`📝 [PATCH /orders/:id/status] Updating order ${id} to status: ${status}`);
    
    // Buscar pedido existente
    const { data: existing, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      console.error('❌ [PATCH /orders/:id/status] Order not found:', id);
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Preparar atualização
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (tracking_code) {
      updateData.tracking_number = tracking_code;
    }
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }
    
    // Atualizar pedido
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ [PATCH /orders/:id/status] Update error:', updateError);
      throw updateError;
    }
    
    console.log(`✅ [PATCH /orders/:id/status] Order ${updated.order_number} updated: ${existing.status} → ${status}`);
    
    // Enviar notificação de atualização de status
    try {
      console.log('📧 Sending status update notifications...');
      
      const emailData = {
        order_id: updated.id,
        customer_name: updated.user_name,
        customer_email: updated.user_email,
        customer_phone: updated.shipping_address.phone,
        customer_address: updated.shipping_address.address,
        customer_city: updated.shipping_address.city,
        items: updated.items,
        total: updated.total,
        payment_method: updated.payment_method,
        status: updated.status,
        created_at: updated.created_at,
        tracking_code: updated.tracking_number
      };
      
      const statusUpdateTemplate = getStatusUpdateTemplate(emailData);
      const emailSent = await sendEmail(updated.user_email, statusUpdateTemplate);
      
      if (emailSent) {
        console.log('✅ Status update email sent to:', updated.user_email);
      }
      
      const whatsappSent = await sendWhatsAppNotification(updated.shipping_address.phone, emailData);
      
      if (whatsappSent) {
        console.log('✅ WhatsApp status notification prepared');
      }
    } catch (notificationError) {
      console.log('⚠️ Notification failed (non-critical):', notificationError);
    }
    
    return c.json({ order: updated, message: 'Order status updated successfully' });
  } catch (error) {
    console.log('Error updating order status:', error);
    return c.json({ error: 'Failed to update order status', details: String(error) }, 500);
  }
});

// Delete order (admin only)
orderRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ [DELETE /orders/:id] Deleting order:', id);
    
    const { data: existing, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      console.error('❌ [DELETE /orders/:id] Order not found:', id);
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('❌ [DELETE /orders/:id] Delete error:', deleteError);
      throw deleteError;
    }
    
    console.log('✅ [DELETE /orders/:id] Order deleted:', existing.order_number);
    return c.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.log('Error deleting order:', error);
    return c.json({ error: 'Failed to delete order', details: String(error) }, 500);
  }
});

// ============ CHATBOT ROUTES ============

// Gemini chatbot endpoint (public)
chatbotRoutes.post('/', async (c) => {
  try {
    const { message, conversationHistory } = await c.req.json();
    
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required' }, 400);
    }
    
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not configured');
      return c.json({ 
        error: 'Chatbot service not configured',
        response: 'Desculpe, o serviço de chat está temporariamente indisponível. Por favor, entre em contato via WhatsApp: +244 931 054 015'
      }, 503);
    }
    
    // Get products for context
    const products = await kv.getByPrefix('product:');
    const productsContext = products.map((p: any) => 
      `${p.nome} - ${p.categoria} - ${p.preco_aoa} AOA - Estoque: ${p.estoque}`
    ).join('\n');
    
    // Build conversation context
    const systemPrompt = `Você é um assistente virtual da KZSTORE, uma loja online angolana especializada em produtos eletrônicos.

INFORMAÇÕES DA LOJA:
- Nome: KZSTORE (KwanzaStore)
- WhatsApp: +244 931 054 015
- Especialidades: Memória RAM para servidores, hard disks SAS/SSD, Mini PCs, câmeras Wi-Fi, telemóveis
- Métodos de pagamento: Multicaixa Express, Referência Bancária
- Entrega disponível em Angola

CATÁLOGO ATUAL:
${productsContext}

INSTRUÇÕES:
1. Seja profissional, amigável e prestativo
2. Responda sempre em português de Angola
3. Ajude com informações sobre produtos, preços, especificações técnicas
4. Para dúvidas sobre pagamento ou entrega, oriente o cliente a contactar via WhatsApp
5. Se um produto não estiver em estoque, sugira alternativas similares
6. Seja claro e objetivo nas respostas
7. Use emojis moderadamente para tornar a conversa mais amigável

Lembre-se: Você está aqui para ajudar o cliente a encontrar o produto certo e facilitar a compra!`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }
    
    // Add current message
    messages.push({ role: 'user', content: message });
    
    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorText);
      return c.json({ 
        error: 'Failed to get response from chatbot',
        response: 'Desculpe, não consegui processar sua mensagem. Por favor, tente novamente ou entre em contato via WhatsApp: +244 931 054 015'
      }, 500);
    }
    
    const data = await geminiResponse.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Desculpe, não consegui processar sua mensagem. Por favor, tente novamente.';
    
    return c.json({ 
      response: aiResponse,
      conversationHistory: [
        ...messages.slice(1), // Exclude system prompt
        { role: 'assistant', content: aiResponse }
      ]
    });
  } catch (error) {
    console.error('❌ Error in chatbot:', error);
    return c.json({ 
      error: 'Chatbot error',
      response: 'Desculpe, ocorreu um erro. Por favor, entre em contato via WhatsApp: +244 931 054 015',
      details: String(error)
    }, 500);
  }
});

// ============ BACKUP ROUTES ============

// Create backup manually (admin only)
backupRoutes.post('/create', requireAuth, async (c) => {
  try {
    console.log('🔄 [MANUAL BACKUP] Starting...');
    
    const timestamp = new Date().toISOString();
    const backup: any = {
      timestamp,
      version: '1.0',
      data: {}
    };
    
    // Buscar cada tipo de dado separadamente com timeout
    try {
      const products = await Promise.race([
        kv.getByPrefix('product:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any[];
      backup.data.products = products;
      console.log(`  ✅ Products: ${products.length}`);
    } catch (err) {
      console.log('  ⚠️ Products backup failed');
      backup.data.products = [];
    }
    
    try {
      const orders = await Promise.race([
        kv.getByPrefix('order:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any[];
      backup.data.orders = orders;
      console.log(`  ✅ Orders: ${orders.length}`);
    } catch (err) {
      console.log('  ⚠️ Orders backup failed');
      backup.data.orders = [];
    }
    
    try {
      const customers = await Promise.race([
        kv.getByPrefix('customer:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any[];
      backup.data.customers = customers;
      console.log(`  ✅ Customers: ${customers.length}`);
    } catch (err) {
      console.log('  ⚠️ Customers backup failed');
      backup.data.customers = [];
    }
    
    // Salvar backup
    await kv.set(`backup:${timestamp}`, backup);
    
    const totalItems = 
      (backup.data.products?.length || 0) +
      (backup.data.orders?.length || 0) +
      (backup.data.customers?.length || 0);
    
    console.log(`✅ [MANUAL BACKUP] Completed! Total items: ${totalItems}`);
    
    return c.json({
      message: 'Backup created successfully',
      timestamp,
      totalItems,
      details: {
        products: backup.data.products?.length || 0,
        orders: backup.data.orders?.length || 0,
        customers: backup.data.customers?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ [MANUAL BACKUP] Failed:', error);
    return c.json({ error: 'Failed to create backup', details: String(error) }, 500);
  }
});

// Export all data (admin only) - with timeout protection
backupRoutes.get('/export', requireAuth, async (c) => {
  try {
    console.log('📤 [EXPORT] Starting data export...');
    
    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    // Fetch with timeout protection
    try {
      backup.products = await Promise.race([
        kv.getByPrefix('product:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      console.log(`  ✅ Exported ${backup.products.length} products`);
    } catch (err) {
      console.log('  ⚠️ Products export failed');
      backup.products = [];
    }
    
    try {
      backup.orders = await Promise.race([
        kv.getByPrefix('order:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      console.log(`  ✅ Exported ${backup.orders.length} orders`);
    } catch (err) {
      console.log('  ⚠️ Orders export failed');
      backup.orders = [];
    }
    
    try {
      backup.customers = await Promise.race([
        kv.getByPrefix('customer:'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      console.log(`  ✅ Exported ${backup.customers.length} customers`);
    } catch (err) {
      console.log('  ⚠️ Customers export failed');
      backup.customers = [];
    }
    
    console.log('✅ [EXPORT] Completed successfully');
    
    return c.json(backup);
  } catch (error) {
    console.error('❌ [EXPORT] Failed:', error);
    return c.json({ error: 'Failed to export data', details: String(error) }, 500);
  }
});

// Import data (admin only)
backupRoutes.post('/import', requireAuth, async (c) => {
  try {
    const { products, orders, customers } = await c.req.json();
    
    let importedCount = 0;
    
    if (Array.isArray(products)) {
      for (const product of products) {
        await kv.set(`product:${product.id}`, product);
        importedCount++;
      }
    }
    
    if (Array.isArray(orders)) {
      for (const order of orders) {
        await kv.set(`order:${order.id}`, order);
        importedCount++;
      }
    }
    
    if (Array.isArray(customers)) {
      for (const customer of customers) {
        await kv.set(`customer:${customer.id}`, customer);
        importedCount++;
      }
    }
    
    return c.json({ message: `Imported ${importedCount} records successfully` });
  } catch (error) {
    console.log('Error importing data:', error);
    return c.json({ error: 'Failed to import data', details: String(error) }, 500);
  }
});

// ===================================
// REVIEWS ROUTES
// ===================================

// Get reviews for a product
reviewRoutes.get('/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    const reviews = await kv.getByPrefix(`review:${productId}:`);
    
    return c.json({ reviews: reviews || [], averageRating: calculateAverageRating(reviews || []) });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews', details: String(error) }, 500);
  }
});

// Handle OPTIONS preflight for creating reviews
reviewRoutes.options('/', async (c) => {
  return c.text('', 204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
});

// Create a review (authenticated users only)
reviewRoutes.post('/', requireAuthUser, async (c) => {
  try {
    const { product_id, rating, comment, customer_name, customer_email, order_id } = await c.req.json();
    
    // Validate
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Product ID and valid rating (1-5) are required' }, 400);
    }
    
    // Check if user already reviewed this product
    const existingReviews = await kv.getByPrefix('review:');
    const alreadyReviewed = existingReviews.some((r: any) => 
      r.product_id === product_id && r.customer_email === customer_email
    );
    
    if (alreadyReviewed) {
      return c.json({ error: 'You have already reviewed this product' }, 400);
    }
    
    // Check if product exists
    const product = await kv.get(`product:${product_id}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const reviewId = `REV${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    const review = {
      id: reviewId,
      product_id,
      product_name: product.nome,
      rating,
      comment: comment || '',
      customer_name,
      customer_email,
      order_id: order_id || null,
      verified_purchase: !!order_id, // True if order_id is provided
      status: 'pending', // pending, approved, rejected
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`review:${reviewId}`, review);
    
    console.log(`✅ Review ${reviewId} created for product ${product_id} by ${customer_name}`);
    
    return c.json({ review, message: 'Review submitted successfully. It will be visible after moderation.' }, 201);
  } catch (error) {
    console.log('Error creating review:', error);
    return c.json({ error: 'Failed to create review', details: String(error) }, 500);
  }
});

// Update review status (admin only)
reviewRoutes.patch('/:id/status', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be: pending, approved, or rejected' }, 400);
    }
    
    const existing = await kv.get(`review:${id}`);
    if (!existing) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    const updated = {
      ...existing,
      status,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`review:${id}`, updated);
    
    console.log(`📊 Review ${id} status updated: ${existing.status} → ${status}`);
    
    return c.json({ review: updated, message: 'Review status updated successfully' });
  } catch (error) {
    console.log('Error updating review status:', error);
    return c.json({ error: 'Failed to update review status', details: String(error) }, 500);
  }
});

// Delete review (admin only)
reviewRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(`review:${id}`);
    if (!existing) {
      return c.json({ error: 'Review not found' }, 404);
    }
    
    await kv.del(`review:${id}`);
    
    console.log(`🗑️ Review ${id} deleted`);
    
    return c.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.log('Error deleting review:', error);
    return c.json({ error: 'Failed to delete review', details: String(error) }, 500);
  }
});

// Get reviews by user email (for user to see their reviews)
reviewRoutes.get('/user/:email', requireAuthUser, async (c) => {
  try {
    const email = c.req.param('email');
    const allReviews = await kv.getByPrefix('review:');
    
    const userReviews = allReviews.filter((r: any) => r.customer_email === email);
    
    userReviews.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ reviews: userReviews });
  } catch (error) {
    console.log('Error fetching user reviews:', error);
    return c.json({ error: 'Failed to fetch user reviews', details: String(error) }, 500);
  }
});

// ===================================
// COUPONS ROUTES
// ===================================

// Get all coupons (admin)
couponRoutes.get('/', requireAuth, async (c) => {
  try {
    const coupons = await kv.getByPrefix('coupon:');
    
    // Sort by created_at (newest first)
    coupons.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ coupons });
  } catch (error) {
    console.log('Error fetching coupons:', error);
    return c.json({ error: 'Failed to fetch coupons', details: String(error) }, 500);
  }
});

// Validate and get coupon by code (public)
couponRoutes.get('/validate/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();
    const allCoupons = await kv.getByPrefix('coupon:');
    
    const coupon = allCoupons.find((c: any) => c.code === code);
    
    if (!coupon) {
      return c.json({ error: 'Cupom não encontrado', valid: false }, 404);
    }
    
    // Check if active
    if (!coupon.is_active) {
      return c.json({ error: 'Cupom inativo', valid: false }, 400);
    }
    
    // Check dates
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    
    if (now < startDate) {
      return c.json({ error: 'Cupom ainda não disponível', valid: false }, 400);
    }
    
    if (now > endDate) {
      return c.json({ error: 'Cupom expirado', valid: false }, 400);
    }
    
    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return c.json({ error: 'Cupom esgotado', valid: false }, 400);
    }
    
    // Check minimum purchase
    const cartTotal = parseFloat(c.req.query('cart_total') || '0');
    if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
      return c.json({ 
        error: `Compra mínima de ${coupon.min_purchase.toLocaleString('pt-AO')} AOA necessária`,
        valid: false 
      }, 400);
    }
    
    return c.json({ coupon, valid: true });
  } catch (error) {
    console.log('Error validating coupon:', error);
    return c.json({ error: 'Failed to validate coupon', details: String(error) }, 500);
  }
});

// Create coupon (admin only)
couponRoutes.post('/', requireAuth, async (c) => {
  try {
    const { code, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, description } = await c.req.json();
    
    // Validate
    if (!code || !discount_type || !discount_value) {
      return c.json({ error: 'Code, discount_type, and discount_value are required' }, 400);
    }
    
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return c.json({ error: 'Discount type must be: percentage or fixed' }, 400);
    }
    
    if (discount_type === 'percentage' && (discount_value < 1 || discount_value > 100)) {
      return c.json({ error: 'Percentage must be between 1 and 100' }, 400);
    }
    
    // Check if code already exists
    const allCoupons = await kv.getByPrefix('coupon:');
    const existing = allCoupons.find((c: any) => c.code === code.toUpperCase());
    if (existing) {
      return c.json({ error: 'Coupon code already exists' }, 400);
    }
    
    const couponId = `CPN${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    const coupon = {
      id: couponId,
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_purchase: min_purchase || 0,
      max_uses: max_uses || null,
      used_count: 0,
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
      description: description || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`coupon:${couponId}`, coupon);
    
    console.log(`✅ Coupon ${code} created successfully`);
    
    return c.json({ coupon, message: 'Coupon created successfully' }, 201);
  } catch (error) {
    console.log('Error creating coupon:', error);
    return c.json({ error: 'Failed to create coupon', details: String(error) }, 500);
  }
});

// Update coupon (admin only)
couponRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`coupon:${id}`);
    if (!existing) {
      return c.json({ error: 'Coupon not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      id, // Preserve ID
      code: updates.code ? updates.code.toUpperCase() : existing.code,
      created_at: existing.created_at,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`coupon:${id}`, updated);
    
    console.log(`📝 Coupon ${id} updated`);
    
    return c.json({ coupon: updated, message: 'Coupon updated successfully' });
  } catch (error) {
    console.log('Error updating coupon:', error);
    return c.json({ error: 'Failed to update coupon', details: String(error) }, 500);
  }
});

// Delete coupon (admin only)
couponRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(`coupon:${id}`);
    if (!existing) {
      return c.json({ error: 'Coupon not found' }, 404);
    }
    
    await kv.del(`coupon:${id}`);
    
    console.log(`🗑️ Coupon ${id} deleted`);
    
    return c.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.log('Error deleting coupon:', error);
    return c.json({ error: 'Failed to delete coupon', details: String(error) }, 500);
  }
});

// Increment coupon usage (called when order is created with coupon)
couponRoutes.post('/:id/use', async (c) => {
  try {
    const id = c.req.param('id');
    
    const coupon = await kv.get(`coupon:${id}`);
    if (!coupon) {
      return c.json({ error: 'Coupon not found' }, 404);
    }
    
    const updated = {
      ...coupon,
      used_count: (coupon.used_count || 0) + 1,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`coupon:${id}`, updated);
    
    console.log(`📊 Coupon ${coupon.code} usage incremented: ${updated.used_count}`);
    
    return c.json({ coupon: updated });
  } catch (error) {
    console.log('Error incrementing coupon usage:', error);
    return c.json({ error: 'Failed to increment coupon usage', details: String(error) }, 500);
  }
});

// ===================================
// PRICE ALERTS ROUTES
// ===================================

// Get all alerts for a user
priceAlertRoutes.get('/user/:email', requireAuthUser, async (c) => {
  try {
    const email = c.req.param('email');
    const allAlerts = await kv.getByPrefix('price_alert:');
    
    const userAlerts = allAlerts.filter((alert: any) => alert.user_email === email);
    
    // Sort by created_at (newest first)
    userAlerts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ alerts: userAlerts });
  } catch (error) {
    console.log('Error fetching user price alerts:', error);
    return c.json({ error: 'Failed to fetch price alerts', details: String(error) }, 500);
  }
});

// Create price alert
priceAlertRoutes.post('/', requireAuthUser, async (c) => {
  try {
    const { product_id, product_name, target_price, user_email, user_name } = await c.req.json();
    
    if (!product_id || !target_price || !user_email) {
      return c.json({ error: 'Product ID, target price, and user email are required' }, 400);
    }
    
    // Check if product exists
    const product = await kv.get(`product:${product_id}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const alertId = `ALERT${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    const alert = {
      id: alertId,
      product_id,
      product_name: product_name || product.nome,
      current_price: product.preco_aoa,
      target_price,
      user_email,
      user_name,
      is_active: true,
      notified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`price_alert:${alertId}`, alert);
    
    console.log(`🔔 Price alert ${alertId} created for ${user_email} - Product: ${product_name} - Target: ${target_price}`);
    
    return c.json({ alert, message: 'Price alert created successfully' }, 201);
  } catch (error) {
    console.log('Error creating price alert:', error);
    return c.json({ error: 'Failed to create price alert', details: String(error) }, 500);
  }
});

// Delete price alert
priceAlertRoutes.delete('/:id', requireAuthUser, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(`price_alert:${id}`);
    if (!existing) {
      return c.json({ error: 'Price alert not found' }, 404);
    }
    
    await kv.del(`price_alert:${id}`);
    
    console.log(`🗑️ Price alert ${id} deleted`);
    
    return c.json({ message: 'Price alert deleted successfully' });
  } catch (error) {
    console.log('Error deleting price alert:', error);
    return c.json({ error: 'Failed to delete price alert', details: String(error) }, 500);
  }
});

// Check and trigger alerts (called when product price changes)
priceAlertRoutes.post('/check/:product_id', async (c) => {
  try {
    const productId = c.req.param('product_id');
    
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const allAlerts = await kv.getByPrefix('price_alert:');
    const productAlerts = allAlerts.filter((alert: any) => 
      alert.product_id === productId && 
      alert.is_active && 
      !alert.notified &&
      product.preco_aoa <= alert.target_price
    );
    
    const triggeredAlerts = [];
    
    for (const alert of productAlerts) {
      // Mark as notified
      const updated = {
        ...alert,
        notified: true,
        notified_at: new Date().toISOString(),
        triggered_price: product.preco_aoa,
        updated_at: new Date().toISOString()
      };
      
      await kv.set(`price_alert:${alert.id}`, updated);
      
      // TODO: Send notification (WhatsApp/Email)
      console.log(`🔔 ALERT TRIGGERED: ${alert.user_name} - ${product.nome} - Price: ${product.preco_aoa} AOA (Target: ${alert.target_price} AOA)`);
      
      triggeredAlerts.push(updated);
    }
    
    return c.json({ 
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts 
    });
  } catch (error) {
    console.log('Error checking price alerts:', error);
    return c.json({ error: 'Failed to check price alerts', details: String(error) }, 500);
  }
});

// ===================================
// LOYALTY PROGRAM ROUTES
// ===================================

// Get user loyalty points
loyaltyRoutes.get('/user/:email', requireAuthUser, async (c) => {
  try {
    const email = c.req.param('email');
    
    let loyalty = await kv.get(`loyalty:${email}`);
    
    if (!loyalty) {
      // Create default loyalty account
      loyalty = {
        user_email: email,
        points: 0,
        total_earned: 0,
        total_spent: 0,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await kv.set(`loyalty:${email}`, loyalty);
    }
    
    return c.json({ loyalty });
  } catch (error) {
    console.log('Error fetching loyalty points:', error);
    return c.json({ error: 'Failed to fetch loyalty points', details: String(error) }, 500);
  }
});

// Get loyalty history
loyaltyRoutes.get('/history/:email', requireAuthUser, async (c) => {
  try {
    const email = c.req.param('email');
    const allHistory = await kv.getByPrefix('loyalty_history:');
    
    const userHistory = allHistory.filter((h: any) => h.user_email === email);
    
    userHistory.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ history: userHistory });
  } catch (error) {
    console.log('Error fetching loyalty history:', error);
    return c.json({ error: 'Failed to fetch loyalty history', details: String(error) }, 500);
  }
});

// Add points (called when order is completed)
loyaltyRoutes.post('/add-points', async (c) => {
  try {
    const { user_email, order_id, amount, reason } = await c.req.json();
    
    if (!user_email || !amount) {
      return c.json({ error: 'User email and amount are required' }, 400);
    }
    
    // Get or create loyalty account
    let loyalty = await kv.get(`loyalty:${user_email}`);
    
    if (!loyalty) {
      loyalty = {
        user_email,
        points: 0,
        total_earned: 0,
        total_spent: 0,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    // Calculate points (1% of order value)
    const pointsToAdd = Math.floor(amount * 0.01);
    
    // Update loyalty account
    loyalty.points += pointsToAdd;
    loyalty.total_earned += pointsToAdd;
    loyalty.updated_at = new Date().toISOString();
    
    // Update tier based on total earned
    if (loyalty.total_earned >= 100000) {
      loyalty.tier = 'gold';
    } else if (loyalty.total_earned >= 50000) {
      loyalty.tier = 'silver';
    } else {
      loyalty.tier = 'bronze';
    }
    
    await kv.set(`loyalty:${user_email}`, loyalty);
    
    // Create history entry
    const historyId = `LOYHIST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    const history = {
      id: historyId,
      user_email,
      type: 'earned',
      points: pointsToAdd,
      order_id,
      reason: reason || `Compra - Pedido #${order_id}`,
      balance_after: loyalty.points,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`loyalty_history:${historyId}`, history);
    
    console.log(`💎 ${pointsToAdd} pontos adicionados para ${user_email} - Saldo: ${loyalty.points}`);
    
    return c.json({ 
      loyalty, 
      points_added: pointsToAdd,
      message: `${pointsToAdd} pontos adicionados!` 
    });
  } catch (error) {
    console.log('Error adding loyalty points:', error);
    return c.json({ error: 'Failed to add loyalty points', details: String(error) }, 500);
  }
});

// Redeem points
loyaltyRoutes.post('/redeem-points', requireAuthUser, async (c) => {
  try {
    const { user_email, points, reason } = await c.req.json();
    
    if (!user_email || !points) {
      return c.json({ error: 'User email and points are required' }, 400);
    }
    
    const loyalty = await kv.get(`loyalty:${user_email}`);
    
    if (!loyalty) {
      return c.json({ error: 'Loyalty account not found' }, 404);
    }
    
    if (loyalty.points < points) {
      return c.json({ error: 'Insufficient points' }, 400);
    }
    
    // Update loyalty account
    loyalty.points -= points;
    loyalty.total_spent += points;
    loyalty.updated_at = new Date().toISOString();
    
    await kv.set(`loyalty:${user_email}`, loyalty);
    
    // Create history entry
    const historyId = `LOYHIST${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    const history = {
      id: historyId,
      user_email,
      type: 'redeemed',
      points: -points,
      reason: reason || 'Resgate de pontos',
      balance_after: loyalty.points,
      created_at: new Date().toISOString()
    };
    
    await kv.set(`loyalty_history:${historyId}`, history);
    
    console.log(`💰 ${points} pontos resgatados por ${user_email} - Saldo: ${loyalty.points}`);
    
    return c.json({ 
      loyalty, 
      points_redeemed: points,
      discount_value: points * 10, // 1 ponto = 10 AOA
      message: `${points} pontos resgatados! Desconto de ${points * 10} AOA` 
    });
  } catch (error) {
    console.log('Error redeeming loyalty points:', error);
    return c.json({ error: 'Failed to redeem loyalty points', details: String(error) }, 500);
  }
});

// ===================================
// FLASH SALES ROUTES
// ===================================

// Get all active flash sales
flashSaleRoutes.get('/active', async (c) => {
  try {
    const allSales = await kv.getByPrefix('flash_sale:');
    const now = new Date();
    
    const activeSales = allSales.filter((sale: any) => {
      const startDate = new Date(sale.start_date);
      const endDate = new Date(sale.end_date);
      return sale.is_active && now >= startDate && now <= endDate;
    });
    
    return c.json({ flash_sales: activeSales });
  } catch (error) {
    console.log('Error fetching active flash sales:', error);
    return c.json({ error: 'Failed to fetch flash sales', details: String(error) }, 500);
  }
});

// Get all flash sales (admin)
flashSaleRoutes.get('/', requireAuth, async (c) => {
  try {
    const sales = await kv.getByPrefix('flash_sale:');
    
    sales.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ flash_sales: sales });
  } catch (error) {
    console.log('Error fetching flash sales:', error);
    return c.json({ error: 'Failed to fetch flash sales', details: String(error) }, 500);
  }
});

// Create flash sale (admin)
flashSaleRoutes.post('/', requireAuth, async (c) => {
  try {
    const { product_id, discount_percentage, stock_limit, start_date, end_date, title, description } = await c.req.json();
    
    if (!product_id || !discount_percentage || !stock_limit) {
      return c.json({ error: 'Product ID, discount percentage, and stock limit are required' }, 400);
    }
    
    const product = await kv.get(`product:${product_id}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const saleId = `FLASH${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
    
    const originalPrice = product.preco_aoa;
    const discountedPrice = Math.floor(originalPrice * (1 - discount_percentage / 100));
    
    const flashSale = {
      id: saleId,
      product_id,
      product_name: product.nome,
      product_image: product.imagem_url,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_percentage,
      stock_limit,
      stock_sold: 0,
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h default
      title: title || `Flash Sale - ${product.nome}`,
      description: description || `${discount_percentage}% OFF por tempo limitado!`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`flash_sale:${saleId}`, flashSale);
    
    console.log(`⚡ Flash Sale ${saleId} created: ${product.nome} - ${discount_percentage}% OFF`);
    
    return c.json({ flash_sale: flashSale, message: 'Flash sale created successfully' }, 201);
  } catch (error) {
    console.log('Error creating flash sale:', error);
    return c.json({ error: 'Failed to create flash sale', details: String(error) }, 500);
  }
});

// Update flash sale (admin)
flashSaleRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`flash_sale:${id}`);
    if (!existing) {
      return c.json({ error: 'Flash sale not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      id,
      created_at: existing.created_at,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`flash_sale:${id}`, updated);
    
    console.log(`⚡ Flash Sale ${id} updated`);
    
    return c.json({ flash_sale: updated, message: 'Flash sale updated successfully' });
  } catch (error) {
    console.log('Error updating flash sale:', error);
    return c.json({ error: 'Failed to update flash sale', details: String(error) }, 500);
  }
});

// Delete flash sale (admin)
flashSaleRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(`flash_sale:${id}`);
    if (!existing) {
      return c.json({ error: 'Flash sale not found' }, 404);
    }
    
    await kv.del(`flash_sale:${id}`);
    
    console.log(`🗑️ Flash Sale ${id} deleted`);
    
    return c.json({ message: 'Flash sale deleted successfully' });
  } catch (error) {
    console.log('Error deleting flash sale:', error);
    return c.json({ error: 'Failed to delete flash sale', details: String(error) }, 500);
  }
});

// Increment sold count (called when flash sale item is purchased)
flashSaleRoutes.post('/:id/purchase', async (c) => {
  try {
    const id = c.req.param('id');
    const { quantity } = await c.req.json();
    
    const flashSale = await kv.get(`flash_sale:${id}`);
    if (!flashSale) {
      return c.json({ error: 'Flash sale not found' }, 404);
    }
    
    if (flashSale.stock_sold + quantity > flashSale.stock_limit) {
      return c.json({ error: 'Flash sale stock limit exceeded' }, 400);
    }
    
    flashSale.stock_sold += quantity;
    flashSale.updated_at = new Date().toISOString();
    
    await kv.set(`flash_sale:${id}`, flashSale);
    
    console.log(`⚡ Flash Sale ${id} - ${quantity} vendido(s) - Total: ${flashSale.stock_sold}/${flashSale.stock_limit}`);
    
    return c.json({ flash_sale: flashSale });
  } catch (error) {
    console.log('Error updating flash sale purchase:', error);
    return c.json({ error: 'Failed to update flash sale purchase', details: String(error) }, 500);
  }
});

// Helper function to calculate average rating
function calculateAverageRating(reviews: any[]) {
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
  return totalRating / reviews.length;
}