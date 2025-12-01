/**
 * 🛣️ ROTAS V2 - KZSTORE
 * Rotas otimizadas usando Supabase direto
 * Criado em 22/11/2025 após migração completa
 */

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as db from './supabase-helpers.tsx';
import { requireAuth, validateProduct, validateOrder } from './middleware.ts';
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

export const productRoutesV2 = new Hono();
export const orderRoutesV2 = new Hono();
export const authRoutesV2 = new Hono();
export const chatbotRoutesV2 = new Hono();
export const reviewRoutesV2 = new Hono();
export const couponRoutesV2 = new Hono();
export const priceAlertRoutesV2 = new Hono();
export const loyaltyRoutesV2 = new Hono();
export const flashSaleRoutesV2 = new Hono();

// ============ PRODUCT ROUTES ============

// GET /products - Listar todos os produtos
productRoutesV2.get('/', async (c) => {
  try {
    const filters = {
      categoria: c.req.query('categoria'),
      subcategoria: c.req.query('subcategoria'),
      marca: c.req.query('marca'),
      ativo: c.req.query('ativo') === 'true' ? true : undefined,
      destaque: c.req.query('destaque') === 'true' ? true : undefined,
      search: c.req.query('search')
    };

    const products = await db.getAllProducts(filters);
    
    // Verificar flash sales ativos
    const productsWithFlashSales = await Promise.all(
      products.map(async (product) => {
        const flashSale = await db.getFlashSaleByProductId(product.id);
        return {
          ...product,
          flash_sale: flashSale
        };
      })
    );

    return c.json({ products: productsWithFlashSales });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products', details: String(error) }, 500);
  }
});

// GET /products/:id - Buscar produto por ID
productRoutesV2.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await db.getProductById(id);
    
    // Buscar flash sale se houver
    const flashSale = await db.getFlashSaleByProductId(id);
    
    // Buscar reviews
    const reviews = await db.getReviewsByProductId(id);
    
    return c.json({ 
      product: {
        ...product,
        flash_sale: flashSale
      }, 
      reviews 
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return c.json({ error: 'Product not found', details: String(error) }, 404);
  }
});

// POST /products/initialize - Inicializar produtos (para setup inicial)
productRoutesV2.post('/initialize', async (c) => {
  try {
    console.log('🔧 [PRODUCTS] Initializing products...');
    
    const { products } = await c.req.json();
    
    if (!products || !Array.isArray(products)) {
      return c.json({ error: 'Invalid products array' }, 400);
    }
    
    const createdProducts = [];
    for (const productData of products) {
      try {
        // Verificar se produto já existe pelo nome
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('nome', productData.nome)
          .single();
        
        if (existing) {
          console.log(`⏩ Product already exists: ${productData.nome}`);
          continue;
        }
        
        const product = await db.createProduct(productData);
        createdProducts.push(product);
        console.log(`✅ Created product: ${product.nome}`);
      } catch (error) {
        console.error(`❌ Error creating product ${productData.nome}:`, error);
      }
    }
    
    console.log(`✅ Products initialized: ${createdProducts.length} created, ${products.length - createdProducts.length} skipped`);
    return c.json({ 
      message: 'Products initialized successfully',
      created: createdProducts.length,
      skipped: products.length - createdProducts.length,
      products: createdProducts 
    }, 201);
  } catch (error) {
    console.error('❌ Error initializing products:', error);
    return c.json({ error: 'Failed to initialize products', details: String(error) }, 500);
  }
});

// POST /products - Criar produto (requer auth)
productRoutesV2.post('/', requireAuth, validateProduct, async (c) => {
  try {
    const productData = await c.req.json();
    const product = await db.createProduct(productData);
    
    console.log('✅ Product created:', product.id);
    return c.json({ product, message: 'Product created successfully' }, 201);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return c.json({ error: 'Failed to create product', details: String(error) }, 500);
  }
});

