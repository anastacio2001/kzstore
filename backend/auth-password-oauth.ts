import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'kzstore-secret-2024';

// ============================================
// 🔑 RECUPERAÇÃO DE SENHA
// ============================================

interface PasswordResetToken {
  userId: string;
  email: string;
  exp: number;
}

/**
 * Gerar token de recuperação de senha (válido por 1 hora)
 */
function generatePasswordResetToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, exp: Math.floor(Date.now() / 1000) + 3600 } as PasswordResetToken,
    JWT_SECRET
  );
}

/**
 * Verificar token de recuperação
 */
function verifyPasswordResetToken(token: string): PasswordResetToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PasswordResetToken;
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expirado
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperação de senha
 */
export async function forgotPasswordHandler(req: Request, res: Response) {
  console.log('🔐 [forgotPasswordHandler] ===== REQUISIÇÃO RECEBIDA =====');
  console.log('🔐 [forgotPasswordHandler] Method:', req.method);
  console.log('🔐 [forgotPasswordHandler] Path:', req.path);
  console.log('🔐 [forgotPasswordHandler] Body:', req.body);
  
  try {
    const { email } = req.body;

    if (!email) {
      console.log('❌ [forgotPasswordHandler] Email não fornecido');
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    console.log(`🔍 [forgotPasswordHandler] Buscando usuário com email: ${email}`);
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    console.log(`🔍 [forgotPasswordHandler] Usuário encontrado:`, user ? `ID ${user.id}` : 'NÃO ENCONTRADO');

    // Sempre retornar sucesso (segurança - não revelar se email existe)
    if (!user) {
      console.log('⚠️  [forgotPasswordHandler] Usuário não existe, mas retornando sucesso por segurança');
      return res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para recuperar sua senha'
      });
    }

    // Gerar token
    const resetToken = generatePasswordResetToken(user.id, user.email);
    const resetUrl = `https://kzstore.ao/reset-password?token=${resetToken}`;

    // Enviar email
    try {
      console.log(`📧 Tentando enviar email para: ${email}`);
      console.log(`📋 From: ${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`);
      
      const { data, error } = await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME || 'KZSTORE Angola'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: [email],
        subject: '🔐 Recuperar Senha - KZSTORE',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔥 KZSTORE</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Recuperação de Senha</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Olá ${user.name}! 👋</h2>
              
              <p>Recebemos uma solicitação para recuperar sua senha.</p>
              
              <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <p style="margin: 0;"><strong>⏰ Este link expira em 1 hora</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Recuperar Senha</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Se você não solicitou a recuperação de senha, ignore este email. Sua senha permanecerá inalterada.
              </p>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                © ${new Date().getFullYear()} KZSTORE Angola. Todos os direitos reservados.
              </p>
            </div>
          </body>
          </html>
        `
      });

      if (error) {
        console.error('❌ Erro do Resend:', error);
        throw error;
      }

      console.log(`✅ Email enviado com sucesso! ID: ${data?.id}`);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      // Não falhar se email não for enviado
    }

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: user.id,
        user_name: user.name,
        user_role: user.user_type,
        action_type: 'password_reset_requested',
        description: `Solicitou recuperação de senha`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }
    });

    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para recuperar sua senha'
    });
  } catch (error: any) {
    console.error('❌ Erro ao solicitar recuperação:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
}

/**
 * POST /api/auth/reset-password
 * Resetar senha com token
 */
export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
    }

    // Verificar token
    const decoded = verifyPasswordResetToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { team_member: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: passwordHash }
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
        action_type: 'password_reset',
        description: `Senha resetada via email`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
}

// ============================================
// 🌐 OAUTH - FACEBOOK & GOOGLE
// ============================================

/**
 * Criar ou atualizar usuário via OAuth
 */
async function createOrUpdateOAuthUser(
  email: string,
  name: string,
  provider: 'facebook' | 'google',
  providerId: string,
  avatarUrl?: string
) {
  // Verificar se usuário já existe
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (user) {
    // Atualizar último login
    user = await prisma.user.update({
      where: { id: user.id },
      data: { 
        last_login: new Date(),
        // Atualizar avatar se fornecido
        ...(avatarUrl && user.user_type === 'team' && user.team_member_id && {
          team_member: {
            update: { avatar_url: avatarUrl }
          }
        })
      },
      include: { team_member: true }
    });
  } else {
    // Criar novo usuário
    // Gerar senha aleatória (não será usada - login via OAuth)
    const randomPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        user_type: 'customer', // Clientes via OAuth
        is_active: true
      }
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: user.id,
        user_name: user.name,
        user_role: user.user_type,
        action_type: 'oauth_signup',
        description: `Cadastrou via ${provider}`,
        metadata: { provider, providerId }
      }
    });
  }

  return user;
}

/**
 * POST /api/auth/oauth/facebook
 * Login com Facebook (recebe access token do frontend)
 */
export async function facebookOAuthHandler(req: Request, res: Response) {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token é obrigatório' });
    }

    // Verificar token com Facebook API
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!response.ok) {
      return res.status(401).json({ error: 'Token do Facebook inválido' });
    }

    const fbData = await response.json() as any;

    if (!fbData.email) {
      return res.status(400).json({ error: 'Email não fornecido pelo Facebook' });
    }

    // Criar ou atualizar usuário
    const user = await createOrUpdateOAuthUser(
      fbData.email,
      fbData.name,
      'facebook',
      fbData.id,
      fbData.picture?.data?.url
    );

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type,
        teamMemberId: user.team_member_id || undefined
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no login Facebook:', error);
    res.status(500).json({ error: 'Erro ao fazer login com Facebook' });
  }
}

/**
 * POST /api/auth/oauth/google
 * Login com Google (recebe ID token do frontend)
 */
export async function googleOAuthHandler(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token é obrigatório' });
    }

    // Verificar token com Google API
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      return res.status(401).json({ error: 'Token do Google inválido' });
    }

    const googleData = await response.json() as any;

    if (!googleData.email) {
      return res.status(400).json({ error: 'Email não fornecido pelo Google' });
    }

    // Criar ou atualizar usuário
    const user = await createOrUpdateOAuthUser(
      googleData.email,
      googleData.name || googleData.email.split('@')[0],
      'google',
      googleData.sub,
      googleData.picture
    );

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type,
        teamMemberId: user.team_member_id || undefined
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no login Google:', error);
    res.status(500).json({ error: 'Erro ao fazer login com Google' });
  }
}
