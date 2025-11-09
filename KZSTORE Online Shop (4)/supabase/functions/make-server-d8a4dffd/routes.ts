import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.ts';
import { requireAuth, requireAuthUser, validateProduct, validateOrder } from './middleware.ts';
import { 
  getOrderConfirmationTemplate, 
  getStatusUpdateTemplate, 
  sendEmail, 
  sendWhatsAppNotification 
} from './email-service.ts';
import { ticketRoutes } from './ticket-routes.ts';

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
export { ticketRoutes };

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

// ============ PRODUCT ROUTES ============

// Get all products (public)
productRoutes.get('/', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products || [] });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products', details: String(error) }, 500);
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

// Initialize products (admin only)
productRoutes.post('/initialize', requireAuth, async (c) => {
  try {
    const { products } = await c.req.json();
    
    if (!Array.isArray(products)) {
      return c.json({ error: 'Products must be an array' }, 400);
    }
    
    console.log(`📦 Initializing ${products.length} products...`);
    
    for (const product of products) {
      await kv.set(`product:${product.id}`, {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    console.log('✅ Products initialized successfully');
    return c.json({ message: `Initialized ${products.length} products` });
  } catch (error) {
    console.log('Error initializing products:', error);
    return c.json({ error: 'Failed to initialize products', details: String(error) }, 500);
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
        const product = await kv.get(`product:${item.product_id}`);
        if (!product) {
          return c.json({ 
            error: 'Product not found', 
            product_id: item.product_id 
          }, 404);
        }
        
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

// Get all orders (admin only)
orderRoutes.get('/', requireAuth, async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
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
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
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
    
    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const updated = {
      ...existing,
      status,
      tracking_code: tracking_code || existing.tracking_code,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`order:${id}`, updated);
    
    console.log(`📊 Order ${id} status updated: ${existing.status} → ${status}`);
    
    // Enviar notificação de atualização de status
    try {
      console.log('📧 Sending status update notifications...');
      
      const emailData = {
        order_id: updated.id,
        customer_name: updated.customer.nome,
        customer_email: updated.customer.email,
        customer_phone: updated.customer.telefone,
        customer_address: updated.customer.endereco,
        customer_city: updated.customer.cidade,
        items: updated.items,
        total: updated.total,
        payment_method: updated.payment_method,
        status: updated.status,
        created_at: updated.created_at,
        tracking_code: updated.tracking_code
      };
      
      const statusUpdateTemplate = getStatusUpdateTemplate(emailData);
      const emailSent = await sendEmail(updated.customer.email, statusUpdateTemplate);
      
      if (emailSent) {
        console.log('✅ Status update email sent to:', updated.customer.email);
      }
      
      const whatsappSent = await sendWhatsAppNotification(updated.customer.telefone, emailData);
      
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
    
    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    await kv.del(`order:${id}`);
    
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

// Export all data (admin only)
backupRoutes.get('/export', requireAuth, async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    const orders = await kv.getByPrefix('order:');
    const customers = await kv.getByPrefix('customer:');
    
    const backup = {
      timestamp: new Date().toISOString(),
      products,
      orders,
      customers
    };
    
    return c.json(backup);
  } catch (error) {
    console.log('Error exporting data:', error);
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
reviewRoutes.get('/product/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    const allReviews = await kv.getByPrefix('review:');
    
    // Filter by product
    const productReviews = allReviews.filter((review: any) => review.product_id === productId);
    
    // Sort by date (newest first)
    productReviews.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Calculate average rating
    const avgRating = productReviews.length > 0
      ? productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length
      : 0;
    
    return c.json({ 
      reviews: productReviews,
      averageRating: avgRating,
      totalReviews: productReviews.length
    });
  } catch (error) {
    console.log('Error fetching product reviews:', error);
    return c.json({ error: 'Failed to fetch reviews', details: String(error) }, 500);
  }
});

// Get all reviews (admin)
reviewRoutes.get('/', requireAuth, async (c) => {
  try {
    const reviews = await kv.getByPrefix('review:');
    
    // Sort by date (newest first)
    reviews.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ reviews });
  } catch (error) {
    console.log('Error fetching all reviews:', error);
    return c.json({ error: 'Failed to fetch reviews', details: String(error) }, 500);
  }
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