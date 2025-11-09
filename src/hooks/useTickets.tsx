import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Email notification helper
const sendTicketEmail = async (emailData: {
  type: 'new_ticket' | 'admin_response' | 'status_change';
  ticketId: string;
  recipientEmail: string;
  recipientName?: string;
  data?: {
    subject?: string;
    message?: string;
    status?: string;
  };
}) => {
  try {
    console.log('📧 Sending email notification:', emailData.type);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('No session for email notification');
      return;
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/send-ticket-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
        },
        body: JSON.stringify(emailData),
      }
    );

    if (response.ok) {
      console.log('✅ Email sent successfully');
    } else {
      const error = await response.text();
      console.error('❌ Failed to send email:', error);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Não bloquear a operação principal se o email falhar
  }
};

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'product' | 'shipping' | 'returns' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  satisfaction_rating?: number;
  satisfaction_comment?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  attachments?: string[];
}

interface CreateTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
}

interface AddMessageData {
  message: string;
  attachments?: string[];
  is_admin?: boolean;
}

interface AddRatingData {
  rating: number;
  comment?: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar REST API do Supabase diretamente em vez da Edge Function
  const baseUrl = `https://${projectId}.supabase.co/rest/v1`;

  // Carregar tickets do usuário
  const loadMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pegar sessão do usuário
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🎫 LoadMyTickets - Session:', session ? 'Present' : 'Missing');
      console.log('🎫 LoadMyTickets - User:', session?.user?.email);
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const url = `${baseUrl}/tickets?order=created_at.desc`;
      console.log('🎫 LoadMyTickets - URL:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
        },
      });

      console.log('🎫 LoadMyTickets - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎫 LoadMyTickets - Error response:', errorText);
        throw new Error(`Failed to load tickets: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎫 LoadMyTickets - Data:', data);
      setTickets(data || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo ticket
  const createTicket = async (ticketData: CreateTicketData): Promise<Ticket | null> => {
    try {
      setLoading(true);
      setError(null);

      // Pegar sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🎫 CreateTicket - Session:', session ? 'Present' : 'Missing');
      
      if (!session || !session.access_token) {
        console.error('🎫 CreateTicket - NO SESSION OR TOKEN!');
        throw new Error('User not authenticated - please login again');
      }

      const url = `${baseUrl}/tickets`;
      console.log('🎫 CreateTicket - URL:', url);

      const ticketPayload = {
        user_id: session.user.id,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        status: 'open',
      };

      console.log('🎫 CreateTicket - Payload:', ticketPayload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(ticketPayload),
      });

      console.log('🎫 CreateTicket - Response status:', response.status);

      const responseText = await response.text();
      console.log('🎫 CreateTicket - Response text:', responseText);

      if (!response.ok) {
        let errorMsg = 'Failed to create ticket';
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `${errorMsg}: ${responseText.substring(0, 200)}`;
        }
        throw new Error(errorMsg);
      }

      const data = JSON.parse(responseText);
      const ticket = Array.isArray(data) ? data[0] : data;
      console.log('🎫 CreateTicket - Success data:', ticket);
      
      // Adicionar ticket à lista
      setTickets((prev: Ticket[]) => [ticket, ...prev]);
      
      // Enviar email de notificação para admins (não bloqueia o fluxo)
      sendTicketEmail({
        type: 'new_ticket',
        ticketId: ticket.id,
        recipientEmail: 'l.anastacio801@gmail.com', // Email do admin (conta Resend)
        data: {
          subject: ticket.subject,
        },
      }).catch(err => console.error('Email notification failed:', err));
      
      return data.ticket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens de um ticket
  const loadMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('💬 LoadMessages - TicketId:', ticketId);
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Usar Supabase SDK direto
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('💬 LoadMessages - Error:', error);
        throw error;
      }

      console.log('💬 LoadMessages - Data:', data);
      console.log('💬 LoadMessages - First message attachments:', data?.[0]?.attachments);
      
      return data || [];
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      return [];
    }
  };  // Adicionar mensagem a um ticket
  const addMessage = async (ticketId: string, messageData: AddMessageData): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('💬 AddMessage - Session:', session ? 'Present' : 'Missing');
      console.log('💬 AddMessage - TicketId:', ticketId);
      console.log('💬 AddMessage - Data:', messageData);
      console.log('💬 AddMessage - Attachments:', messageData.attachments);
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Usar Supabase SDK direto em vez de REST API
      const messagePayload = {
        ticket_id: ticketId,
        user_id: session.user.id,
        message: messageData.message,
        is_admin: messageData.is_admin || false,
        attachments: messageData.attachments && messageData.attachments.length > 0 
          ? messageData.attachments 
          : null,
      };

      console.log('💬 AddMessage - Payload:', messagePayload);

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert(messagePayload)
        .select();

      if (error) {
        console.error('💬 AddMessage - Error:', error);
        throw error;
      }

      console.log('💬 AddMessage - Success:', data);

      // Se a mensagem for de um admin, enviar email para o usuário
      if (messageData.is_admin) {
        // Buscar informações do ticket e do usuário
        const { data: ticket } = await supabase
          .from('tickets')
          .select('*, user_id')
          .eq('id', ticketId)
          .single();

        if (ticket) {
          const { data: { user } } = await supabase.auth.admin.getUserById(ticket.user_id);
          
          if (user?.email) {
            sendTicketEmail({
              type: 'admin_response',
              ticketId: ticketId,
              recipientEmail: user.email,
              recipientName: user.email.split('@')[0],
              data: {
                message: messageData.message,
              },
            }).catch(err => console.error('Email notification failed:', err));
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Error adding message:', err);
      setError(err instanceof Error ? err.message : 'Failed to add message');
      return false;
    }
  };

  // Adicionar avaliação de satisfação
  const addRating = async (ticketId: string, ratingData: AddRatingData): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/${ticketId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add rating');
      }

      // Atualizar ticket na lista
      setTickets((prev: Ticket[]) => 
        prev.map((t: Ticket) => 
          t.id === ticketId 
            ? { ...t, satisfaction_rating: ratingData.rating, satisfaction_comment: ratingData.comment }
            : t
        )
      );

      return true;
    } catch (err) {
      console.error('Error adding rating:', err);
      setError(err instanceof Error ? err.message : 'Failed to add rating');
      return false;
    }
  };

  // Carregar ticket específico
  const loadTicket = async (ticketId: string): Promise<Ticket | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${baseUrl}/${ticketId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load ticket');
      }

      const data = await response.json();
      return data.ticket;
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
      return null;
    }
  };

  // Carregar TODOS os tickets (apenas para admin)
  const loadAllTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      console.log('🎫 LoadAllTickets - Session present');

      const url = `${baseUrl}/tickets?order=created_at.desc`;
      console.log('🎫 LoadAllTickets - URL:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
        },
      });

      console.log('🎫 LoadAllTickets - Response status:', response.status);

      const data = await response.json();
      console.log('🎫 LoadAllTickets - Data:', data);

      if (!response.ok) {
        throw new Error('Failed to load tickets');
      }

      setTickets(data || []);
    } catch (err) {
      console.error('Error loading all tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do ticket
  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      console.log('🎫 UpdateTicketStatus - TicketId:', ticketId, 'NewStatus:', newStatus);

      const url = `${baseUrl}/tickets?id=eq.${ticketId}`;
      console.log('🎫 UpdateTicketStatus - URL:', url);

      const payload = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() })
      };

      console.log('🎫 UpdateTicketStatus - Payload:', payload);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      });

      console.log('🎫 UpdateTicketStatus - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎫 UpdateTicketStatus - Error:', errorText);
        throw new Error('Failed to update ticket status');
      }

      const data = await response.json();
      console.log('🎫 UpdateTicketStatus - Success:', data);

      // Enviar email de notificação sobre mudança de status
      const ticket = Array.isArray(data) ? data[0] : data;
      if (ticket) {
        const { data: { user } } = await supabase.auth.admin.getUserById(ticket.user_id);
        
        if (user?.email) {
          sendTicketEmail({
            type: 'status_change',
            ticketId: ticketId,
            recipientEmail: user.email,
            recipientName: user.email.split('@')[0],
            data: {
              status: newStatus,
            },
          }).catch(err => console.error('Email notification failed:', err));
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      throw err;
    }
  };

  // Atribuir ticket a um atendente
  const assignTicket = async (ticketId: string, adminUserId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      console.log('🎫 AssignTicket - TicketId:', ticketId, 'AdminId:', adminUserId);

      const url = `${baseUrl}/tickets?id=eq.${ticketId}`;

      const payload = {
        assigned_to: adminUserId,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      });

      console.log('🎫 AssignTicket - Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to assign ticket');
      }

      const data = await response.json();
      console.log('🎫 AssignTicket - Success:', data);

      return data;
    } catch (err) {
      console.error('Error assigning ticket:', err);
      throw err;
    }
  };

  // Auto-carregar tickets ao montar o componente
  useEffect(() => {
    loadMyTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    loadMyTickets,
    loadAllTickets,
    createTicket,
    loadTicketMessages: loadMessages, // Alias para manter compatibilidade
    loadMessages, // Nome novo
    addMessage,
    addRating,
    loadTicket,
    updateTicketStatus,
    assignTicket,
  };
}