// PUT /products/:id - Atualizar produto (requer auth)
productRoutesV2.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const product = await db.updateProduct(id, updates);
    
    // Se o preço mudou, verificar alertas de preço
    if (updates.preco_aoa) {
      const alerts = await db.getPriceAlertsByProductId(id);
      
      for (const alert of alerts) {
        if (updates.preco_aoa <= alert.target_price) {
          // Enviar notificação
          await sendEmail({
            to: alert.user_email,
            subject: `Alerta de Preço - ${product.nome}`,
            html: `
              <h2>O preço do produto que você solicitou alerta chegou ao seu objetivo!</h2>
              <p><strong>Produto:</strong> ${product.nome}</p>
              <p><strong>Preço atual:</strong> ${updates.preco_aoa} AOA</p>
              <p><strong>Seu preço alvo:</strong> ${alert.target_price} AOA</p>
              <p><a href="https://kzstore.ao/produtos/${id}">Ver produto</a></p>
            `
          });
          
          await db.markPriceAlertNotified(alert.id!);
        }
      }
    }
    
    console.log('✅ Product updated:', id);
    return c.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return c.json({ error: 'Failed to update product', details: String(error) }, 500);
  }
});

// DELETE /products/:id - Deletar produto (requer auth)
productRoutesV2.delete('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await db.deleteProduct(id);
    
    console.log('✅ Product deleted:', id);
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return c.json({ error: 'Failed to delete product', details: String(error) }, 500);
  }
});

// PUT /products/:id/stock - Atualizar estoque (requer auth)
productRoutesV2.put('/:id/stock', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const { stock, reason } = await c.req.json();
    
    await db.updateProductStock(id, stock, reason);
    
    console.log('✅ Product stock updated:', id, stock);
    return c.json({ message: 'Stock updated successfully', stock });
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    return c.json({ error: 'Failed to update stock', details: String(error) }, 500);
  }
});

// ============ ORDER ROUTES ============

// GET /orders - Listar pedidos
orderRoutesV2.get('/', async (c) => {
  try {
    const filters = {
      user_email: c.req.query('user_email'),
      status: c.req.query('status'),
      payment_status: c.req.query('payment_status'),
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    };

    const orders = await db.getAllOrders(filters);
    return c.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders', details: String(error) }, 500);
  }
});

// GET /orders/:id - Buscar pedido por ID
orderRoutesV2.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const order = await db.getOrderById(id);
    return c.json({ order });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return c.json({ error: 'Order not found', details: String(error) }, 404);
  }
});

// GET /orders/number/:orderNumber - Buscar pedido por número
orderRoutesV2.get('/number/:orderNumber', async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    const order = await db.getOrderByNumber(orderNumber);
    return c.json({ order });
  } catch (error) {
    console.error('❌ Error fetching order by number:', error);
    return c.json({ error: 'Order not found', details: String(error) }, 404);
  }
});

// POST /orders - Criar pedido
orderRoutesV2.post('/', validateOrder, async (c) => {
  try {
    const orderData = await c.req.json();
    
    // Gerar número do pedido
    const orderNumber = `KZ${Date.now().toString().slice(-8)}`;
    
    const order = await db.createOrder({
      ...orderData,
      order_number: orderNumber
    });
    
    // Adicionar pontos de fidelidade (1% do valor)
    const points = Math.floor(order.total * 0.01);
    await db.addLoyaltyPoints(
      order.user_email,
      points,
      `Pedido ${orderNumber}`,
      order.id
    );
    
    // Enviar email de confirmação
    try {
      const emailHtml = getOrderConfirmationTemplate(order);
      await sendEmail({
        to: order.user_email,
        subject: `Pedido Confirmado - ${orderNumber}`,
        html: emailHtml
      });
      
      // Enviar notificação WhatsApp
      await sendWhatsAppNotification({
        to: order.shipping_address.telefone,
        message: `🎉 Pedido ${orderNumber} confirmado! Total: ${order.total} AOA. Acompanhe pelo site.`
      });
    } catch (emailError) {
      console.error('⚠️ Error sending confirmation email:', emailError);
      // Não falhar a criação do pedido por erro de email
    }
    
    console.log('✅ Order created:', order.id, orderNumber);
    return c.json({ order, message: 'Order created successfully' }, 201);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return c.json({ error: 'Failed to create order', details: String(error) }, 500);
  }
});

