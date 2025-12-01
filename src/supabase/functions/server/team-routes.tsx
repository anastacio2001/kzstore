import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const teamRoutes = new Hono();

// Get all team members
teamRoutes.get('/', async (c) => {
  try {
    const members = await kv.getByPrefix('team_member:');
    
    // Sort by creation date (newest first)
    const sortedMembers = members.sort((a, b) => 
      new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
    
    return c.json({ members: sortedMembers });
  } catch (error) {
    console.log('Error fetching team members:', error);
    return c.json({ error: 'Failed to fetch team members', details: String(error) }, 500);
  }
});

// Get team member by ID
teamRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const member = await kv.get(`team_member:${id}`);
    
    if (!member) {
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    return c.json({ member });
  } catch (error) {
    console.log('Error fetching team member:', error);
    return c.json({ error: 'Failed to fetch team member', details: String(error) }, 500);
  }
});

// Create new team member
teamRoutes.post('/', async (c) => {
  try {
    const memberData = await c.req.json();
    
    // Basic validation
    if (!memberData.nome || !memberData.email || !memberData.role) {
      return c.json({ error: 'Missing required fields: nome, email, role' }, 400);
    }
    
    // Check if email already exists
    const existingMembers = await kv.getByPrefix('team_member:');
    const emailExists = existingMembers.some(m => m.email === memberData.email);
    
    if (emailExists) {
      return c.json({ error: 'Email already exists' }, 400);
    }
    
    // Default permissions based on role
    const defaultPermissions = {
      super_admin: {
        criar_anuncios: true,
        editar_anuncios: true,
        deletar_anuncios: true,
        gerir_equipe: true,
        gerir_produtos: true,
        editar_produtos: true,
        deletar_produtos: true,
        gerir_pedidos: true,
        ver_analytics: true,
        gerir_configuracoes: true,
      },
      admin: {
        criar_anuncios: true,
        editar_anuncios: true,
        deletar_anuncios: true,
        gerir_equipe: false,
        gerir_produtos: true,
        editar_produtos: true,
        deletar_produtos: true,
        gerir_pedidos: true,
        ver_analytics: true,
        gerir_configuracoes: false,
      },
      editor: {
        criar_anuncios: true,
        editar_anuncios: true,
        deletar_anuncios: false,
        gerir_equipe: false,
        gerir_produtos: false,
        editar_produtos: true,
        deletar_produtos: false,
        gerir_pedidos: false,
        ver_analytics: false,
        gerir_configuracoes: false,
      },
      viewer: {
        criar_anuncios: false,
        editar_anuncios: false,
        deletar_anuncios: false,
        gerir_equipe: false,
        gerir_produtos: false,
        editar_produtos: false,
        deletar_produtos: false,
        gerir_pedidos: false,
        ver_analytics: false,
        gerir_configuracoes: false,
      },
    };
    
    const member = {
      id: `team_${Date.now()}`,
      nome: memberData.nome,
      email: memberData.email,
      role: memberData.role,
      permissoes: memberData.permissoes || defaultPermissions[memberData.role as keyof typeof defaultPermissions],
      ativo: memberData.ativo !== undefined ? memberData.ativo : true,
      avatar_url: memberData.avatar_url || '',
      ultimo_acesso: null,
      criado_em: new Date().toISOString(),
      criado_por: memberData.criado_por || 'admin'
    };
    
    await kv.set(`team_member:${member.id}`, member);
    
    return c.json({ member, message: 'Team member created successfully' }, 201);
  } catch (error) {
    console.log('Error creating team member:', error);
    return c.json({ error: 'Failed to create team member', details: String(error) }, 500);
  }
});

// Update team member
teamRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingMember = await kv.get(`team_member:${id}`);
    if (!existingMember) {
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    // If email is being updated, check for duplicates
    if (updates.email && updates.email !== existingMember.email) {
      const existingMembers = await kv.getByPrefix('team_member:');
      const emailExists = existingMembers.some(m => m.email === updates.email && m.id !== id);
      
      if (emailExists) {
        return c.json({ error: 'Email already exists' }, 400);
      }
    }
    
    const updatedMember = {
      ...existingMember,
      ...updates,
      id: existingMember.id, // Preserve ID
      criado_em: existingMember.criado_em, // Preserve creation date
      criado_por: existingMember.criado_por, // Preserve creator
    };
    
    await kv.set(`team_member:${id}`, updatedMember);
    
    return c.json({ member: updatedMember, message: 'Team member updated successfully' });
  } catch (error) {
    console.log('Error updating team member:', error);
    return c.json({ error: 'Failed to update team member', details: String(error) }, 500);
  }
});

// Delete team member
teamRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const existingMember = await kv.get(`team_member:${id}`);
    if (!existingMember) {
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    // Prevent deleting the last super_admin
    if (existingMember.role === 'super_admin') {
      const allMembers = await kv.getByPrefix('team_member:');
      const superAdmins = allMembers.filter(m => m.role === 'super_admin' && m.ativo);
      
      if (superAdmins.length <= 1) {
        return c.json({ error: 'Cannot delete the last active super admin' }, 400);
      }
    }
    
    await kv.del(`team_member:${id}`);
    
    return c.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.log('Error deleting team member:', error);
    return c.json({ error: 'Failed to delete team member', details: String(error) }, 500);
  }
});

// Update last access timestamp
teamRoutes.post('/:id/access', async (c) => {
  try {
    const id = c.req.param('id');
    
    const member = await kv.get(`team_member:${id}`);
    if (!member) {
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    member.ultimo_acesso = new Date().toISOString();
    await kv.set(`team_member:${id}`, member);
    
    return c.json({ message: 'Access timestamp updated' });
  } catch (error) {
    console.log('Error updating access timestamp:', error);
    return c.json({ error: 'Failed to update access timestamp', details: String(error) }, 500);
  }
});

// Get team statistics
teamRoutes.get('/stats/overview', async (c) => {
  try {
    const members = await kv.getByPrefix('team_member:');
    
    const stats = {
      total_members: members.length,
      active_members: members.filter(m => m.ativo).length,
      by_role: {
        super_admin: members.filter(m => m.role === 'super_admin').length,
        admin: members.filter(m => m.role === 'admin').length,
        editor: members.filter(m => m.role === 'editor').length,
        viewer: members.filter(m => m.role === 'viewer').length,
      }
    };
    
    return c.json({ stats });
  } catch (error) {
    console.log('Error fetching team stats:', error);
    return c.json({ error: 'Failed to fetch team stats', details: String(error) }, 500);
  }
});

export { teamRoutes };
