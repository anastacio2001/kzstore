import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 📋 LISTAR LOGS DE ATIVIDADE
// ============================================
router.get('/activity-logs', async (req, res) => {
  try {
    const { 
      user_id, 
      action_type, 
      entity_type, 
      from_date, 
      to_date,
      limit = 50 
    } = req.query;
    
    const where = {};
    if (user_id) where.user_id = user_id;
    if (action_type) where.action_type = action_type;
    if (entity_type) where.entity_type = entity_type;
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error('❌ Erro ao listar logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 👤 OBTER LOG POR ID
// ============================================
router.get('/activity-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await prisma.activityLog.findUnique({
      where: { id }
    });

    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json(log);
  } catch (error) {
    console.error('❌ Erro ao obter log:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ➕ CRIAR LOG DE ATIVIDADE
// ============================================
router.post('/activity-logs', async (req, res) => {
  try {
    const {
      user_id,
      user_name,
      user_role,
      action_type,
      entity_type,
      entity_id,
      description,
      metadata,
      ip_address,
      user_agent
    } = req.body;

    // Validações
    if (!user_id || !user_name || !user_role || !action_type || !description) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: user_id, user_name, user_role, action_type, description' 
      });
    }

    // Criar log
    const newLog = await prisma.activityLog.create({
      data: {
        user_id,
        user_name,
        user_role,
        action_type,
        entity_type,
        entity_id,
        description,
        metadata,
        ip_address,
        user_agent
      }
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error('❌ Erro ao criar log:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📊 ESTATÍSTICAS DE LOGS
// ============================================
router.get('/activity-logs/stats/overview', async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    const where = {};
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }

    const totalLogs = await prisma.activityLog.count({ where });

    const logsByAction = await prisma.activityLog.groupBy({
      by: ['action_type'],
      _count: { action_type: true },
      where
    });

    const logsByUser = await prisma.activityLog.groupBy({
      by: ['user_id', 'user_name'],
      _count: { user_id: true },
      where,
      orderBy: { _count: { user_id: 'desc' } },
      take: 10
    });

    const logsByEntity = await prisma.activityLog.groupBy({
      by: ['entity_type'],
      _count: { entity_type: true },
      where: {
        ...where,
        entity_type: { not: null }
      }
    });

    res.json({
      total: totalLogs,
      by_action: logsByAction,
      by_user: logsByUser,
      by_entity: logsByEntity
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📈 ATIVIDADE POR PERÍODO
// ============================================
router.get('/activity-logs/stats/timeline', async (req, res) => {
  try {
    const { from_date, to_date, interval = 'day' } = req.query;
    
    const where = {};
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }

    // Buscar logs
    const logs = await prisma.activityLog.findMany({
      where,
      select: {
        created_at: true,
        action_type: true
      },
      orderBy: { created_at: 'asc' }
    });

    // Agrupar por intervalo
    const timeline = {};
    logs.forEach(log => {
      const date = log.created_at;
      let key;
      
      if (interval === 'hour') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else if (interval === 'day') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (interval === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!timeline[key]) {
        timeline[key] = { total: 0, by_action: {} };
      }
      
      timeline[key].total++;
      if (!timeline[key].by_action[log.action_type]) {
        timeline[key].by_action[log.action_type] = 0;
      }
      timeline[key].by_action[log.action_type]++;
    });

    res.json(timeline);
  } catch (error) {
    console.error('❌ Erro ao obter timeline:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 🗑️ LIMPAR LOGS ANTIGOS
// ============================================
router.delete('/activity-logs/cleanup', async (req, res) => {
  try {
    const { days_old = 90, admin_id } = req.body;

    if (!admin_id) {
      return res.status(400).json({ error: 'admin_id é obrigatório' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_old);

    const deletedCount = await prisma.activityLog.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate
        }
      }
    });

    // Log da limpeza
    await prisma.activityLog.create({
      data: {
        user_id: admin_id,
        user_name: 'Admin',
        user_role: 'admin',
        action_type: 'cleanup',
        entity_type: 'activity_log',
        description: `Limpou ${deletedCount.count} logs com mais de ${days_old} dias`,
        metadata: { 
          cutoff_date: cutoffDate,
          deleted_count: deletedCount.count 
        }
      }
    });

    res.json({ 
      message: 'Logs limpos com sucesso',
      deleted_count: deletedCount.count 
    });
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