// PUT /orders/:id - Atualizar pedido (requer auth)
orderRoutesV2.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const order = await db.updateOrder(id, updates);
    
    // Se o status mudou, enviar notificação
    if (updates.status) {
      try {
        const emailHtml = getStatusUpdateTemplate(order);
        await sendEmail({
          to: order.user_email,
          subject: `Atualização do Pedido ${order.order_number}`,
          html: emailHtml
        });
        
        // WhatsApp notification
        const statusMessages: Record<string, string> = {
          processing: 'em processamento',
          shipped: 'em trânsito',
          delivered: 'entregue',
          cancelled: 'cancelado'
        };
        
        await sendWhatsAppNotification({
          to: order.shipping_address.telefone,
          message: `📦 Pedido ${order.order_number} ${statusMessages[updates.status] || updates.status}!`
        });
      } catch (emailError) {
        console.error('⚠️ Error sending status update email:', emailError);
      }
    }
    
    console.log('✅ Order updated:', id);
    return c.json({ order, message: 'Order updated successfully' });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return c.json({ error: 'Failed to update order', details: String(error) }, 500);
  }
});

// ============ REVIEW ROUTES ============

// GET /reviews - Listar reviews
reviewRoutesV2.get('/', async (c) => {
  try {
    const productId = c.req.query('product_id');
    
    if (productId) {
      const reviews = await db.getReviewsByProductId(productId);
      return c.json({ reviews });
    }
    
    const filters = {
      is_approved: c.req.query('approved') === 'true' ? true : 
                    c.req.query('approved') === 'false' ? false : undefined,
      status: c.req.query('status')
    };
    
    const reviews = await db.getAllReviews(filters);
    return c.json({ reviews });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews', details: String(error) }, 500);
  }
});

// GET /reviews/product/:productId - Buscar reviews de um produto específico
reviewRoutesV2.get('/product/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    console.log('📝 [REVIEWS] Fetching reviews for product:', productId);
    
    const reviews = await db.getReviewsByProductId(productId, true); // Apenas aprovados
    
    // Calcular média
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    console.log(`✅ [REVIEWS] Found ${reviews.length} reviews, average: ${averageRating}`);
    
    return c.json({ 
      reviews, 
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length 
    });
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    return c.json({ error: 'Failed to fetch reviews', details: String(error) }, 500);
  }
});

// POST /reviews - Criar review
reviewRoutesV2.post('/', async (c) => {
  try {
    const reviewData = await c.req.json();
    
    console.log('📝 [REVIEWS] Creating review with data:', JSON.stringify(reviewData, null, 2));
    
    // Extrair apenas os campos válidos da tabela reviews
    const normalizedData = {
      product_id: reviewData.product_id,
      user_email: reviewData.user_email || reviewData.customer_email,
      user_name: reviewData.user_name || reviewData.customer_name,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      // Campos opcionais se existirem
      ...(reviewData.user_id && { user_id: reviewData.user_id }),
      ...(reviewData.order_id && { order_id: reviewData.order_id })
    };
    
    // Validação
    if (!normalizedData.product_id || !normalizedData.user_email || !normalizedData.rating) {
      const missingFields = [];
      if (!normalizedData.product_id) missingFields.push('product_id');
      if (!normalizedData.user_email) missingFields.push('user_email');
      if (!normalizedData.rating) missingFields.push('rating');
      
      console.error('❌ [REVIEWS] Missing required fields:', missingFields.join(', '));
      return c.json({ 
        error: 'Missing required fields', 
        details: `Required: ${missingFields.join(', ')}`,
        received: Object.keys(reviewData)
      }, 400);
    }
    
    if (normalizedData.rating < 1 || normalizedData.rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    
    // Usar dados normalizados ao criar review
    const review = await db.createReview(normalizedData);
    
    console.log('✅ [REVIEWS] Review created:', review.id);
    return c.json({ review, message: 'Review submitted successfully. Pending approval.' }, 201);
  } catch (error: any) {
    console.error('❌ [REVIEWS] Error creating review:', error);
    console.error('❌ [REVIEWS] Error message:', error?.message);
    
    return c.json({ 
      error: 'Failed to create review', 
      details: error?.message || error?.details || String(error),
      code: error?.code,
      hint: error?.hint
    }, 500);
  }
});

// PUT /reviews/:id - Atualizar review (requer auth)
reviewRoutesV2.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const review = await db.updateReview(id, updates);
    
    console.log('✅ Review updated:', id);
    return c.json({ review, message: 'Review updated successfully' });
  } catch (error) {
    console.error('❌ Error updating review:', error);
    return c.json({ error: 'Failed to update review', details: String(error) }, 500);
  }
});

