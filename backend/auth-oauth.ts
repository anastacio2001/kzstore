/**
 * OAuth Authentication Handlers
 * Google and Facebook OAuth integration
 */

import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from './utils/prisma/client';

const router = Router();
const prisma = getPrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '30d';

// Google OAuth Client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
});

/**
 * Gerar token JWT
 */
function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * GET /api/auth/google
 * Iniciar fluxo OAuth do Google
 */
router.get('/google', (req: Request, res: Response) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  });

  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Callback do Google OAuth
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=oauth_failed');
    }

    // Trocar código por tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Obter informações do usuário
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect('/?error=oauth_no_email');
    }

    const { email, name, picture, sub: googleId } = payload;

    // Buscar ou criar usuário
    let customer = await prisma.customerProfile.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!customer) {
      // Criar novo usuário
      customer = await prisma.customerProfile.create({
        data: {
          email: email.toLowerCase(),
          nome: name || email.split('@')[0],
          password: '', // OAuth users don't have password
          role: 'customer',
          is_admin: false,
          is_active: true,
          preferences: JSON.stringify({
            oauth_provider: 'google',
            google_id: googleId,
            avatar: picture
          })
        }
      });

      console.log('✅ [OAuth Google] Novo usuário criado:', email);
    } else {
      console.log('✅ [OAuth Google] Usuário existente:', email);
    }

    // Gerar token JWT
    const token = generateToken(customer.id, customer.email, customer.role || 'customer');

    // Redirecionar para frontend com token
    res.redirect(`/?auth_token=${token}`);
  } catch (error: any) {
    console.error('❌ [OAuth Google] Erro:', error);
    res.redirect('/?error=oauth_error');
  }
});

/**
 * GET /api/auth/facebook
 * Iniciar fluxo OAuth do Facebook
 */
router.get('/facebook', (req: Request, res: Response) => {
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  
  // Detectar base URL dinamicamente
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;
  
  if (!facebookAppId) {
    console.error('❌ [OAuth Facebook] FACEBOOK_APP_ID não configurado');
    return res.redirect('/?error=facebook_not_configured');
  }
  
  console.log(`🔵 [OAuth Facebook] Base URL: ${baseUrl}`);
  console.log(`🔵 [OAuth Facebook] Redirect URI: ${redirectUri}`);
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${facebookAppId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=email,public_profile&` +
    `response_type=code`;
  
  console.log('🔵 [OAuth Facebook] Redirecionando para:', authUrl);
  res.redirect(authUrl);
});

/**
 * GET /api/auth/facebook/callback
 * Callback do Facebook OAuth
 */
router.get('/facebook/callback', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error('❌ [OAuth Facebook] Erro do Facebook:', error);
      return res.redirect('/?error=facebook_denied');
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=oauth_failed');
    }

    const facebookAppId = process.env.FACEBOOK_APP_ID;
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    
    // Detectar base URL dinamicamente
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

    if (!facebookAppId || !facebookAppSecret) {
      console.error('❌ [OAuth Facebook] Credenciais não configuradas');
      return res.redirect('/?error=facebook_not_configured');
    }

    console.log(`🔵 [OAuth Facebook Callback] Redirect URI: ${redirectUri}`);

    // Trocar código por access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${facebookAppId}&` +
      `client_secret=${facebookAppSecret}&` +
      `code=${code}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('❌ [OAuth Facebook] Erro ao obter token:', tokenData);
      return res.redirect('/?error=facebook_token_failed');
    }

    // Obter informações do usuário
    const userUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`;
    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();

    if (!userData.email) {
      console.error('❌ [OAuth Facebook] Email não fornecido:', userData);
      return res.redirect('/?error=facebook_no_email');
    }

    const { email, name, picture, id: facebookId } = userData;

    // Buscar ou criar usuário
    let customer = await prisma.customerProfile.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!customer) {
      // Criar novo usuário
      customer = await prisma.customerProfile.create({
        data: {
          email: email.toLowerCase(),
          nome: name || email.split('@')[0],
          password: '', // OAuth users don't have password
          role: 'customer',
          is_admin: false,
          is_active: true,
          preferences: JSON.stringify({
            oauth_provider: 'facebook',
            facebook_id: facebookId,
            avatar: picture?.data?.url
          })
        }
      });

      console.log('✅ [OAuth Facebook] Novo usuário criado:', email);
    } else {
      console.log('✅ [OAuth Facebook] Usuário existente:', email);
    }

    // Gerar token JWT
    const token = generateToken(customer.id, customer.email, customer.role || 'customer');

    // Redirecionar para frontend com token
    res.redirect(`/?auth_token=${token}`);
  } catch (error: any) {
    console.error('❌ [OAuth Facebook] Erro:', error);
    res.redirect('/?error=oauth_error');
  }
});

export default router;
