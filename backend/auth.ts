/**
 * Sistema de Autenticação JWT
 *
 * Endpoints:
 * - POST /api/auth/register - Registro de novo usuário
 * - POST /api/auth/login - Login com email/senha
 * - POST /api/auth/validate - Validar token JWT
 * - GET /api/auth/me - Obter dados do usuário logado
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Secret para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'kzstore-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d'; // Token válido por 30 dias

/**
 * Tipos
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware para validar JWT
 */
export function authMiddleware(req: any, res: Response, next: any) {
  try {
    // Prefer token from Authorization header, fallback to cookie
    let token: string | undefined = undefined;

    if (req.headers && req.headers.authorization && typeof req.headers.authorization === 'string') {
      const authHeader = req.headers.authorization;
      const parts = authHeader.split(' ');
      if (parts.length === 2) {
        const [scheme, t] = parts;
        if (/^Bearer$/i.test(scheme)) {
          token = t;
        }
      }
    }

    if (!token && req.cookies && req.cookies.kz_jwt) {
      token = req.cookies.kz_jwt;
    }

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const payload = decoded as JWTPayload;
      req.userId = payload.userId;
      req.userEmail = payload.email;
      req.userRole = payload.role || (payload as any).userType || 'customer';

      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware OPCIONAL - tenta autenticar mas permite continuar sem token (para guests)
 */
export function optionalAuthMiddleware(req: any, res: Response, next: any) {
  try {
    let token: string | undefined = undefined;

    if (req.headers && req.headers.authorization && typeof req.headers.authorization === 'string') {
      const authHeader = req.headers.authorization;
      const parts = authHeader.split(' ');
      if (parts.length === 2) {
        const [scheme, t] = parts;
        if (/^Bearer$/i.test(scheme)) {
          token = t;
        }
      }
    }

    if (!token && req.cookies && req.cookies.kz_jwt) {
      token = req.cookies.kz_jwt;
    }

    // Se não tem token, continua como guest
    if (!token) {
      req.userId = 'guest';
      req.userEmail = null;
      req.userRole = 'guest';
      return next();
    }

    // Se tem token, valida
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token inválido, continua como guest
        req.userId = 'guest';
        req.userEmail = null;
        req.userRole = 'guest';
      } else {
        const payload = decoded as JWTPayload;
        req.userId = payload.userId;
        req.userEmail = payload.email;
        req.userRole = payload.role || (payload as any).userType || 'customer';
      }
      return next();
    });
  } catch (error) {
    // Em caso de erro, continua como guest
    req.userId = 'guest';
    req.userEmail = null;
    req.userRole = 'guest';
    return next();
  }
}