// PUT /reviews/:id/approve - Aprovar review (requer auth)
reviewRoutesV2.put('/:id/approve', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const review = await db.updateReview(id, { is_approved: true, status: 'approved' });
    
    console.log('✅ Review approved:', id);
    return c.json({ review, message: 'Review approved' });
  } catch (error) {
    console.error('❌ Error approving review:', error);
    return c.json({ error: 'Failed to approve review', details: String(error) }, 500);
  }
});

// ============ COUPON ROUTES ============

// GET /coupons - Listar cupons
couponRoutesV2.get('/', async (c) => {
  try {
    const activeOnly = c.req.query('active') === 'true';
    const coupons = await db.getAllCoupons(activeOnly);
    return c.json({ coupons });
  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
    return c.json({ error: 'Failed to fetch coupons', details: String(error) }, 500);
  }
});

// POST /coupons/validate - Validar cupom
couponRoutesV2.post('/validate', async (c) => {
  try {
    const { code, orderValue } = await c.req.json();
    
    if (!code || !orderValue) {
      return c.json({ error: 'Code and order value are required' }, 400);
    }
    
    const result = await db.validateCoupon(code, orderValue);
    
    if (!result.valid) {
      return c.json({ valid: false, error: result.error }, 400);
    }
    
    return c.json({ 
      valid: true, 
      coupon: result.coupon, 
      discount: result.discount 
    });
  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    return c.json({ error: 'Failed to validate coupon', details: String(error) }, 500);
  }
});

// POST /coupons - Criar cupom (requer auth)
couponRoutesV2.post('/', requireAuth, async (c) => {
  try {
    const couponData = await c.req.json();
    
    console.log('🎫 [COUPONS] Creating coupon with data:', JSON.stringify(couponData, null, 2));
    
    // Validação
    if (!couponData.code || !couponData.discount_type || !couponData.discount_value) {
      const missingFields = [];
      if (!couponData.code) missingFields.push('code');
      if (!couponData.discount_type) missingFields.push('discount_type');
      if (!couponData.discount_value) missingFields.push('discount_value');
      
      console.error('❌ [COUPONS] Missing required fields:', missingFields.join(', '));
      return c.json({ 
        error: 'Missing required fields',
        details: `Required: ${missingFields.join(', ')}`,
        received: Object.keys(couponData)
      }, 400);
    }
    
    const coupon = await db.createCoupon(couponData);
    
    console.log('✅ Coupon created:', coupon.code);
    return c.json({ coupon, message: 'Coupon created successfully' }, 201);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    return c.json({ error: 'Failed to create coupon', details: String(error) }, 500);
  }
});

// PUT /coupons/:id - Atualizar cupom (requer auth)
couponRoutesV2.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const coupon = await db.updateCoupon(id, updates);
    
    console.log('✅ Coupon updated:', id);
    return c.json({ coupon, message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('❌ Error updating coupon:', error);
    return c.json({ error: 'Failed to update coupon', details: String(error) }, 500);
  }
});

// ============ FLASH SALE ROUTES ============

// GET /flash-sales - Listar flash sales
flashSaleRoutesV2.get('/', async (c) => {
  try {
    const activeOnly = c.req.query('active') === 'true';
    const flashSales = await db.getAllFlashSales(activeOnly);
    return c.json({ flash_sales: flashSales });
  } catch (error) {
    console.error('❌ Error fetching flash sales:', error);
    return c.json({ error: 'Failed to fetch flash sales', details: String(error) }, 500);
  }
});

// GET /flash-sales/active - Listar apenas flash sales ativos
flashSaleRoutesV2.get('/active', async (c) => {
  try {
    console.log('📍 [FLASH SALES] Fetching active flash sales...');
    const flashSales = await db.getAllFlashSales(true);
    console.log(`✅ [FLASH SALES] Found ${flashSales.length} active flash sales`);
    return c.json({ flash_sales: flashSales });
  } catch (error) {
    console.error('❌ Error fetching flash sale active:', error);
    return c.json({ error: 'Failed to fetch flash sales', details: String(error) }, 500);
  }
});

