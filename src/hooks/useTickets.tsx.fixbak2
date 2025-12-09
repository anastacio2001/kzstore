/**
 * Hook para gerenciar tickets de suporte usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/kv';

export type TicketResponse = {
  id: string;
  message: string;
  author: string;
  authorRole: 'customer' | 'support';
  createdAt: string;
};

export type Ticket = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'technical' | 'order' | 'payment' | 'product' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting-customer' | 'resolved' | 'closed';
  description: string;
  responses: TicketResponse[];
  createdAt: string;
  updatedAt?: string;
};

const TICKETS_PREFIX = 'ticket:';
const TICKETS_LIST_KEY = 'tickets:list';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (): Promise<Ticket[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎫 [useTickets] Fetching tickets with prefix:', TICKETS_PREFIX);
      const ticketsData = await kvGetByPrefix<any>(TICKETS_PREFIX);
      console.log('🎫 [useTickets] Raw data from KV:', ticketsData);
      console.log('🎫 [useTickets] Data count:', ticketsData.length);
      
      if (ticketsData.length > 0) {
        console.log('🎫 [useTickets] First raw item:', ticketsData[0]);
      }
      
      // 🔥 NORMALIZAR: Converter snake_case → camelCase se necessário
      const ticketsArray = ticketsData
        .map(item => {
          const t = item.value;
          console.log('🎫 [useTickets] Processing ticket:', t);
          
          // Se já está em camelCase, retornar como está
          if (t.userId !== undefined) {
            return t as Ticket;
          }
          
          // Se está em snake_case, converter
          return {
            id: t.id,
            userId: t.user_id || t.userId,
            userEmail: t.user_email || t.userEmail,
            userName: t.user_name || t.userName,
            subject: t.subject,
            category: t.category,
            priority: t.priority,
            status: t.status,
            description: t.description,
            responses: (t.responses || []).map((r: any) => ({
              id: r.id,
              message: r.message,
              author: r.author || r.user_name,
              authorRole: r.authorRole || r.author_role || (r.is_admin ? 'support' : 'customer'),
              createdAt: r.createdAt || r.created_at
            })),
            createdAt: t.createdAt || t.created_at,
            updatedAt: t.updatedAt || t.updated_at
          } as Ticket;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`🎫 [useTickets] Loaded ${ticketsArray.length} tickets`);
      if (ticketsArray.length > 0) {
        console.log('🎫 [useTickets] Sample ticket:', ticketsArray[0]);
      }
      
      setTickets(ticketsArray);
      return ticketsArray;
    } catch (err) {
      console.error('[useTickets] Error fetching tickets:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'responses'>): Promise<Ticket | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTicket: Ticket = {
        ...ticketData,
        id,
        status: 'open',
        responses: [],
        createdAt: new Date().toISOString()
      };

      await kvSet(`${TICKETS_PREFIX}${id}`, newTicket);

      const ticketIds = await kvGet<string[]>(TICKETS_LIST_KEY) || [];
      ticketIds.push(id);
      await kvSet(TICKETS_LIST_KEY, ticketIds);

      await fetchTickets();
      return newTicket;
    } catch (err) {
      console.error('[useTickets] Error creating ticket:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  const addResponse = useCallback(async (
    ticketId: string,
    message: string,
    author: string,
    authorRole: 'customer' | 'support'
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await kvGet<Ticket>(`${TICKETS_PREFIX}${ticketId}`);
      if (!ticket) throw new Error('Ticket not found');

      const response: TicketResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message,
        author,
        authorRole,
        createdAt: new Date().toISOString()
      };

      const updated: Ticket = {
        ...ticket,
        responses: [...ticket.responses, response],
        status: authorRole === 'support' ? 'waiting-customer' : 'in-progress',
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${TICKETS_PREFIX}${ticketId}`, updated);

      await fetchTickets();
      return true;
    } catch (err) {
      console.error('[useTickets] Error adding response:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  const updateTicketStatus = useCallback(async (id: string, status: Ticket['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await kvGet<Ticket>(`${TICKETS_PREFIX}${id}`);
      if (!ticket) throw new Error('Ticket not found');

      const updated: Ticket = {
        ...ticket,
        status,
        updatedAt: new Date().toISOString()
      };
      await kvSet(`${TICKETS_PREFIX}${id}`, updated);

      await fetchTickets();
      return true;
    } catch (err) {
      console.error('[useTickets] Error updating status:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  const getTicketsByUser = useCallback(async (userId: string): Promise<Ticket[]> => {
    try {
      const allTickets = await fetchTickets();
      return allTickets.filter(t => t.userId === userId);
    } catch (err) {
      console.error('[useTickets] Error getting user tickets:', err);
      return [];
    }
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    addResponse,
    updateTicketStatus,
    getTicketsByUser
  };
}