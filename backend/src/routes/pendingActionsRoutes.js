import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 📋 LISTAR AÇÕES PENDENTES
// ============================================
router.get('/pending-actions', async (req, res) => {
  try {
    const { status, action_type, entity_type, requested_by, priority } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (action_type) where.action_type = action_type;
    if (entity_type) where.entity_type = entity_type;
    if (requested_by) where.requested_by = requested_by;
    if (priority) where.priority = priority;

    const actions = await prisma.pendingAction.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { requested_at: 'desc' }
      ]
    });

    res.json(actions);
  } catch (error) {
    console.error('❌ Erro ao listar ações pendentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 👤 OBTER AÇÃO POR ID
// ============================================
router.get('/pending-actions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const action = await prisma.pendingAction.findUnique({
      where: { id }
    });

    if (!action) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    res.json(action);
  } catch (error) {
    console.error('❌ Erro ao obter ação:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ➕ CRIAR AÇÃO PENDENTE
// ============================================
router.post('/pending-actions', async (req, res) => {
  try {
    const {
      action_type,
      entity_type,
      entity_id,
      action_data,
      original_data,
      requested_by,
      requested_by_name,
      priority
    } = req.body;

    // Validações
    if (!action_type || !entity_type || !action_data || !requested_by || !requested_by_name) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: action_type, entity_type, action_data, requested_by, requested_by_name' 
      });
    }

    // Criar ação pendente
    const newAction = await prisma.pendingAction.create({
      data: {
        action_type,
        entity_type,
        entity_id,
        action_data,
        original_data,
        requested_by,
        requested_by_name,
        priority: priority || 'normal'
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        user_id: requested_by,
        user_name: requested_by_name,
        user_role: 'team_member',
        action_type: 'create_pending_action',
        entity_type: entity_type,
        entity_id: entity_id,
        description: `Solicitou aprovação para ${action_type} em ${entity_type}`,
        metadata: { action: newAction }
      }
    });

    res.status(201).json(newAction);
  } catch (error) {
    console.error('❌ Erro ao criar ação pendente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ✅ APROVAR AÇÃO
// ============================================
router.put('/pending-actions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewed_by, reviewed_by_name, review_notes } = req.body;

    if (!reviewed_by || !reviewed_by_name) {
      return res.status(400).json({ 
        error: 'reviewed_by e reviewed_by_name são obrigatórios' 
      });
    }

    // Obter ação
    const action = await prisma.pendingAction.findUnique({
      where: { id }
    });

    if (!action) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    if (action.status !== 'pending') {
      return res.status(400).json({ error: 'Esta ação já foi processada' });
    }

    // EXECUTAR A AÇÃO
    let executionResult = null;
    try {
      executionResult = await executeAction(action);
    } catch (execError) {
      console.error('❌ Erro ao executar ação:', execError);
      return res.status(500).json({ 
        error: 'Erro ao executar a ação aprovada',
        details: execError.message 
      });
    }

    // Atualizar status
    const approvedAction = await prisma.pendingAction.update({
      where: { id },
      data: {
        status: 'approved',
        reviewed_by,
        reviewed_by_name,
        reviewed_at: new Date(),
        review_notes
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        user_id: reviewed_by,
        user_name: reviewed_by_name,
        user_role: 'admin',
        action_type: 'approve',
        entity_type: action.entity_type,
        entity_id: action.entity_id,
        description: `Aprovou ${action.action_type} em ${action.entity_type}`,
        metadata: { 
          action: approvedAction,
          execution_result: executionResult 
        }
      }
    });

    res.json({ 
      action: approvedAction,
      execution_result: executionResult 
    });
  } catch (error) {
    console.error('❌ Erro ao aprovar ação:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ❌ REJEITAR AÇÃO
// ============================================
router.put('/pending-actions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewed_by, reviewed_by_name, review_notes } = req.body;

    if (!reviewed_by || !reviewed_by_name || !review_notes) {
      return res.status(400).json({ 
        error: 'reviewed_by, reviewed_by_name e review_notes são obrigatórios' 
      });
    }

    // Obter ação
    const action = await prisma.pendingAction.findUnique({
      where: { id }
    });

    if (!action) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    if (action.status !== 'pending') {
      return res.status(400).json({ error: 'Esta ação já foi processada' });
    }

    // Atualizar status
    const rejectedAction = await prisma.pendingAction.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewed_by,
        reviewed_by_name,
        reviewed_at: new Date(),
        review_notes
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        user_id: reviewed_by,
        user_name: reviewed_by_name,
        user_role: 'admin',
        action_type: 'reject',
        entity_type: action.entity_type,
        entity_id: action.entity_id,
        description: `Rejeitou ${action.action_type} em ${action.entity_type}`,
        metadata: { 
          action: rejectedAction,
          reason: review_notes 
        }
      }
    });

    res.json(rejectedAction);
  } catch (error) {
    console.error('❌ Erro ao rejeitar ação:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📊 ESTATÍSTICAS DE AÇÕES PENDENTES
// ============================================
router.get('/pending-actions/stats/overview', async (req, res) => {
  try {
    const totalPending = await prisma.pendingAction.count({
      where: { status: 'pending' }
    });
    
    const totalApproved = await prisma.pendingAction.count({
      where: { status: 'approved' }
    });
    
    const totalRejected = await prisma.pendingAction.count({
      where: { status: 'rejected' }
    });

    const pendingByType = await prisma.pendingAction.groupBy({
      by: ['action_type'],
      _count: { action_type: true },
      where: { status: 'pending' }
    });

    const pendingByPriority = await prisma.pendingAction.groupBy({
      by: ['priority'],
      _count: { priority: true },
      where: { status: 'pending' }
    });

    res.json({
      pending: totalPending,
      approved: totalApproved,
      rejected: totalRejected,
      by_type: pendingByType,
      by_priority: pendingByPriority
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 🔧 EXECUTAR AÇÃO (FUNÇÃO AUXILIAR)
// ============================================
async function executeAction(action) {
  const { action_type, entity_type, entity_id, action_data } = action;

  try {
    switch (entity_type) {
      case 'product':
        return await executeProductAction(action_type, entity_id, action_data);
      
      case 'coupon':
        return await executeCouponAction(action_type, entity_id, action_data);
      
      case 'flash_sale':
        return await executeFlashSaleAction(action_type, entity_id, action_data);
      
      case 'order':
        return await executeOrderAction(action_type, entity_id, action_data);
      
      default:
        throw new Error(`Tipo de entidade não suportado: ${entity_type}`);
    }
  } catch (error) {
    console.error('❌ Erro ao executar ação:', error);
    throw error;
  }
}

// Executar ação em produto
async function executeProductAction(action_type, entity_id, action_data) {
  switch (action_type) {
    case 'create_product':
      return await prisma.product.create({ data: action_data });
    
    case 'update_product':
      return await prisma.product.update({
        where: { id: entity_id },
        data: action_data
      });
    
    case 'delete_product':
      return await prisma.product.update({
        where: { id: entity_id },
        data: { ativo: false }
      });
    
    default:
      throw new Error(`Ação de produto não suportada: ${action_type}`);
  }
}

// Executar ação em cupom
async function executeCouponAction(action_type, entity_id, action_data) {
  switch (action_type) {
    case 'create_coupon':
      return await prisma.coupon.create({ data: action_data });
    
    case 'update_coupon':
      return await prisma.coupon.update({
        where: { id: entity_id },
        data: action_data
      });
    
    case 'delete_coupon':
      return await prisma.coupon.update({
        where: { id: entity_id },
        data: { is_active: false }
      });
    
    default:
      throw new Error(`Ação de cupom não suportada: ${action_type}`);
  }
}

// Executar ação em flash sale
async function executeFlashSaleAction(action_type, entity_id, action_data) {
  switch (action_type) {
    case 'create_flash_sale':
      return await prisma.flashSale.create({ data: action_data });
    
    case 'update_flash_sale':
      return await prisma.flashSale.update({
        where: { id: entity_id },
        data: action_data
      });
    
    case 'delete_flash_sale':
      return await prisma.flashSale.update({
        where: { id: entity_id },
        data: { is_active: false }
      });
    
    default:
      throw new Error(`Ação de flash sale não suportada: ${action_type}`);
  }
}

// Executar ação em pedido
async function executeOrderAction(action_type, entity_id, action_data) {
  switch (action_type) {
    case 'update_order_status':
      return await prisma.order.update({
        where: { id: entity_id },
        data: { status: action_data.status }
      });
    
    case 'cancel_order':
      return await prisma.order.update({
        where: { id: entity_id },
        data: { 
          status: 'cancelled',
          cancelled_at: new Date()
        }
      });
    
    default:
      throw new Error(`Ação de pedido não suportada: ${action_type}`);
  }
}

export default router;