// GET /flash-sales/:id - Buscar flash sale por ID
flashSaleRoutesV2.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const flashSale = await db.getFlashSaleById(id);
    return c.json({ flash_sale: flashSale });
  } catch (error) {
    console.error('❌ Error fetching flash sale:', error);
    return c.json({ error: 'Flash sale not found', details: String(error) }, 404);
  }
});

// POST /flash-sales - Criar flash sale (requer auth)
flashSaleRoutesV2.post('/', requireAuth, async (c) => {
  try {
    const flashSaleData = await c.req.json();
    
    // Validação
    if (!flashSaleData.product_id || !flashSaleData.title || !flashSaleData.discount_percentage) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const flashSale = await db.createFlashSale(flashSaleData);
    
    console.log('✅ Flash sale created:', flashSale.id);
    return c.json({ flash_sale: flashSale, message: 'Flash sale created successfully' }, 201);
  } catch (error) {
    console.error('❌ Error creating flash sale:', error);
    return c.json({ error: 'Failed to create flash sale', details: String(error) }, 500);
  }
});

// PUT /flash-sales/:id - Atualizar flash sale (requer auth)
flashSaleRoutesV2.put('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const flashSale = await db.updateFlashSale(id, updates);
    
    console.log('✅ Flash sale updated:', id);
    return c.json({ flash_sale: flashSale, message: 'Flash sale updated successfully' });
  } catch (error) {
    console.error('❌ Error updating flash sale:', error);
    return c.json({ error: 'Failed to update flash sale', details: String(error) }, 500);
  }
});

// ============ PRICE ALERT ROUTES ============

// POST /price-alerts - Criar alerta de preço
priceAlertRoutesV2.post('/', async (c) => {
  try {
    const alertData = await c.req.json();
    
    if (!alertData.product_id || !alertData.user_email || !alertData.target_price) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const alert = await db.createPriceAlert(alertData);
    
    console.log('✅ Price alert created:', alert.id);
    return c.json({ alert, message: 'Price alert created successfully' }, 201);
  } catch (error) {
    console.error('❌ Error creating price alert:', error);
    return c.json({ error: 'Failed to create price alert', details: String(error) }, 500);
  }
});

// ============ LOYALTY ROUTES ============

// GET /loyalty/:email - Buscar conta de fidelidade
loyaltyRoutesV2.get('/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const account = await db.getLoyaltyAccount(email);
    
    if (!account) {
      return c.json({ error: 'Loyalty account not found' }, 404);
    }
    
    return c.json({ account });
  } catch (error) {
    console.error('❌ Error fetching loyalty account:', error);
    return c.json({ error: 'Failed to fetch loyalty account', details: String(error) }, 500);
  }
});

// GET /loyalty/:email/history - Buscar histórico de fidelidade
loyaltyRoutesV2.get('/:email/history', async (c) => {
  try {
    const email = c.req.param('email');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const history = await db.getLoyaltyHistory(email, limit);
    return c.json({ history });
  } catch (error) {
    console.error('❌ Error fetching loyalty history:', error);
    return c.json({ error: 'Failed to fetch loyalty history', details: String(error) }, 500);
  }
});