// Middleware para verificar admin
export async function requireAdmin(req: any, res: Response, next: any) {
  try {
    // Ensure authMiddleware ran (some routes call only requireAdmin)
    if (!req.userId) {
      await new Promise<void>((resolve, reject) => {
        try {
          authMiddleware(req, res, (err?: any) => {
            if (err) return reject(err);
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      })
        .catch((err) => {
          // authMiddleware already handled the response (401), so just return
          return res.status(401).json({ error: 'Não autenticado' });
        });
      if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar primeiro em User (TeamMembers/Admins)
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    
    if (user) {
      // Verificar se é admin direto
      if (user.user_type === 'admin') {
        return next();
      }
      
      // Se é user_type='team', verificar role na tabela TeamMember
      if (user.user_type === 'team' && user.team_member_id) {
        const teamMember = await prisma.teamMember.findUnique({
          where: { id: user.team_member_id }
        });
        
        if (teamMember && teamMember.role === 'admin' && teamMember.is_active) {
          console.log(`✅ [AUTH] Team member ${user.email} is admin with active status`);
          return next();
        }
      }
      
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    // Se não encontrou em User, buscar em CustomerProfile
    const customer = await prisma.customerProfile.findUnique({ where: { id: req.userId } });
    if (!customer) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (customer.role !== 'admin' && !customer.is_admin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    return next();
  } catch (error) {
    console.error('❌ [AUTH] requireAdmin error:', error);
    return res.status(500).json({ error: 'Erro de autorização' });
  }
}

/**
 * POST /api/auth/register
 * Registro de novo usuário
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone }: RegisterData = req.body;

    console.log('📝 [AUTH] Register request:', email);

    // Validações
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se usuário já existe
    const existingCustomer = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const customer = await prisma.customerProfile.create({
      data: {
        email,
        password: hashedPassword,
        nome: name,
        telefone: phone,
        role: 'customer',
        is_active: true,
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: customer.id,
        email: customer.email,
        role: customer.role
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ [AUTH] User registered:', customer.email);

    // Set HTTP-only cookie for session persistence
    res.cookie('kz_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log('🍪 [AUTH] Cookie set for user:', customer.email);

    res.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        phone: customer.telefone,
        role: customer.role,
      },
      token
    });
  } catch (error: any) {
    console.error('❌ [AUTH] Register error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

/**
 * POST /api/auth/login
 * Login com email e senha
 * ⚠️ ROTA DESATIVADA - Usando novo sistema de autenticação em backend/auth-team.ts
 */
/*
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body;

    console.log('🔐 [AUTH] Login request:', email);

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const customer = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (!customer.is_active) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    if (!customer.password) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: customer.id,
        email: customer.email,
        role: customer.role
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ [AUTH] Login successful:', customer.email);

    // Set HTTP-only cookie
    res.cookie('kz_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log('🍪 [AUTH] Cookie set for user:', customer.email);

    res.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        phone: customer.telefone,
        role: customer.role,
      },
      token
    });
  } catch (error: any) {
    console.error('❌ [AUTH] Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});
*/

/**
 * POST /api/auth/validate
 * Validar token JWT
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Buscar usuário atualizado
    const customer = await prisma.customerProfile.findUnique({
      where: { id: decoded.userId }
    });

    if (!customer || !customer.is_active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    res.json({
      valid: true,
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        phone: customer.telefone,
        role: customer.role,
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Token inválido', valid: false });
  }
});

/**
 * GET /api/auth/me
 * Obter dados do usuário logado (requer autenticação)
 */
router.get('/me', authMiddleware, async (req: any, res: Response) => {
  try {
    console.log('🔍 [GET /me] Handler executando. userId:', req.userId);
    
    // Tentar buscar primeiro na tabela User (TeamMembers/Admins)
    let user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { team_member: true }
    });

    if (user) {
      // Usar role do TeamMember se existir, senão user_type
      const userRole = user.team_member ? user.team_member.role : user.user_type;
      console.log('✅ [GET /me] Usuário encontrado em User:', user.email, 'Type:', user.user_type, 'Role:', userRole);
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.team_member?.phone || null,
          role: userRole, // Role real: do TeamMember se existir, senão user_type
        }
      });
    }

    // Se não encontrou em User, tentar em CustomerProfile
    const customer = await prisma.customerProfile.findUnique({
      where: { id: req.userId }
    });

    if (!customer) {
      console.log('❌ [GET /me] Usuário não encontrado em nenhuma tabela:', req.userId);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ [GET /me] Usuário encontrado em CustomerProfile:', customer.email, 'Role:', customer.role);
    
    res.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        phone: customer.telefone,
        role: customer.role || 'customer',
      }
    });
  } catch (error: any) {
    console.error('❌ [AUTH] Me error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

/**
 * PUT /api/auth/me
 * Atualizar dados do usuário logado (name, phone)
 */
router.put('/me', authMiddleware, async (req: any, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });

    const updated = await prisma.customerProfile.update({
      where: { id: req.userId },
      data: {
        nome: name || undefined,
        telefone: phone || undefined,
      }
    });

    res.json({ user: {
      id: updated.id,
      email: updated.email,
      name: updated.nome,
      phone: updated.telefone,
      role: updated.role
    } });
  } catch (error: any) {
    console.error('❌ [AUTH] Update me error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

/**
 * POST /api/auth/quick-login
 * Login rápido sem senha (para compatibilidade com sistema antigo)
 * NOTA: Remover em produção ou adicionar segurança adequada
 */
// Quick-login route: only enabled in non-production environments for dev convenience
if (process.env.NODE_ENV !== 'production') {
  router.post('/quick-login', async (req: Request, res: Response) => {
  try {
    const { email, name, phone } = req.body;

    console.log('⚡ [AUTH] Quick login request:', email);

    if (!email || !name) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }

    // Buscar ou criar usuário
    let customer = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (!customer) {
      // Criar usuário sem senha (usar email como senha temporária)
      const tempPassword = await bcrypt.hash(email, 10);

      customer = await prisma.customerProfile.create({
        data: {
          email,
          password: tempPassword,
          nome: name,
          telefone: phone,
          role: 'customer',
          is_active: true,
        }
      });

      console.log('✅ [AUTH] Quick login - User created:', customer.email);
    } else {
      // Atualizar nome/telefone se fornecidos
      if (name && customer.nome !== name) {
        customer = await prisma.customerProfile.update({
          where: { id: customer.id },
          data: { nome: name, telefone: phone }
        });
      }

      console.log('✅ [AUTH] Quick login - User found:', customer.email);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: customer.id,
        email: customer.email,
        role: customer.role
      } as JWTPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.nome,
        phone: customer.telefone,
        role: customer.role,
      },
      token
    });
  } catch (error: any) {
    console.error('❌ [AUTH] Quick login error:', error);
    res.status(500).json({ error: 'Erro ao fazer quick login' });
  }
  });
} else {
  console.log('🔒 Quick-login disabled in production');
}

