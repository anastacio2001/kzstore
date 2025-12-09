/**
 * Hook para gerenciar equipe usando Supabase SDK
 */

import { useState, useCallback } from 'react';
import { kvGet, kvSet, kvGetByPrefix, kvDelete } from '../utils/supabase/kv';
import { TeamMember } from '../types/ads';

const TEAM_PREFIX = 'team:';
const TEAM_LIST_KEY = 'team:list';

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (): Promise<TeamMember[]> => {
    setLoading(true);
    setError(null);
    try {
      const membersData = await kvGetByPrefix<TeamMember>(TEAM_PREFIX);
      const membersArray = membersData.map(item => item.value);
      setMembers(membersArray);
      return membersArray;
    } catch (err) {
      console.error('[useTeam] Error fetching members:', err);
      setError(String(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (memberData: Omit<TeamMember, 'id' | 'criado_em'>): Promise<TeamMember | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMember: TeamMember = {
        ...memberData,
        id,
        criado_em: new Date().toISOString() // 🔥 CORRIGIDO: createdAt → criado_em
      };

      await kvSet(`${TEAM_PREFIX}${id}`, newMember);

      const memberIds = await kvGet<string[]>(TEAM_LIST_KEY) || [];
      memberIds.push(id);
      await kvSet(TEAM_LIST_KEY, memberIds);

      await fetchMembers();
      return newMember;
    } catch (err) {
      console.error('[useTeam] Error creating member:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    setLoading(true);
    setError(null);
    try {
      const current = await kvGet<TeamMember>(`${TEAM_PREFIX}${id}`);
      if (!current) throw new Error('Member not found');

      const updated: TeamMember = { ...current, ...updates, id };
      await kvSet(`${TEAM_PREFIX}${id}`, updated);

      await fetchMembers();
      return updated;
    } catch (err) {
      console.error('[useTeam] Error updating member:', err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await kvDelete(`${TEAM_PREFIX}${id}`);

      const memberIds = await kvGet<string[]>(TEAM_LIST_KEY) || [];
      const filtered = memberIds.filter(memberId => memberId !== id);
      await kvSet(TEAM_LIST_KEY, filtered);

      await fetchMembers();
      return true;
    } catch (err) {
      console.error('[useTeam] Error deleting member:', err);
      setError(String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const getStats = useCallback(async () => {
    try {
      const allMembers = await fetchMembers();
      return {
        totalMembers: allMembers.length,
        activeMembers: allMembers.filter(m => m.ativo).length, // 🔥 CORRIGIDO: isActive → ativo
        byRole: {
          super_admin: allMembers.filter(m => m.role === 'super_admin').length,
          admin: allMembers.filter(m => m.role === 'admin').length,
          editor: allMembers.filter(m => m.role === 'editor').length,
          viewer: allMembers.filter(m => m.role === 'viewer').length,
        }
      };
    } catch (err) {
      console.error('[useTeam] Error getting stats:', err);
      return null;
    }
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    getStats
  };
}