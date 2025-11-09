import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { requireAuthUser } from './middleware.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export const ticketRoutes = new Hono();

// Tipos
interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  attachments?: string[];
}

// ============ TICKET ROUTES ============

// Get user's tickets (autenticado)
ticketRoutes.get('/my-tickets', requireAuthUser, async (c) => {
  try {
    const user = c.get('user');
    
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tickets:', error);
      return c.json({ error: 'Failed to fetch tickets', details: error.message }, 500);
    }

    return c.json({ tickets: tickets || [] });
  } catch (error) {
    console.error('Error in my-tickets:', error);
    return c.json({ error: 'Failed to fetch tickets', details: String(error) }, 500);
  }
});

// Get all tickets (admin only)
ticketRoutes.get('/', async (c) => {
  try {
    // TODO: Adicionar verificação de admin
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all tickets:', error);
      return c.json({ error: 'Failed to fetch tickets', details: error.message }, 500);
    }

    return c.json({ tickets: tickets || [] });
  } catch (error) {
    console.error('Error in get tickets:', error);
    return c.json({ error: 'Failed to fetch tickets', details: String(error) }, 500);
  }
});

// Get ticket by ID
ticketRoutes.get('/:id', requireAuthUser, async (c) => {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user');

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) {
      console.error('Error fetching ticket:', error);
      return c.json({ error: 'Ticket not found', details: error.message }, 404);
    }

    // Verificar se o usuário tem permissão
    // TODO: Adicionar verificação de admin
    if (ticket.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ ticket });
  } catch (error) {
    console.error('Error in get ticket:', error);
    return c.json({ error: 'Failed to fetch ticket', details: String(error) }, 500);
  }
});

// Create ticket (autenticado)
ticketRoutes.post('/', async (c) => {
  try {
    // TEMPORÁRIO: Pegar user_id do body para teste
    const body = await c.req.json();
    console.log('📝 Creating ticket - body:', JSON.stringify(body));

    const { subject, description, category, priority, user_id } = body;

    // Validações
    if (!subject || !description || !category) {
      return c.json({ 
        error: 'Missing required fields',
        required: ['subject', 'description', 'category']
      }, 400);
    }

    const ticketData = {
      user_id: user_id || '3f81a9a9-30cf-4f82-aada-d5bb46af2018', // TEMPORÁRIO: User ID hardcoded
      subject,
      description,
      category,
      priority: priority || 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📝 Inserting ticket:', JSON.stringify(ticketData));

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating ticket:', error);
      return c.json({ error: 'Failed to create ticket', details: error.message }, 500);
    }

    console.log('✅ Ticket created:', ticket.id);
    return c.json({ ticket }, 201);
  } catch (error) {
    console.error('Error in create ticket:', error);
    return c.json({ error: 'Failed to create ticket', details: String(error) }, 500);
  }
});

// Update ticket status (admin)
ticketRoutes.put('/:id', async (c) => {
  try {
    const ticketId = c.req.param('id');
    const body = await c.req.json();

    // TODO: Adicionar verificação de admin

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    
    // Se resolver, adicionar data de resolução
    if (body.status === 'resolved' || body.status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      return c.json({ error: 'Failed to update ticket', details: error.message }, 500);
    }

    console.log('✅ Ticket updated:', ticketId);
    return c.json({ ticket });
  } catch (error) {
    console.error('Error in update ticket:', error);
    return c.json({ error: 'Failed to update ticket', details: String(error) }, 500);
  }
});

// Add satisfaction rating (user)
ticketRoutes.post('/:id/rating', requireAuthUser, async (c) => {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();

    const { rating, comment } = body;

    // Validação
    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    // Verificar se o ticket pertence ao usuário
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (ticket.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Atualizar rating
    const { data: updatedTicket, error } = await supabase
      .from('tickets')
      .update({
        satisfaction_rating: rating,
        satisfaction_comment: comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error adding rating:', error);
      return c.json({ error: 'Failed to add rating', details: error.message }, 500);
    }

    console.log('✅ Rating added to ticket:', ticketId);
    return c.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Error in add rating:', error);
    return c.json({ error: 'Failed to add rating', details: String(error) }, 500);
  }
});

// ============ TICKET MESSAGES ROUTES ============

// Get ticket messages
ticketRoutes.get('/:id/messages', requireAuthUser, async (c) => {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user');

    // Verificar se o usuário tem permissão
    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    // TODO: Adicionar verificação de admin
    if (!ticket || ticket.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data: messages, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return c.json({ error: 'Failed to fetch messages', details: error.message }, 500);
    }

    return c.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error in get messages:', error);
    return c.json({ error: 'Failed to fetch messages', details: String(error) }, 500);
  }
});

// Add message to ticket
ticketRoutes.post('/:id/messages', requireAuthUser, async (c) => {
  try {
    const ticketId = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();

    const { message, attachments } = body;

    if (!message || message.trim().length === 0) {
      return c.json({ error: 'Message cannot be empty' }, 400);
    }

    // Verificar se o usuário tem permissão
    const { data: ticket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    // TODO: Adicionar verificação de admin para is_admin
    if (!ticket || ticket.user_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const messageData = {
      ticket_id: ticketId,
      user_id: user.id,
      message: message.trim(),
      is_admin: false, // TODO: Verificar se é admin
      attachments: attachments || [],
      created_at: new Date().toISOString(),
    };

    const { data: newMessage, error } = await supabase
      .from('ticket_messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return c.json({ error: 'Failed to create message', details: error.message }, 500);
    }

    // Atualizar ticket updated_at e status se necessário
    await supabase
      .from('tickets')
      .update({
        updated_at: new Date().toISOString(),
        status: ticket.user_id === user.id ? 'waiting_customer' : 'in_progress',
      })
      .eq('id', ticketId);

    console.log('✅ Message added to ticket:', ticketId);
    return c.json({ message: newMessage }, 201);
  } catch (error) {
    console.error('Error in add message:', error);
    return c.json({ error: 'Failed to add message', details: String(error) }, 500);
  }
});

// Get ticket statistics (admin)
ticketRoutes.get('/stats/overview', async (c) => {
  try {
    // TODO: Adicionar verificação de admin

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('status, priority, satisfaction_rating, created_at, resolved_at');

    if (error) {
      console.error('Error fetching ticket stats:', error);
      return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
    }

    const stats = {
      total: tickets.length,
      by_status: {
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        waiting_customer: tickets.filter(t => t.status === 'waiting_customer').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
      },
      by_priority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      },
      average_rating: tickets
        .filter(t => t.satisfaction_rating)
        .reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0) / 
        tickets.filter(t => t.satisfaction_rating).length || 0,
      average_resolution_time: calculateAverageResolutionTime(tickets),
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Error in get stats:', error);
    return c.json({ error: 'Failed to fetch stats', details: String(error) }, 500);
  }
});

// Helper function
function calculateAverageResolutionTime(tickets: any[]) {
  const resolved = tickets.filter(t => t.resolved_at);
  if (resolved.length === 0) return 0;

  const totalTime = resolved.reduce((sum, ticket) => {
    const created = new Date(ticket.created_at).getTime();
    const resolved = new Date(ticket.resolved_at).getTime();
    return sum + (resolved - created);
  }, 0);

  // Retorna em horas
  return Math.round((totalTime / resolved.length) / (1000 * 60 * 60));
}