/**
 * POST /api/auth/forgot-password - Request password reset (sends link to email)
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  console.log('🔐 [forgot-password] ===== REQUISIÇÃO RECEBIDA =====');
  console.log('🔐 [forgot-password] Body:', req.body);
  
  try {
    const { email } = req.body;
    if (!email) {
      console.log('❌ [forgot-password] Email não fornecido');
      return res.status(400).json({ error: 'Email required' });
    }
    
    console.log(`🔍 [forgot-password] Buscando cliente: ${email}`);
    const customer = await prisma.customerProfile.findUnique({ where: { email } });
    
    if (!customer) {
      console.log('⚠️  [forgot-password] Cliente não existe, retornando sucesso (segurança)');
      return res.json({ success: true }); // do not reveal
    }
    
    console.log(`✅ [forgot-password] Cliente encontrado: ID ${customer.id}`);

    // Create reset token (short expiry)
    const resetToken = jwt.sign({ userId: customer.id }, JWT_SECRET, { expiresIn: '1h' });
    
    // Detectar URL base dinamicamente
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log('🔐 [forgot-password] Token gerado, link:', resetLink);
    
    // Enviar email via Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log(`📧 [forgot-password] Enviando email para: ${email}`);
      console.log(`📋 [forgot-password] From: ${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`);
      
      const { data, error } = await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: [email],
        subject: '🔐 Recuperar Senha - KZSTORE',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Recuperar Senha - KZSTORE</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔐 Recuperar Senha</h1>
                </div>
                
                <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Olá! 👋
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Recebemos uma solicitação para redefinir a senha da sua conta na <strong>KZSTORE</strong>.
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    Clique no botão abaixo para criar uma nova senha:
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; 
                              font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      Redefinir Senha
                    </a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                    ⏱️ Este link expira em <strong>1 hora</strong> por motivos de segurança.
                  </p>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 16px;">
                    ⚠️ Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.
                  </p>
                  
                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                    <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:
                    </p>
                    <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
                      ${resetLink}
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
                  <p style="margin: 8px 0;">
                    © 2025 KZSTORE Angola. Todos os direitos reservados.
                  </p>
                  <p style="margin: 8px 0;">
                    🇦🇴 Luanda, Angola
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      
      if (error) {
        console.error('❌ [forgot-password] Erro do Resend:', error);
        throw error;
      }
      
      console.log(`✅ [forgot-password] Email enviado com sucesso! ID: ${data?.id}`);
    } catch (emailError) {
      console.error('❌ [forgot-password] Erro ao enviar email:', emailError);
      // Em dev, continuar mesmo se email falhar
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [forgot-password] Erro geral:', error);
    res.status(500).json({ error: 'Erro ao requisitar redefinição de senha' });
  }
});

/**
 * POST /api/auth/reset-password - Reset password using token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  console.log('🔐 [reset-password] ===== REQUISIÇÃO RECEBIDA =====');
  console.log('🔐 [reset-password] Body:', { token: req.body.token ? 'presente' : 'ausente', password: req.body.password ? 'presente' : 'ausente' });
  
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      console.log('❌ [reset-password] Token ou senha ausentes');
      return res.status(400).json({ error: 'Token and password required' });
    }
    
    console.log('🔍 [reset-password] Verificando token JWT...');
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    console.log(`✅ [reset-password] Token válido para userId: ${userId}`);
    console.log('🔐 [reset-password] Gerando hash da nova senha...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('💾 [reset-password] Atualizando senha no banco...');
    await prisma.customerProfile.update({ 
      where: { id: userId }, 
      data: { password: hashedPassword } 
    });
    
    console.log('✅ [reset-password] Senha atualizada com sucesso!');
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [reset-password] Erro:', error.message);
    res.status(400).json({ error: 'Token inválido ou expirado' });
  }
});

/**
 * POST /api/auth/update-password - Update password for authenticated user
 */
router.post('/update-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha inválida (mínimo 6 caracteres)' });
    }
    const userId = (req as any).userId;
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.customerProfile.update({ where: { id: userId }, data: { password: hashedPassword } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [AUTH] Update password error:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
});

/**
 * POST /api/auth/logout - Clear cookie and logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    res.clearCookie('kz_jwt');
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [AUTH] Logout error:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }

});

export default router;
