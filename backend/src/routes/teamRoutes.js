import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 📋 LISTAR MEMBROS DA EQUIPE
// ============================================
router.get('/team-members', async (req, res) => {
  try {
    const { role, is_active, department } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (department) where.department = department;

    const members = await prisma.teamMember.findMany({
      where,
      orderBy: { invited_at: 'desc' }
    });

    res.json(members);
  } catch (error) {
    console.error('❌ Erro ao listar membros:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 👤 OBTER MEMBRO POR ID
// ============================================
router.get('/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    res.json(member);
  } catch (error) {
    console.error('❌ Erro ao obter membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ➕ CRIAR/CONVIDAR NOVO MEMBRO
// ============================================
router.post('/team-members', async (req, res) => {
  try {
    const {
      email,
      name,
      role,
      permissions,
      department,
      phone,
      invited_by
    } = req.body;

    // Validações básicas
    if (!email || !name || !role || !invited_by) {
      return res.status(400).json({ 
        error: 'Email, nome, cargo e convidado por são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { email }
    });

    if (existingMember) {
      return res.status(400).json({ 
        error: 'Este email já está registrado' 
      });
    }

    // Criar novo membro
    const newMember = await prisma.teamMember.create({
      data: {
        email,
        name,
        role,
        permissions: permissions || {},
        department,
        phone,
        invited_by
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        user_id: invited_by,
        user_name: 'Admin',
        user_role: 'admin',
        action_type: 'create',
        entity_type: 'team_member',
        entity_id: newMember.id,
        description: `Convidou ${name} (${email}) como ${role}`,
        metadata: { member: newMember }
      }
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error('❌ Erro ao criar membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ✏️ ATUALIZAR MEMBRO
// ============================================
router.put('/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      role,
      permissions,
      is_active,
      department,
      phone,
      avatar_url,
      updated_by
    } = req.body;

    // Verificar se membro existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    // Atualizar membro
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(permissions && { permissions }),
        ...(is_active !== undefined && { is_active }),
        ...(department && { department }),
        ...(phone && { phone }),
        ...(avatar_url && { avatar_url })
      }
    });

    // Log da atividade
    if (updated_by) {
      await prisma.activityLog.create({
        data: {
          user_id: updated_by,
          user_name: 'Admin',
          user_role: 'admin',
          action_type: 'update',
          entity_type: 'team_member',
          entity_id: id,
          description: `Atualizou informações de ${updatedMember.name}`,
          metadata: { 
            before: existingMember,
            after: updatedMember 
          }
        }
      });
    }

    res.json(updatedMember);
  } catch (error) {
    console.error('❌ Erro ao atualizar membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 🗑️ REMOVER MEMBRO
// ============================================
router.delete('/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deleted_by } = req.body;

    // Verificar se membro existe
    const member = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    // Desativar ao invés de deletar
    const deactivatedMember = await prisma.teamMember.update({
      where: { id },
      data: { is_active: false }
    });

    // Log da atividade
    if (deleted_by) {
      await prisma.activityLog.create({
        data: {
          user_id: deleted_by,
          user_name: 'Admin',
          user_role: 'admin',
          action_type: 'delete',
          entity_type: 'team_member',
          entity_id: id,
          description: `Desativou membro ${member.name}`,
          metadata: { member }
        }
      });
    }

    res.json({ 
      message: 'Membro desativado com sucesso',
      member: deactivatedMember 
    });
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📧 REENVIAR CONVITE
// ============================================
router.post('/team-members/:id/resend-invite', async (req, res) => {
  try {
    const { id } = req.params;
    const { resent_by } = req.body;

    const member = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    // Log da atividade
    if (resent_by) {
      await prisma.activityLog.create({
        data: {
          user_id: resent_by,
          user_name: 'Admin',
          user_role: 'admin',
          action_type: 'resend_invite',
          entity_type: 'team_member',
          entity_id: id,
          description: `Reenviou convite para ${member.name}`,
          metadata: { member }
        }
      });
    }

    res.json({ 
      message: 'Convite reenviado com sucesso',
      member 
    });
  } catch (error) {
    console.error('❌ Erro ao reenviar convite:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📊 ESTATÍSTICAS DA EQUIPE
// ============================================
router.get('/team-members/stats/overview', async (req, res) => {
  try {
    const totalMembers = await prisma.teamMember.count();
    const activeMembers = await prisma.teamMember.count({
      where: { is_active: true }
    });
    const pendingInvites = await prisma.teamMember.count({
      where: { 
        is_active: true,
        accepted_at: null 
      }
    });

    const membersByRole = await prisma.teamMember.groupBy({
      by: ['role'],
      _count: { role: true },
      where: { is_active: true }
    });

    const membersByDepartment = await prisma.teamMember.groupBy({
      by: ['department'],
      _count: { department: true },
      where: { 
        is_active: true,
        department: { not: null }
      }
    });

    res.json({
      total: totalMembers,
      active: activeMembers,
      inactive: totalMembers - activeMembers,
      pending_invites: pendingInvites,
      by_role: membersByRole,
      by_department: membersByDepartment
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
