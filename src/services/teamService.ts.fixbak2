/**
 * Team Service - Sistema de Gestão de Equipe
 * @author KZSTORE
 * @description Gerenciamento de membros da equipe e permissões via API
 */

const API_BASE = '/api';

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
    
    const response = await fetch(`${API_BASE}/team`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('❌ [TEAM] Error fetching team members:', error);
    throw error;
  }
}

/**
 * Buscar membros ativos
 */
export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    
    const allMembers = await getAllTeamMembers();
    const activeMembers = allMembers.filter(member => member.active);
    
    return activeMembers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('❌ [TEAM] Error fetching active members:', error);
    throw error;
  }
}

/**
 * Buscar membro por ID
 */
export async function getTeamMemberById(memberId: string): Promise<TeamMember | null> {
  try {
    
    const response = await fetch(`${API_BASE}/team/${memberId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [TEAM] Error fetching member:', error);
    return null;
  }
}

/**
 * Buscar membro por email
 */
export async function getTeamMemberByEmail(email: string): Promise<TeamMember | null> {
  try {
    
    const response = await fetch(`${API_BASE}/team/email/${encodeURIComponent(email)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [TEAM] Error fetching member by email:', error);
    return null;
  }
}

/**
 * Criar membro da equipe
 */
export async function createTeamMember(
  memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  try {
    
    // Definir permissões baseadas no role se não fornecidas
    const permissions = memberData.permissions?.length > 0 
      ? memberData.permissions 
      : ROLE_PERMISSIONS[memberData.role] || [];
    
    const response = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...memberData,
        permissions,
        active: memberData.active !== false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [TEAM] Error creating member:', error);
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
    
    const response = await fetch(`${API_BASE}/team/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [TEAM] Error updating member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Deletar membro da equipe
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    
    const response = await fetch(`${API_BASE}/team/${memberId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error(`❌ [TEAM] Error deleting member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Desativar membro da equipe
 */
export async function deactivateTeamMember(memberId: string): Promise<TeamMember> {
  try {
    
    const updatedMember = await updateTeamMember(memberId, { active: false });
    
    return updatedMember;
  } catch (error) {
    console.error(`❌ [TEAM] Error deactivating member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Reativar membro da equipe
 */
export async function reactivateTeamMember(memberId: string): Promise<TeamMember> {
  try {
    
    const updatedMember = await updateTeamMember(memberId, { active: true });
    
    return updatedMember;
  } catch (error) {
    console.error(`❌ [TEAM] Error reactivating member ${memberId}:`, error);
    throw error;
  }
}

/**
 * Atualizar último login
 */
export async function updateLastLogin(memberId: string): Promise<void> {
  try {
    
    const response = await fetch(`${API_BASE}/team/${memberId}/last-login`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error(`❌ [TEAM] Error updating last login for ${memberId}:`, error);
    throw error;
  }
}

/**
 * Buscar membros por role
 */
export async function getTeamMembersByRole(role: TeamMember['role']): Promise<TeamMember[]> {
  try {
    
    const allMembers = await getAllTeamMembers();
    const filteredMembers = allMembers.filter(member => member.role === role && member.active);
    
    return filteredMembers;
  } catch (error) {
    console.error(`❌ [TEAM] Error fetching members by role ${role}:`, error);
    throw error;
  }
}

/**
 * Buscar membros por departamento
 */
export async function getTeamMembersByDepartment(department: string): Promise<TeamMember[]> {
  try {
    
    const allMembers = await getAllTeamMembers();
    const filteredMembers = allMembers.filter(
      member => member.department === department && member.active
    );
    
    return filteredMembers;
  } catch (error) {
    console.error(`❌ [TEAM] Error fetching members by department ${department}:`, error);
    throw error;
  }
}

/**
 * Obter estatísticas da equipe
 */
export async function getTeamStats(): Promise<TeamStats> {
  try {
    
    const allMembers = await getAllTeamMembers();
    
    const stats: TeamStats = {
      total_members: allMembers.length,
      active_members: allMembers.filter(m => m.active).length,
      inactive_members: allMembers.filter(m => !m.active).length,
      by_role: {},
      by_department: {},
    };
    
    // Contar por role
    allMembers.forEach(member => {
      if (member.active) {
        stats.by_role[member.role] = (stats.by_role[member.role] || 0) + 1;
        stats.by_department[member.department] = (stats.by_department[member.department] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ [TEAM] Error calculating stats:', error);
    throw error;
  }
}

/**
 * Atualizar permissões do membro
 */
export async function updateMemberPermissions(
  memberId: string,
  permissions: string[]
): Promise<TeamMember> {
  try {
    
    // Validar permissões
    const validPermissions = permissions.filter(p => AVAILABLE_PERMISSIONS.includes(p));
    
    if (validPermissions.length !== permissions.length) {
    }
    
    const updatedMember = await updateTeamMember(memberId, {
      permissions: validPermissions,
    });
    
    return updatedMember;
  } catch (error) {
    console.error(`❌ [TEAM] Error updating permissions for ${memberId}:`, error);
    throw error;
  }
}
