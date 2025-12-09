/**
 * Team Service - Sistema de Gestão de Equipe
 * @author KZSTORE
 * @description Gerenciamento de membros da equipe e permissões
 */

import { getSupabaseClient } from '../utils/supabase/client';

const supabase = getSupabaseClient();

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'support' | 'sales' | 'warehouse';
  department: string;
  avatar?: string;
  bio?: string;
  permissions: string[];
  active: boolean;
  hire_date: string;
  salary?: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  by_role: Record<string, number>;
  by_department: Record<string, number>;
}

// Permissões disponíveis
export const AVAILABLE_PERMISSIONS = [
  'view_dashboard',
  'manage_products',
  'manage_orders',
  'manage_customers',
  'manage_coupons',
  'manage_team',
  'manage_settings',
  'view_analytics',
  'manage_reviews',
  'manage_ads',
  'manage_support_tickets',
  'manage_b2b',
  'manage_trade_ins',
];

// Permissões por role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: AVAILABLE_PERMISSIONS, // Todas as permissões
  manager: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_customers',
    'manage_coupons',
    'view_analytics',
    'manage_reviews',
    'manage_ads',
  ],
  support: [
    'view_dashboard',
    'manage_orders',
    'manage_customers',
    'manage_support_tickets',
    'manage_reviews',
  ],
  sales: [
    'view_dashboard',
    'manage_orders',
    'manage_customers',
    'manage_b2b',
    'view_analytics',
  ],
  warehouse: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_trade_ins',
  ],
};

/**
 * Buscar todos os membros da equipe
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar membros da equipe:', error);
    throw error;
  }
}

/**
 * Buscar membros ativos
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar membros ativos:', error);
    throw error;
  }
}

/**
 * Buscar membro por ID
 */
export async function getTeamMemberById(memberId: string): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar membro:', error);
    return null;
  }
}

/**
 * Buscar membro por email
 */
export async function getTeamMemberByEmail(email: string): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar membro por email:', error);
    return null;
  }
}

/**
 * Criar novo membro da equipe
 */
export async function createTeamMember(
  memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  try {
    // Verificar se email já existe
    const existing = await getTeamMemberByEmail(memberData.email);
    if (existing) {
      throw new Error('Email já cadastrado na equipe');
    }

    // Definir permissões baseado no role se não fornecidas
    const permissions = memberData.permissions.length > 0
      ? memberData.permissions
      : ROLE_PERMISSIONS[memberData.role] || [];

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        ...memberData,
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar membro da equipe:', error);
    throw error;
  }
}

/**
 * Atualizar membro da equipe
 */
export async function updateTeamMember(
  memberId: string,
  updates: Partial<TeamMember>
): Promise<TeamMember> {
  try {
    // Se role foi alterado, atualizar permissões automaticamente
    if (updates.role && !updates.permissions) {
      updates.permissions = ROLE_PERMISSIONS[updates.role] || [];
    }

    const { data, error } = await supabase
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar membro da equipe:', error);
    throw error;
  }
}

/**
 * Deletar membro da equipe
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Erro ao deletar membro da equipe:', error);
    throw error;
  }
}

/**
 * Desativar membro da equipe
 */
export async function deactivateTeamMember(memberId: string): Promise<TeamMember> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao desativar membro da equipe:', error);
    throw error;
  }
}

/**
 * Reativar membro da equipe
 */
export async function reactivateTeamMember(memberId: string): Promise<TeamMember> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao reativar membro da equipe:', error);
    throw error;
  }
}

/**
 * Atualizar último login
 */
export async function updateLastLogin(memberId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('team_members')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Erro ao atualizar último login:', error);
  }
}

/**
 * Verificar se membro tem permissão específica
 */
export function hasPermission(member: TeamMember, permission: string): boolean {
  return member.permissions.includes(permission) || member.role === 'admin';
}

/**
 * Buscar membros por role
 */
export async function getTeamMembersByRole(role: TeamMember['role']): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('role', role)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar membros com role ${role}:`, error);
    throw error;
  }
}

/**
 * Buscar membros por departamento
 */
export async function getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('department', department)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar membros do departamento ${department}:`, error);
    throw error;
  }
}

/**
 * Buscar estatísticas da equipe
 */
export async function getTeamStats(): Promise<TeamStats> {
  try {
    const members = await getAllTeamMembers();

    const stats: TeamStats = {
      total_members: members.length,
      active_members: members.filter((m) => m.active).length,
      inactive_members: members.filter((m) => !m.active).length,
      by_role: {},
      by_department: {},
    };

    // Contar por role
    members.forEach((member) => {
      stats.by_role[member.role] = (stats.by_role[member.role] || 0) + 1;
      stats.by_department[member.department] = (stats.by_department[member.department] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da equipe:', error);
    throw error;
  }
}

/**
 * Atualizar permissões de um membro
 */
export async function updateMemberPermissions(
  memberId: string,
  permissions: string[]
): Promise<TeamMember> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões:', error);
    throw error;
  }
}