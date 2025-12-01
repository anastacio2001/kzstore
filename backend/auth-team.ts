import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'kzstore-secret-2024';

// ============================================
// 🔐 AUTENTICAÇÃO DE MEMBROS DA EQUIPE
// ============================================

/**
 * Gerar senha temporária aleatória
 */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Hash de senha com bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verificar senha
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Gerar JWT token
 */
export function generateToken(userId: string, email: string, userType: string, teamMemberId?: string): string {
  return jwt.sign(
    { userId, email, userType, teamMemberId },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Verificar JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ============================================
// 🛡️ MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: string;
    teamMemberId?: string;
  };
}

/**
 * Middleware para verificar se usuário está autenticado
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
}

/**
 * Middleware para verificar se usuário é admin
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, async () => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      // Verificar se é admin direto
      if (req.user.userType === 'admin') {
        return next();
      }

      // Verificar se é team member com role admin
      if (req.user.teamMemberId) {
        const teamMember = await prisma.teamMember.findUnique({
          where: { id: req.user.teamMemberId }
        });

        if (teamMember && teamMember.role === 'admin' && teamMember.is_active) {
          return next();
        }
      }

      res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    } catch (error) {
      console.error('❌ Erro na verificação de admin:', error);
      res.status(500).json({ error: 'Erro na verificação de permissões' });
    }
  });
}

/**
 * Middleware para verificar permissões específicas
 */
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, async () => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Não autenticado' });
        }

        // Admin tem todas as permissões
        if (req.user.userType === 'admin') {
          return next();
        }

        // Verificar permissões do team member
        if (req.user.teamMemberId) {
          const teamMember = await prisma.teamMember.findUnique({
            where: { id: req.user.teamMemberId }
          });

          if (!teamMember || !teamMember.is_active) {
            return res.status(403).json({ error: 'Conta desativada' });
          }

          const permissions = teamMember.permissions as any;
          
          // Verificar permissão específica
          if (permissions && permissions[permission]) {
            return next();
          }

          // Admin role tem todas as permissões
          if (teamMember.role === 'admin') {
            return next();
          }
        }

        res.status(403).json({ error: `Permissão negada: ${permission}` });
      } catch (error) {
        console.error('❌ Erro na verificação de permissão:', error);
        res.status(500).json({ error: 'Erro na verificação de permissões' });
      }
    });
  };
}

// ============================================
// 📝 ROTAS DE AUTENTICAÇÃO
// ============================================

/**
 * POST /api/auth/login - Login de usuários (admin e team)
 */
export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar primeiro na tabela User (TeamMembers/Admins)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { team_member: true }
    });

    if (user) {
      // Usuario encontrado em User table
      if (!user.is_active) {
        return res.status(403).json({ error: 'Conta desativada' });
      }

      // Verificar senha
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      // Atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      if (user.team_member) {
        await prisma.teamMember.update({
          where: { id: user.team_member.id },
          data: { 
            last_login: new Date(),
            accepted_at: user.team_member.accepted_at || new Date()
          }
        });
      }

      // Gerar token - usar role do TeamMember se existir, senão user_type
      const userRole = user.team_member ? user.team_member.role : user.user_type;
      const token = generateToken(user.id, user.email, userRole, user.team_member_id || undefined);

      // Log de atividade
      await prisma.activityLog.create({
        data: {
          user_id: user.id,
          user_name: user.name,
          user_role: user.user_type,
          action_type: 'login',
          description: `${user.name} fez login no sistema`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        }
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userRole, // Role real: do TeamMember se existir, senão user_type
          userType: user.user_type,
          teamMember: user.team_member ? {
            id: user.team_member.id,
          role: user.team_member.role,
          department: user.team_member.department,
          permissions: user.team_member.permissions,
          needsPasswordChange: !user.team_member.password_changed
        } : null
      }
    });
    }

    // Se não encontrou em User, buscar em CustomerProfile
    const customer = await prisma.customerProfile.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    if (!customer.is_active) {
      return res.status(403).json({ error: 'Conta desativada' });
    }

    // Verificar senha (CustomerProfile usa campo 'password', não 'password_hash')
    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token para customer
    const token = generateToken(customer.id, customer.email, customer.role || 'customer', undefined);

    console.log('✅ [AUTH] Customer logged in:', customer.email);

    return res.json({
      success: true,
      token,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        userType: customer.role || 'customer',
        teamMember: null
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

/**
 * POST /api/auth/create-admin - Criar novo admin
 */
export async function createAdminHandler(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar admin
    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        user_type: 'admin',
        is_active: true
      }
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: newAdmin.id,
        user_name: newAdmin.name,
        user_role: 'admin',
        action_type: 'create',
        entity_type: 'user',
        entity_id: newAdmin.id,
        description: `Admin ${name} foi criado`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admin criado com sucesso',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        userType: newAdmin.user_type
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar admin' });
  }
}

/**
 * POST /api/auth/change-password - Trocar senha
 */
export async function changePasswordHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senhas são obrigatórias' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { team_member: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isPasswordValid = await verifyPassword(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newPasswordHash }
    });

    // Marcar que senha foi alterada (se for team member)
    if (user.team_member) {
      await prisma.teamMember.update({
        where: { id: user.team_member.id },
        data: { 
          password_changed: true,
          temp_password: null
        }
      });
    }

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: user.id,
        user_name: user.name,
        user_role: user.user_type,
        action_type: 'update',
        entity_type: 'user',
        entity_id: user.id,
        description: `${user.name} alterou a senha`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao trocar senha:', error);
    res.status(500).json({ error: 'Erro ao trocar senha' });
  }
}

/**
 * GET /api/auth/me - Obter dados do usuário autenticado
 */
export async function meHandler(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { team_member: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Usar role do TeamMember se existir, senão user_type
    const userRole = user.team_member ? user.team_member.role : user.user_type;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: userRole, // Role real para verificação de permissões
      userType: user.user_type,
      isActive: user.is_active,
      lastLogin: user.last_login,
      teamMember: user.team_member ? {
        id: user.team_member.id,
        role: user.team_member.role,
        department: user.team_member.department,
        permissions: user.team_member.permissions,
        avatarUrl: user.team_member.avatar_url,
        phone: user.team_member.phone,
        needsPasswordChange: !user.team_member.password_changed
      } : null
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
}
