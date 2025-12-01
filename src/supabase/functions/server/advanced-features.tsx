// Advanced Features for KZSTORE
// Pre-orders, Trade-in, B2B, Affiliates, Tickets, Quotes, Analytics

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// PRE-ORDER SYSTEM (Sistema de Pré-venda)
// ============================================================================

// Create pre-order
app.post('/pre-orders', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, product_id, product_name, quantity, deposit_amount, total_amount, user_email, user_name } = body;

    const preOrderId = `preorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const preOrder = {
      id: preOrderId,
      user_id,
      product_id,
      product_name,
      quantity: quantity || 1,
      deposit_amount, // 30% sinal
      total_amount,
      remaining_amount: total_amount - deposit_amount,
      status: 'pending', // pending, confirmed, arrived, completed, cancelled
      user_email,
      user_name,
      created_at: new Date().toISOString(),
      estimated_arrival: body.estimated_arrival || null,
      notify_on_arrival: true,
    };

    await kv.set(`preorder:${preOrderId}`, preOrder);
    
    // Add to user's pre-orders
    const userPreOrders = await kv.get(`user:${user_id}:preorders`) || [];
    userPreOrders.push(preOrderId);
    await kv.set(`user:${user_id}:preorders`, userPreOrders);

    // Add to waiting list for product
    const waitingList = await kv.get(`product:${product_id}:waiting`) || [];
    waitingList.push({ user_id, user_email, user_name, preorder_id: preOrderId, date: new Date().toISOString() });
    await kv.set(`product:${product_id}:waiting`, waitingList);

    console.log('✅ Pre-order created:', preOrderId);
    return c.json({ success: true, preOrder });
  } catch (error: any) {
    console.error('❌ Error creating pre-order:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user pre-orders
app.get('/pre-orders/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const preOrderIds = await kv.get(`user:${userId}:preorders`) || [];
    const preOrders = await kv.mget(preOrderIds.map((id: string) => `preorder:${id}`));
    
    return c.json({ preOrders: preOrders.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching pre-orders:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all pre-orders
app.get('/pre-orders', async (c) => {
  try {
    const preOrders = await kv.getByPrefix('preorder:');
    return c.json({ preOrders: preOrders.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching pre-orders:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Update pre-order status
app.patch('/pre-orders/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const preOrder = await kv.get(`preorder:${id}`);
    if (!preOrder) {
      return c.json({ error: 'Pre-order not found' }, 404);
    }

    preOrder.status = status;
    preOrder.updated_at = new Date().toISOString();
    await kv.set(`preorder:${id}`, preOrder);

    // If arrived, notify waiting list
    if (status === 'arrived' && preOrder.notify_on_arrival) {
      console.log(`📧 Should notify user: ${preOrder.user_email} that product arrived`);
      // Email notification would be sent here
    }

    return c.json({ success: true, preOrder });
  } catch (error: any) {
    console.error('❌ Error updating pre-order:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// TRADE-IN SYSTEM (Programa Trade-In)
// ============================================================================

// Submit trade-in request
app.post('/trade-in', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, user_email, user_name, device_type, brand, model, condition, imei, description, target_product_id } = body;

    const tradeInId = `tradein_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tradeIn = {
      id: tradeInId,
      user_id,
      user_email,
      user_name,
      device_type, // phone, laptop, tablet, etc
      brand,
      model,
      condition, // excellent, good, fair, poor
      imei: imei || null,
      description,
      target_product_id: target_product_id || null, // Product they want to buy
      estimated_value: calculateTradeInValue(device_type, brand, model, condition),
      final_value: null,
      status: 'pending', // pending, evaluated, approved, rejected, completed
      admin_notes: null,
      created_at: new Date().toISOString(),
    };

    await kv.set(`tradein:${tradeInId}`, tradeIn);
    
    // Add to user's trade-ins
    const userTradeIns = await kv.get(`user:${user_id}:tradeins`) || [];
    userTradeIns.push(tradeInId);
    await kv.set(`user:${user_id}:tradeins`, userTradeIns);

    console.log('✅ Trade-in created:', tradeInId);
    return c.json({ success: true, tradeIn });
  } catch (error: any) {
    console.error('❌ Error creating trade-in:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Calculate estimated trade-in value
function calculateTradeInValue(deviceType: string, brand: string, model: string, condition: string): number {
  // Base values (simplified - in production would use real market data)
  const baseValues: any = {
    phone: { premium: 150000, mid: 80000, budget: 40000 },
    laptop: { premium: 300000, mid: 150000, budget: 80000 },
    tablet: { premium: 120000, mid: 60000, budget: 30000 },
  };

  const conditionMultiplier: any = {
    excellent: 1.0,
    good: 0.75,
    fair: 0.5,
    poor: 0.25,
  };

  const premiumBrands = ['apple', 'samsung', 'sony', 'dell', 'hp', 'lenovo'];
  const tier = premiumBrands.includes(brand.toLowerCase()) ? 'premium' : 'mid';
  
  const baseValue = baseValues[deviceType]?.[tier] || baseValues[deviceType]?.budget || 50000;
  const multiplier = conditionMultiplier[condition] || 0.5;
  
  return Math.round(baseValue * multiplier);
}

// Get user trade-ins
app.get('/trade-in/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const tradeInIds = await kv.get(`user:${userId}:tradeins`) || [];
    const tradeIns = await kv.mget(tradeInIds.map((id: string) => `tradein:${id}`));
    
    return c.json({ tradeIns: tradeIns.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching trade-ins:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all trade-ins
app.get('/trade-in', async (c) => {
  try {
    const tradeIns = await kv.getByPrefix('tradein:');
    return c.json({ tradeIns: tradeIns.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching trade-ins:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Evaluate trade-in
app.patch('/trade-in/:id/evaluate', async (c) => {
  try {
    const id = c.req.param('id');
    const { final_value, status, admin_notes } = await c.req.json();
    
    const tradeIn = await kv.get(`tradein:${id}`);
    if (!tradeIn) {
      return c.json({ error: 'Trade-in not found' }, 404);
    }

    tradeIn.final_value = final_value;
    tradeIn.status = status;
    tradeIn.admin_notes = admin_notes;
    tradeIn.evaluated_at = new Date().toISOString();
    await kv.set(`tradein:${id}`, tradeIn);

    console.log(`✅ Trade-in ${id} evaluated: ${final_value} AOA`);
    return c.json({ success: true, tradeIn });
  } catch (error: any) {
    console.error('❌ Error evaluating trade-in:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// CUSTOM QUOTES (Orçamento Personalizado)
// ============================================================================

// Submit quote request
app.post('/quotes', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, user_email, user_name, phone, requirements, budget } = body;

    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const quote = {
      id: quoteId,
      user_id,
      user_email,
      user_name,
      phone,
      requirements, // Detailed requirements text
      budget: budget || null,
      status: 'pending', // pending, in_progress, sent, accepted, rejected
      admin_proposal: null,
      proposed_items: [],
      total_amount: null,
      admin_notes: null,
      created_at: new Date().toISOString(),
    };

    await kv.set(`quote:${quoteId}`, quote);
    
    // Add to user's quotes
    const userQuotes = await kv.get(`user:${user_id}:quotes`) || [];
    userQuotes.push(quoteId);
    await kv.set(`user:${user_id}:quotes`, userQuotes);

    console.log('✅ Quote request created:', quoteId);
    return c.json({ success: true, quote });
  } catch (error: any) {
    console.error('❌ Error creating quote:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user quotes
app.get('/quotes/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const quoteIds = await kv.get(`user:${userId}:quotes`) || [];
    const quotes = await kv.mget(quoteIds.map((id: string) => `quote:${id}`));
    
    return c.json({ quotes: quotes.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching quotes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all quotes
app.get('/quotes', async (c) => {
  try {
    const quotes = await kv.getByPrefix('quote:');
    return c.json({ quotes: quotes.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching quotes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Send quote proposal
app.patch('/quotes/:id/proposal', async (c) => {
  try {
    const id = c.req.param('id');
    const { admin_proposal, proposed_items, total_amount, admin_notes } = await c.req.json();
    
    const quote = await kv.get(`quote:${id}`);
    if (!quote) {
      return c.json({ error: 'Quote not found' }, 404);
    }

    quote.status = 'sent';
    quote.admin_proposal = admin_proposal;
    quote.proposed_items = proposed_items;
    quote.total_amount = total_amount;
    quote.admin_notes = admin_notes;
    quote.sent_at = new Date().toISOString();
    await kv.set(`quote:${id}`, quote);

    console.log(`✅ Quote proposal sent: ${id}`);
    return c.json({ success: true, quote });
  } catch (error: any) {
    console.error('❌ Error sending quote proposal:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Customer: Accept/Reject quote
app.patch('/quotes/:id/respond', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, customer_notes } = await c.req.json();
    
    const quote = await kv.get(`quote:${id}`);
    if (!quote) {
      return c.json({ error: 'Quote not found' }, 404);
    }

    quote.status = status; // accepted or rejected
    quote.customer_notes = customer_notes;
    quote.responded_at = new Date().toISOString();
    await kv.set(`quote:${id}`, quote);

    return c.json({ success: true, quote });
  } catch (error: any) {
    console.error('❌ Error responding to quote:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// B2B ACCOUNTS (Contas Empresariais)
// ============================================================================

// Create B2B account
app.post('/b2b-accounts', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, company_name, tax_id, contact_person, email, phone, address, requested_credit_limit } = body;

    const accountId = `b2b_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const account = {
      id: accountId,
      user_id,
      company_name,
      tax_id, // NIF
      contact_person,
      email,
      phone,
      address,
      requested_credit_limit,
      approved_credit_limit: 0,
      used_credit: 0,
      available_credit: 0,
      discount_percentage: 0, // Special B2B discount
      status: 'pending', // pending, approved, rejected, suspended
      payment_terms: 30, // days
      created_at: new Date().toISOString(),
    };

    await kv.set(`b2b:${accountId}`, account);
    await kv.set(`user:${user_id}:b2b`, accountId);

    console.log('✅ B2B account created:', accountId);
    return c.json({ success: true, account });
  } catch (error: any) {
    console.error('❌ Error creating B2B account:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get B2B account by user
app.get('/b2b-accounts/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accountId = await kv.get(`user:${userId}:b2b`);
    if (!accountId) {
      return c.json({ account: null });
    }
    
    const account = await kv.get(`b2b:${accountId}`);
    return c.json({ account });
  } catch (error: any) {
    console.error('❌ Error fetching B2B account:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all B2B accounts
app.get('/b2b-accounts', async (c) => {
  try {
    const accounts = await kv.getByPrefix('b2b:');
    return c.json({ accounts: accounts.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching B2B accounts:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Approve/Update B2B account
app.patch('/b2b-accounts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const account = await kv.get(`b2b:${id}`);
    if (!account) {
      return c.json({ error: 'B2B account not found' }, 404);
    }

    Object.assign(account, updates);
    account.updated_at = new Date().toISOString();
    
    // Calculate available credit
    if (account.approved_credit_limit) {
      account.available_credit = account.approved_credit_limit - account.used_credit;
    }
    
    await kv.set(`b2b:${id}`, account);

    console.log(`✅ B2B account updated: ${id}`);
    return c.json({ success: true, account });
  } catch (error: any) {
    console.error('❌ Error updating B2B account:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// AFFILIATE SYSTEM (Sistema de Afiliados)
// ============================================================================

// Create affiliate
app.post('/affiliates', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, name, email, phone, website, social_media } = body;

    const affiliateId = `aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const affiliateCode = `KZ${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const affiliate = {
      id: affiliateId,
      user_id,
      name,
      email,
      phone,
      website: website || null,
      social_media: social_media || {},
      affiliate_code: affiliateCode,
      commission_rate: 5, // 5% default
      total_sales: 0,
      total_commission: 0,
      pending_commission: 0,
      paid_commission: 0,
      status: 'active', // active, suspended, terminated
      payment_method: null,
      payment_details: null,
      created_at: new Date().toISOString(),
    };

    await kv.set(`affiliate:${affiliateId}`, affiliate);
    await kv.set(`affiliate:code:${affiliateCode}`, affiliateId);
    await kv.set(`user:${user_id}:affiliate`, affiliateId);

    console.log('✅ Affiliate created:', affiliateId, affiliateCode);
    return c.json({ success: true, affiliate });
  } catch (error: any) {
    console.error('❌ Error creating affiliate:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get affiliate by code
app.get('/affiliates/code/:code', async (c) => {
  try {
    const code = c.req.param('code');
    const affiliateId = await kv.get(`affiliate:code:${code}`);
    if (!affiliateId) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }
    
    const affiliate = await kv.get(`affiliate:${affiliateId}`);
    return c.json({ affiliate });
  } catch (error: any) {
    console.error('❌ Error fetching affiliate:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get affiliate by user
app.get('/affiliates/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const affiliateId = await kv.get(`user:${userId}:affiliate`);
    if (!affiliateId) {
      return c.json({ affiliate: null });
    }
    
    const affiliate = await kv.get(`affiliate:${affiliateId}`);
    
    // Get sales for this affiliate
    const sales = await kv.getByPrefix(`affiliate:${affiliateId}:sale:`);
    
    return c.json({ affiliate, sales });
  } catch (error: any) {
    console.error('❌ Error fetching affiliate:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all affiliates
app.get('/affiliates', async (c) => {
  try {
    const affiliates = await kv.getByPrefix('affiliate:');
    // Filter out non-affiliate entries (codes, sales)
    const affiliatesList = affiliates.filter((a: any) => a.id && a.id.startsWith('aff_'));
    
    return c.json({ affiliates: affiliatesList.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching affiliates:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Record affiliate sale
app.post('/affiliates/sales', async (c) => {
  try {
    const { affiliate_code, order_id, order_total, customer_id } = await c.req.json();
    
    const affiliateId = await kv.get(`affiliate:code:${affiliate_code}`);
    if (!affiliateId) {
      return c.json({ error: 'Invalid affiliate code' }, 404);
    }

    const affiliate = await kv.get(`affiliate:${affiliateId}`);
    const commission = (order_total * affiliate.commission_rate) / 100;

    const sale = {
      id: `sale_${Date.now()}`,
      affiliate_id: affiliateId,
      affiliate_code,
      order_id,
      order_total,
      commission_rate: affiliate.commission_rate,
      commission_amount: commission,
      customer_id,
      status: 'pending', // pending, paid
      created_at: new Date().toISOString(),
    };

    await kv.set(`affiliate:${affiliateId}:sale:${sale.id}`, sale);

    // Update affiliate stats
    affiliate.total_sales += order_total;
    affiliate.total_commission += commission;
    affiliate.pending_commission += commission;
    await kv.set(`affiliate:${affiliateId}`, affiliate);

    console.log(`✅ Affiliate sale recorded: ${commission} AOA commission`);
    return c.json({ success: true, sale, commission });
  } catch (error: any) {
    console.error('❌ Error recording affiliate sale:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// TICKET SYSTEM (Sistema de Tickets de Suporte)
// ============================================================================

// Create ticket
app.post('/tickets', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, user_email, user_name, subject, category, priority, description, order_id } = body;

    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ticketNumber = `#${Date.now().toString().slice(-6)}`;
    
    const ticket = {
      id: ticketId,
      ticket_number: ticketNumber,
      user_id,
      user_email,
      user_name,
      subject,
      category, // technical, billing, shipping, product, other
      priority, // low, medium, high, urgent
      description,
      order_id: order_id || null,
      status: 'open', // open, in_progress, waiting_customer, resolved, closed
      assigned_to: null,
      sla_deadline: calculateSLADeadline(priority),
      resolution: null,
      satisfaction_rating: null,
      created_at: new Date().toISOString(),
      responses: [],
    };

    await kv.set(`ticket:${ticketId}`, ticket);
    
    // Add to user's tickets
    const userTickets = await kv.get(`user:${user_id}:tickets`) || [];
    userTickets.push(ticketId);
    await kv.set(`user:${user_id}:tickets`, userTickets);

    console.log('✅ Ticket created:', ticketNumber);
    return c.json({ success: true, ticket });
  } catch (error: any) {
    console.error('❌ Error creating ticket:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Calculate SLA deadline based on priority
function calculateSLADeadline(priority: string): string {
  const now = new Date();
  const hours: any = {
    urgent: 4,
    high: 24,
    medium: 48,
    low: 72,
  };
  
  now.setHours(now.getHours() + (hours[priority] || 48));
  return now.toISOString();
}

// Get user tickets
app.get('/tickets/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const ticketIds = await kv.get(`user:${userId}:tickets`) || [];
    const tickets = await kv.mget(ticketIds.map((id: string) => `ticket:${id}`));
    
    return c.json({ tickets: tickets.filter(Boolean) });
  } catch (error: any) {
    console.error('❌ Error fetching tickets:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Get all tickets
app.get('/tickets', async (c) => {
  try {
    const tickets = await kv.getByPrefix('ticket:');
    return c.json({ tickets: tickets.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error: any) {
    console.error('❌ Error fetching tickets:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add response to ticket
app.post('/tickets/:id/responses', async (c) => {
  try {
    const id = c.req.param('id');
    const { user_id, user_name, message, is_admin } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    const response = {
      id: `resp_${Date.now()}`,
      user_id,
      user_name,
      message,
      is_admin: is_admin || false,
      created_at: new Date().toISOString(),
    };

    ticket.responses.push(response);
    ticket.updated_at = new Date().toISOString();
    
    // If admin responded, change status
    if (is_admin && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    await kv.set(`ticket:${id}`, ticket);

    console.log(`✅ Response added to ticket ${ticket.ticket_number}`);
    return c.json({ success: true, ticket });
  } catch (error: any) {
    console.error('❌ Error adding ticket response:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Admin: Update ticket status
app.patch('/tickets/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, assigned_to, resolution } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    ticket.status = status;
    if (assigned_to !== undefined) ticket.assigned_to = assigned_to;
    if (resolution) ticket.resolution = resolution;
    ticket.updated_at = new Date().toISOString();
    
    if (status === 'resolved' || status === 'closed') {
      ticket.resolved_at = new Date().toISOString();
    }
    
    await kv.set(`ticket:${id}`, ticket);

    return c.json({ success: true, ticket });
  } catch (error: any) {
    console.error('❌ Error updating ticket:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Customer: Rate ticket resolution
app.patch('/tickets/:id/rating', async (c) => {
  try {
    const id = c.req.param('id');
    const { rating, feedback } = await c.req.json();
    
    const ticket = await kv.get(`ticket:${id}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    ticket.satisfaction_rating = rating; // 1-5
    ticket.satisfaction_feedback = feedback;
    ticket.rated_at = new Date().toISOString();
    await kv.set(`ticket:${id}`, ticket);

    console.log(`✅ Ticket rated: ${rating}/5`);
    return c.json({ success: true, ticket });
  } catch (error: any) {
    console.error('❌ Error rating ticket:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// ANALYTICS (Analytics Avançado)
// ============================================================================

// Track event
app.post('/analytics/events', async (c) => {
  try {
    const body = await c.req.json();
    const { event_type, user_id, session_id, data } = body;

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event = {
      id: eventId,
      event_type, // page_view, product_view, add_to_cart, checkout_start, purchase, etc
      user_id: user_id || 'anonymous',
      session_id,
      data,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`analytics:event:${eventId}`, event);

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `analytics:daily:${today}:${event_type}`;
    const count = await kv.get(dailyKey) || 0;
    await kv.set(dailyKey, count + 1);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error tracking event:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get analytics summary
app.get('/analytics/summary', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = {
      page_views: 0,
      product_views: 0,
      add_to_cart: 0,
      checkouts: 0,
      purchases: 0,
      conversion_rate: 0,
    };

    // Calculate metrics (simplified)
    const events = await kv.getByPrefix('analytics:event:');
    const recentEvents = events.filter((e: any) => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });

    recentEvents.forEach((event: any) => {
      if (event.event_type in summary) {
        summary[event.event_type as keyof typeof summary]++;
      }
    });

    summary.conversion_rate = summary.page_views > 0 
      ? (summary.purchases / summary.page_views) * 100 
      : 0;

    return c.json({ summary, period: { days, startDate, endDate } });
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
