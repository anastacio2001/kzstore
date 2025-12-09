/**
 * Hook para gerenciar analytics usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/kv';

export type AnalyticsEvent = {
  id: string;
  eventName: string;
  eventParams?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
};

export type AnalyticsSummary = {
  totalEvents: number;
  totalUsers: number;
  totalSessions: number;
  topEvents: Array<{ name: string; count: number }>;
  period: string;
  generatedAt: string;
};

const ANALYTICS_PREFIX = 'analytics:event:';
const ANALYTICS_SUMMARY_KEY = 'analytics:summary';

export function useAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackEvent = useCallback(async (
    eventName: string,
    eventParams?: Record<string, any>,
    userId?: string
  ): Promise<boolean> => {
    try {
      const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = sessionStorage.getItem('analytics_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('analytics_session_id')) {
        sessionStorage.setItem('analytics_session_id', sessionId);
      }

      const event: AnalyticsEvent = {
        id,
        eventName,
        eventParams,
        userId,
        sessionId,
        timestamp: new Date().toISOString()
      };

      await kvSet(`${ANALYTICS_PREFIX}${id}`, event);
      return true;
    } catch (err) {
      console.error('[useAnalytics] Error tracking event:', err);
      return false;
    }
  }, []);

  const fetchEvents = useCallback(async (days: number = 7): Promise<AnalyticsEvent[]> => {
    setLoading(true);
    setError(null);
    try {
      const eventsData = await kvGetByPrefix<AnalyticsEvent>(ANALYTICS_PREFIX);
      
      // Filtrar por período
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const eventsArray = eventsData
        .map(item => item.value)
        .filter(event => new Date(event.timestamp) >= cutoffDate)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setEvents(eventsArray);
      return eventsArray;
    } catch (err) {
      console.error('[useAnalytics] Error fetching events:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async (days: number = 7): Promise<AnalyticsSummary | null> => {
    setLoading(true);
    setError(null);
    try {
      const eventsArray = await fetchEvents(days);

      // Calcular estatísticas
      const uniqueUsers = new Set(eventsArray.filter(e => e.userId).map(e => e.userId)).size;
      const uniqueSessions = new Set(eventsArray.map(e => e.sessionId)).size;

      // Contar eventos por nome
      const eventCounts: Record<string, number> = {};
      eventsArray.forEach(event => {
        eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const summary: AnalyticsSummary = {
        totalEvents: eventsArray.length,
        totalUsers: uniqueUsers,
        totalSessions: uniqueSessions,
        topEvents,
        period: `${days} days`,
        generatedAt: new Date().toISOString()
      };

      // Salvar summary para cache
      await kvSet(ANALYTICS_SUMMARY_KEY, summary);

      return summary;
    } catch (err) {
      console.error('[useAnalytics] Error getting summary:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const getEventsByName = useCallback(async (eventName: string, days: number = 7): Promise<AnalyticsEvent[]> => {
    try {
      const eventsArray = await fetchEvents(days);
      return eventsArray.filter(e => e.eventName === eventName);
    } catch (err) {
      console.error('[useAnalytics] Error getting events by name:', err);
      return [];
    }
  }, [fetchEvents]);

  const getEventsByUser = useCallback(async (userId: string, days: number = 7): Promise<AnalyticsEvent[]> => {
    try {
      const eventsArray = await fetchEvents(days);
      return eventsArray.filter(e => e.userId === userId);
    } catch (err) {
      console.error('[useAnalytics] Error getting events by user:', err);
      return [];
    }
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    trackEvent,
    fetchEvents,
    getSummary,
    getEventsByName,
    getEventsByUser
  };
}