// POST /loyalty/redeem - Resgatar pontos
loyaltyRoutesV2.post('/redeem', async (c) => {
  try {
    const { email, points, description } = await c.req.json();
    
    if (!email || !points || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const result = await db.redeemLoyaltyPoints(email, points, description);
    
    console.log('✅ Loyalty points redeemed:', email, points);
    return c.json({ 
      message: 'Points redeemed successfully',
      newPoints: result.newPoints
    });
  } catch (error) {
    console.error('❌ Error redeeming points:', error);
    return c.json({ error: 'Failed to redeem points', details: String(error) }, 500);
  }
});

// ============ AUTH ROUTES ============

// POST /auth/signup - Criar conta de cliente
authRoutesV2.post('/signup', async (c) => {
  try {
    const { email, password, nome, telefone } = await c.req.json();
    
    console.log('📝 [SIGNUP] Creating new customer account:', { email, nome });
    
    // Validar dados
    if (!email || !password || !nome) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, 400);
    }
    
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, telefone }
    });
    
    if (error) {
      console.error('❌ Error creating user:', error);
      return c.json({ error: 'Failed to create account', details: error.message }, 500);
    }
    
    // Criar perfil de cliente
    await db.createCustomerProfile({
      id: data.user!.id,
      nome,
      email,
      telefone,
      is_admin: false
    });
    
    console.log('✅ Customer account created:', email);
    return c.json({ 
      message: 'Account created successfully',
      user: {
        id: data.user!.id,
        email: data.user!.email
      }
    }, 201);
  } catch (error) {
    console.error('❌ Error in signup:', error);
    return c.json({ error: 'Failed to create account', details: String(error) }, 500);
  }
});

// POST /auth/setup-admin - Criar admin inicial (rota pública para setup)
authRoutesV2.post('/setup-admin', async (c) => {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Verificar se já existe admin no perfil
    const existingAdmin = await db.getCustomerByEmail('admin@kzstore.ao');
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return c.json({ 
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email
        }
      }, 200);
    }
    
    // Verificar se já existe na Auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users?.find(u => u.email === 'admin@kzstore.ao');
    
    if (existingAuthUser) {
      console.log('⚠️ Admin user exists in Auth but not in profile, creating profile...');
      
      // Criar apenas o perfil
      await db.createCustomerProfile({
        id: existingAuthUser.id,
        nome: 'Administrador KZSTORE',
        email: 'admin@kzstore.ao',
        telefone: '+244931054015',
        is_admin: true
      });
      
      console.log('✅ Admin profile created for existing auth user');
      return c.json({ 
        message: 'Admin profile created successfully',
        user: {
          id: existingAuthUser.id,
          email: existingAuthUser.email
        }
      }, 201);
    }
    
    // Criar admin no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@kzstore.ao',
      password: 'kzstore2024',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador KZSTORE',
        role: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Error creating admin user:', error);
      return c.json({ error: 'Failed to create admin user', details: error.message }, 500);
    }
    
    // Criar perfil de admin
    await db.createCustomerProfile({
      id: data.user!.id,
      nome: 'Administrador KZSTORE',
      email: 'admin@kzstore.ao',
      telefone: '+244931054015',
      is_admin: true
    });
    
    console.log('✅ Admin user created successfully');
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

// ============ CHATBOT ROUTES ============

// POST /chatbot/message - Enviar mensagem para chatbot
chatbotRoutesV2.post('/message', async (c) => {
  try {
    const { message, sessionId } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      return c.json({ 
        error: 'Chatbot not configured',
        response: 'Desculpe, o chatbot não está configurado no momento. Entre em contato via WhatsApp: +244931054015'
      }, 503);
    }
    
    // Buscar produtos para contexto
    const products = await db.getAllProducts({ ativo: true });
    const productsContext = products.slice(0, 10).map(p => 
      `${p.nome} - ${p.preco_aoa} AOA (${p.categoria})`
    ).join('\n');
    
    // Chamar API do Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é um assistente virtual da KZSTORE, loja de eletrônicos em Angola.
              
Produtos disponíveis:
${productsContext}

WhatsApp para contato: +244931054015

Responda em português de Angola de forma profissional e útil.

Cliente: ${message}`
            }]
          }]
        })
      }
    );
    
    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                       'Desculpe, não consegui processar sua mensagem. Entre em contato via WhatsApp: +244931054015';
    
    // Track analytics
    await db.trackEvent({
      event_type: 'chatbot_message',
      event_category: 'engagement',
      session_id: sessionId || crypto.randomUUID(),
      metadata: { message, response: botResponse }
    });
    
    return c.json({ response: botResponse });
  } catch (error) {
    console.error('❌ Error in chatbot:', error);
    return c.json({ 
      error: 'Chatbot error',
      response: 'Desculpe, ocorreu um erro. Entre em contato via WhatsApp: +244931054015'
    }, 500);
  }
});

console.log('✅ Routes V2 loaded successfully');