/**
 * API Server Local - KZSTORE
 * Servidor Express que conecta o frontend ao Prisma/MySQL
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getPrismaClient } from './backend/utils/prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import authRoutes, { authMiddleware, requireAdmin, optionalAuthMiddleware } from './backend/auth';
import authOAuthRoutes from './backend/auth-oauth';
import blogRoutes from './backend/blog';
import blogAdminRoutes from './backend/admin/blog-admin';
import blogInteractionsRoutes from './backend/blog-interactions';
import aiChatRoutes from './backend/ai-chat';
import { 
  generateTempPassword, 
  hashPassword, 
  loginHandler, 
  createAdminHandler, 
  changePasswordHandler, 
  meHandler,
  requireAuth,
  requirePermission,
  AuthRequest
} from './backend/auth-team';
import {
  forgotPasswordHandler,
  resetPasswordHandler,
  facebookOAuthHandler,
  googleOAuthHandler
} from './backend/auth-password-oauth';
import { sendOrderCreatedNotification, enqueueWhatsApp, sendWhatsAppTemplate, twilioStatusWebhookHandler } from './backend/whatsapp';
import { sendEmail, generateOrderConfirmationEmail } from './backend/mailer';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import compression from 'compression';

// Performance & Error Tracking
import { initializeSentry, sentryErrorHandler } from './backend/config/sentry';
import { initializeRedis, cacheMiddleware, invalidateCache } from './backend/config/redis';

// Validation
import { validate, validateQuery } from './backend/middleware/validation';
import * as schemas from './backend/validation/schemas';

// Pagination
import { paginationMiddleware, createPaginatedResponse, getPaginationParams, getOffset } from './backend/utils/pagination';

// Analytics
import {
  calculateCLV,
  calculateConversionRate,
  calculateRevenue,
  analyzeSalesFunnel,
  getHistoricalMetrics
} from './backend/analytics';

// Bulk Operations
import {
  importProductsFromFile,
  exportProductsToCSV,
  exportProductsToExcel,
  exportProductsToPDF,
  bulkUpdateProducts
} from './backend/bulk-operations';

// Recommendations
import {
  getProductRecommendations,
  getPersonalizedRecommendations,
  getPopularProducts,
  getRelatedProducts,
  getTrendingProducts
} from './backend/recommendations';

// Cron Jobs
import {
  checkLowStockAlerts,
  processAbandonedCarts,
  calculateDailyMetrics,
  cleanupOldCarts,
  updateFeaturedProducts,
  sendWeeklyReport
} from './backend/cron-jobs';

// Debug logs control
const DEBUG_LOGS = process.env.ENABLE_DEBUG_LOGS === 'true' || process.env.NODE_ENV !== 'production';
const debugLog = (...args: any[]) => {
  if (DEBUG_LOGS) console.log(...args);
};

const app = express();

// ============================================
// INITIALIZE SENTRY (MUST BE FIRST!)
// ============================================
initializeSentry(app);

const prisma = getPrismaClient();

// ============================================
// INITIALIZE REDIS
// ============================================
initializeRedis();
const PORT = parseInt(process.env.PORT || '8080', 10);

// Helper function to get base URL
const getBaseUrl = (req?: any) => {
  if (req) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}`;
  }
  // Fallback for cases without request object
  return process.env.NODE_ENV === 'production' 
    ? 'https://kzstore-rkksacgala-no.a.run.app'
    : `http://localhost:${PORT}`;
};

// Trust proxy for Cloud Run (needed for rate limiting and proper IP detection)
app.set('trust proxy', true);

// Environment
const isProduction = process.env.NODE_ENV === 'production';

// Cloudflare R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const bucketName = process.env.R2_BUCKET_NAME || 'kzstore-images';
const r2PublicUrl = process.env.R2_PUBLIC_URL || '';

// Criar pasta de uploads local para fallback (desenvolvimento)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para usar memória (upload para R2)
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (aumentado para PDFs)
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (jpeg, jpg, png, gif, webp) ou PDF são permitidos'));
    }
  }
});

// ============================================
// CORS CONFIGURATION (DEVE VIR PRIMEIRO!)
// ============================================

// CORS origins from environment variables (more secure and flexible)
const allowedOrigins = isProduction
  ? (process.env.ALLOWED_ORIGINS || 'https://kzstore.com,https://www.kzstore.com,https://kzstore.ao,https://www.kzstore.ao,https://kzstore-341392738431.us-central1.run.app').split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

// CORS deve vir antes de tudo!
app.use(cors({ 
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Em desenvolvimento, permitir qualquer localhost
    if (!isProduction && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Permitir todos os deployments do Vercel
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Verificar lista de origens permitidas
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ============================================
// BASIC MIDDLEWARE
// ============================================

// Compression middleware (compacta responses para melhor performance)
app.use(compression());

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // Limitar tamanho do body
app.use('/uploads', express.static(uploadsDir)); // Servir arquivos estáticos

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers (PRODUCTION-READY)
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", process.env.R2_PUBLIC_URL || ''],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));

// Rate Limiting - Prevenir ataques de força bruta
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos (janela menor para reset mais rápido)
  max: isProduction ? 500 : 5000, // 500 requisições por IP em produção, 5000 em dev
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Desabilita validação de trust proxy
  skip: (req) => {
    // Skip rate limiting in development for localhost
    if (!isProduction && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    // Skip rate limiting for authenticated admin users
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        return decoded.role === 'admin' || decoded.userType === 'admin';
      } catch {
        return false;
      }
    }
    return false;
  }
});

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isProduction ? 20 : 100, // 20 tentativas de login em produção (aumentado), 100 em dev
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Desabilita validação de trust proxy
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return !isProduction && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1');
  }
});

// Aplicar rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging middleware - controlled by DEBUG_LOGS
app.use((req, res, next) => {
  debugLog(`📍 [${req.method}] ${req.url}`);
  next();
});

// Rotas de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/auth', authOAuthRoutes); // OAuth routes (Google, Facebook)

// Rotas de Blog
app.use('/api/blog', blogRoutes);
app.use('/api/admin/blog', blogAdminRoutes);
app.use('/api', blogInteractionsRoutes); // Likes, Comments, Shares, Analytics

// Rotas de AI Chat
app.use('/api/ai', aiChatRoutes);

// Helper: Converter Decimals para numbers
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Decimal) {
    return parseFloat(obj.toString());
  }
  
  // Converter Date para ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertDecimalsToNumbers(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

// Using exported `authMiddleware` and `requireAdmin` from backend/auth.ts

// ============================================
// UPLOAD ROUTE
// ============================================

// POST /api/upload - Upload de imagem única
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const filename = `product-${uniqueSuffix}${ext}`;
    
    // Upload para Cloudflare R2
    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await r2Client.send(new PutObjectCommand(uploadParams));
    
    // URL pública do arquivo no R2
    const publicUrl = `${r2PublicUrl}/${filename}`;
    console.log('✅ Imagem enviada para R2:', publicUrl);
    
    res.json({
      success: true,
      url: publicUrl,
      filename: filename
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/upload-multiple - Upload de múltiplas imagens
app.post('/api/upload-multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    // Upload de cada arquivo para R2
    const uploadPromises = req.files.map(async (file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = `product-${uniqueSuffix}${ext}`;
      
      const uploadParams = {
        Bucket: bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await r2Client.send(new PutObjectCommand(uploadParams));
      const publicUrl = `${r2PublicUrl}/${filename}`;
      
      return { url: publicUrl, filename };
    });

    const imageUrls = await Promise.all(uploadPromises);
    console.log(`✅ ${req.files.length} imagens enviadas para R2`);
    
    res.json({
      success: true,
      images: imageUrls
    });
  } catch (error: any) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PLACEHOLDER IMAGE ROUTE
// ============================================

// GET /api/image-proxy/:filename - Proxy de imagens com fallback para placeholder
app.get('/api/image-proxy/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const r2PublicUrl = process.env.R2_PUBLIC_URL;
    
    if (!r2PublicUrl) {
      console.warn('⚠️ R2_PUBLIC_URL não configurado');
      return res.redirect('https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE');
    }

    const imageUrl = `${r2PublicUrl}/${filename}`;
    
    try {
      // Tentar buscar imagem do R2
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.warn(`⚠️ Imagem não encontrada no R2: ${filename}`);
        return res.redirect('https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE');
      }

      // Retornar imagem com cache headers
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 horas

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('Erro ao buscar imagem do R2:', error);
      res.redirect('https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE');
    }
    
  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    res.redirect('https://via.placeholder.com/400x400/E31E24/FFFFFF?text=KZSTORE');
  }
});

// ============================================
// PRODUCTS ROUTES
// ============================================

// GET /api/products - Buscar todos os produtos
app.get('/api/products', cacheMiddleware(300), paginationMiddleware, async (req, res) => {
  try {
    const { pre_order, category_id, search } = req.query;
    const { page, limit, sort, order } = getPaginationParams(req.query);

    const where: any = { ativo: true };

    // Filtrar por pré-venda
    if (pre_order === 'true') {
      where.is_pre_order = true;
    } else if (pre_order === 'false') {
      where.is_pre_order = false;
    } else {
      // Se não especificado, EXCLUIR pré-vendas do catálogo normal
      // Pré-vendas aparecem SOMENTE na seção de pré-vendas
      where.is_pre_order = false;
    }

    // Filtrar por categoria
    if (category_id) {
      where.category_id = category_id as string;
    }

    // Busca por nome
    if (search && typeof search === 'string') {
      where.nome = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Contar total de produtos
    const total = await prisma.product.count({ where });

    // Buscar produtos com paginação
    const products = await prisma.product.findMany({
      where,
      skip: getOffset(page, limit),
      take: limit,
      orderBy: { [sort]: order },
      include: {
        flashSales: {
          where: {
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
          },
        },
      },
    });

    // Converter Decimals para numbers
    const productsConverted = convertDecimalsToNumbers(products);

    // Transformar flashSales array para flash_sale objeto (compatibilidade frontend)
    const productsWithFlashSale = productsConverted.map((product: any) => {
      const activeFlashSale = product.flashSales?.[0] || null;
      const { flashSales, ...productWithoutFlashSales } = product;
      return {
        ...productWithoutFlashSales,
        flash_sale: activeFlashSale, // Adicionar flash_sale como objeto único
      };
    });

    // Resposta paginada
    const response = createPaginatedResponse(productsWithFlashSale, total, page, limit);

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Buscar produto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { is_approved: true },
          orderBy: { created_at: 'desc' },
        },
        flashSales: {
          where: {
            is_active: true,
            start_date: { lte: new Date() },
            end_date: { gte: new Date() },
          },
        },
      },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Converter Decimals para numbers
    const productConverted = convertDecimalsToNumbers(product);
    
    // Transformar flashSales array para flash_sale objeto (compatibilidade frontend)
    const activeFlashSale = productConverted.flashSales?.[0] || null;
    const { flashSales, ...productWithoutFlashSales } = productConverted;
    const productWithFlashSale = {
      ...productWithoutFlashSales,
      flash_sale: activeFlashSale,
    };
    
    res.json({ product: productWithFlashSale });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Criar produto (PROTEGIDO - Apenas Admin)
// POST /api/products - Criar produto (PROTEGIDO - Apenas Admin)
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });
    const productConverted = convertDecimalsToNumbers(product);

    // Invalidar cache de produtos
    await invalidateCache('cache:/api/products*');

    // Notify feed update
    await notifyFeedUpdate('create', product.id);

    res.json({ product: productConverted });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Atualizar produto (PROTEGIDO - Apenas Admin)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    const productConverted = convertDecimalsToNumbers(product);

    // Invalidar cache de produtos
    await invalidateCache('cache:/api/products*');

    // Notify feed update
    await notifyFeedUpdate('update', product.id);

    res.json({ product: productConverted });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/products/:id/image - Atualizar apenas imagem (MIGRAÇÃO)
app.patch('/api/products/:id/image', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { imagem_url } = req.body;
    
    if (!imagem_url || typeof imagem_url !== 'string') {
      return res.status(400).json({ error: 'imagem_url é obrigatório' });
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: { imagem_url },
    });
    
    const productConverted = convertDecimalsToNumbers(product);

    // Invalidar cache de produtos
    await invalidateCache('cache:/api/products*');

    res.json({ product: productConverted });
  } catch (error: any) {
    console.error('Error updating product image:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Deletar produto (PROTEGIDO - Apenas Admin)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
    });

    // Invalidar cache de produtos
    await invalidateCache('cache:/api/products*');

    // Notify feed update
    await notifyFeedUpdate('delete', id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/products/:id/stock - Atualizar estoque (PROTEGIDO - Apenas Admin)
app.patch('/api/products/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const newStock = (product.estoque || 0) + quantity;
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { estoque: newStock },
    });
    
    const productConverted = convertDecimalsToNumbers(updatedProduct);
    res.json({ product: productConverted });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/initialize - Inicializar produtos (PROTEGIDO - Apenas Admin)
app.post('/api/products/initialize', requireAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    // Verificar se já existem produtos
    const existingCount = await prisma.product.count();
    if (existingCount > 0) {
      return res.json({ 
        success: true, 
        message: 'Products already initialized',
        count: existingCount 
      });
    }
    
    // Inserir produtos em batch
    const created = await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });
    
    res.json({ 
      success: true, 
      message: 'Products initialized',
      count: created.count 
    });
  } catch (error: any) {
    console.error('Error initializing products:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORDERS ROUTES
// ============================================

// GET /api/orders - Buscar pedidos (filtrados por usuário ou todos para admin)
app.get('/api/orders', authMiddleware, paginationMiddleware, async (req: any, res) => {
  try {
    const { user_id, user_email, status, payment_status } = req.query;
    const { page, limit, sort, order } = getPaginationParams(req.query);
    const reqUserId = req.userId as string;
    const reqUserRole = (req.userRole || 'customer') as string;

    const where: any = {};

    // ADMIN: permissões especiais
    if (reqUserRole === 'admin' || reqUserRole === 'superadmin') {
      if (user_id) {
        where.user_id = user_id as string;
      }
      if (user_email) {
        where.user_email = user_email as string;
      }
      if (status) {
        where.status = status as string;
      }
      if (payment_status) {
        where.payment_status = payment_status as string;
      }
    } else {
      // NON-ADMIN: retornar somente pedidos do usuário autenticado
      where.user_id = reqUserId;
    }

    // Contar total
    const total = await prisma.order.count({ where });

    // Buscar com paginação
    const orders = await prisma.order.findMany({
      where,
      skip: getOffset(page, limit),
      take: limit,
      orderBy: { [sort]: order },
    });

    const ordersConverted = convertDecimalsToNumbers(orders).map((order: any) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    }));

    const response = createPaginatedResponse(ordersConverted, total, page, limit);
    return res.json(response);
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Buscar pedido por ID
app.get('/api/orders/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const reqUserId = req.userId as string;
    const reqUserRole = (req.userRole || 'customer') as string;
    
    const order = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // 🔒 SEGURANÇA: Verificar se o pedido pertence ao usuário
    // (a menos que seja admin)
    if (order.user_id !== reqUserId && !(reqUserRole === 'admin' || reqUserRole === 'superadmin')) {
      debugLog('⚠️ Unauthorized access attempt to order:', id, 'by user:', reqUserId);
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const orderConverted = convertDecimalsToNumbers(order);
    // Parse items se for string JSON
    if (typeof orderConverted.items === 'string') {
      orderConverted.items = JSON.parse(orderConverted.items);
    }

    // Try to send WhatsApp notification after creating order.
    (async () => {
      try {
        // Prefer phone inside shipping_address or fallback to customer's profile telefone
        let phone: string | null = null;
        if (orderConverted.shipping_address) {
          const addr = orderConverted.shipping_address as any;
          phone = addr?.phone || addr?.telefone || addr?.telefone_principal || null;
        }
        if (!phone && orderConverted.user_email) {
          const customer = await prisma.customerProfile.findUnique({ where: { email: orderConverted.user_email } });
          if (customer) phone = customer.telefone || null;
        }
        // If phone is present and Twilio env vars configured, send
        if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
          try {
            await enqueueWhatsApp({ to: `whatsapp:${phone}`, body: `🎉 Pedido Confirmado - KZSTORE\n\nPedido: #${orderConverted.order_number}\nTotal: ${Number(orderConverted.total || 0).toLocaleString('pt-AO')} Kz` });
            console.log('🔔 WhatsApp notification sent for order', orderConverted.order_number);
          } catch (err) {
            console.error('❌ Failed to send WhatsApp notification for order', orderConverted.order_number, err);
          }
        }
      } catch (err) {
        console.error('Error in async WhatsApp notification for order', err);
      }
    })();

    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Criar pedido (permite guests)
app.post('/api/orders', optionalAuthMiddleware, async (req: any, res) => {
  try {
    // Forçar user_id correto se autenticado
    let data = req.body;
    // Sempre confiar no user id do token, não no body
    const userIdFromToken = req.userId as string;
    debugLog('🟢 [POST /api/orders] Recebido pedido request by user:', userIdFromToken, 'body.user_id:', data.user_id);
    data.user_id = userIdFromToken;
    if (data.user_id === 'guest' || !data.user_id) {
      // Aqui você pode implementar lógica para pegar do token JWT futuramente
      // Por enquanto, mantém como guest para pedidos de visitantes
      // Se quiser bloquear pedidos de guest, descomente a linha abaixo:
      // return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    if (!data.user_id) {
      return res.status(400).json({ error: 'user_id obrigatório' });
    }
    const order = await prisma.order.create({
      data,
    });
    debugLog('🟢 [POST /api/orders] Pedido salvo com user_id:', order.user_id, '| Pedido:', order.id);
    
    // 📧 Enviar email de confirmação
    try {
      // Para guests, usar dados do próprio pedido. Para usuários logados, buscar perfil completo
      let customerEmail = order.user_email;
      let customerName = order.user_name;
      
      // Se não for guest, tentar buscar dados completos do usuário
      if (order.user_id && order.user_id !== 'guest') {
        const user = await prisma.user.findUnique({
          where: { id: order.user_id }
        });
        
        if (user) {
          customerEmail = user.email || customerEmail;
          customerName = user.name || customerName;
        } else {
          // Tentar CustomerProfile
          const customerProfile = await prisma.customerProfile.findUnique({
            where: { id: order.user_id }
          });
          if (customerProfile) {
            customerEmail = customerProfile.email || customerEmail;
            customerName = customerProfile.nome || customerName;
          }
        }
      }
      
      // Enviar email se tiver email válido
      if (customerEmail) {
        debugLog(`📧 [ORDERS] Enviando email de confirmação para: ${customerEmail} (${order.user_id === 'guest' ? 'GUEST' : 'USER'})`);
        debugLog(`📧 [ORDERS] Dados do pedido:`, {
          items: typeof order.items,
          shipping_address: typeof order.shipping_address
        });
        
        // Parse dos items do pedido
        let items: Array<{ name: string; quantity: number; price: number }> = [];
        try {
          let parsedItems: any = order.items;
          
          // Se for string, fazer parse
          if (typeof order.items === 'string') {
            parsedItems = JSON.parse(order.items);
          }
          
          // Converter para formato esperado
          if (Array.isArray(parsedItems)) {
            items = parsedItems.map((item: any) => ({
              name: item.nome || item.name || item.product_name || 'Produto',
              quantity: item.quantity || item.quantidade || 1,
              price: item.price || item.preco_aoa || item.preco || 0
            }));
          }
          
          debugLog(`📧 [ORDERS] Items parseados:`, items);
        } catch (e) {
          console.error('❌ [ORDERS] Erro ao parsear items:', e);
          items = [{ name: 'Produto', quantity: 1, price: Number(order.total) }];
        }
        
        // Parse do endereço
        let shippingAddress = 'Endereço não informado';
        try {
          let parsedAddress: any = order.shipping_address;
          
          // 🔍 LOG DETALHADO DO ENDEREÇO RAW
          debugLog(`📧 [ORDERS] 🔍 RAW shipping_address:`, JSON.stringify(order.shipping_address, null, 2));
          debugLog(`📧 [ORDERS] 🔍 Tipo: ${typeof order.shipping_address}`);
          
          // Se for string, tentar parse
          if (typeof order.shipping_address === 'string') {
            try {
              parsedAddress = JSON.parse(order.shipping_address);
              debugLog(`📧 [ORDERS] 🔍 Após JSON.parse:`, JSON.stringify(parsedAddress, null, 2));
            } catch {
              // Se não for JSON, usar como string mesmo
              shippingAddress = order.shipping_address;
              debugLog(`📧 [ORDERS] 🔍 Não é JSON, usando como string`);
            }
          }
          
          // Se for objeto, formatar
          if (typeof parsedAddress === 'object' && parsedAddress !== null) {
            const addr = parsedAddress;
            debugLog(`📧 [ORDERS] 🔍 Objeto detectado. Keys:`, Object.keys(addr));
            debugLog(`📧 [ORDERS] 🔍 Valores:`, JSON.stringify(addr, null, 2));
            
            // Formato: Cada campo em uma linha
            const addressParts = [
              addr.full_name || addr.nome || addr.name,
              addr.address || addr.endereco || addr.street,
              addr.city || addr.cidade,
              addr.province || addr.provincia || addr.state || addr.estado,
              addr.phone || addr.telefone || addr.zip || addr.cep
            ].filter(Boolean);
            
            shippingAddress = addressParts.join('<br>');
          }
          
          debugLog(`📧 [ORDERS] ✅ Endereço final formatado:`, shippingAddress);
        } catch (e) {
          console.error('❌ [ORDERS] Erro ao parsear endereço:', e);
        }
        
        const emailHtml = generateOrderConfirmationEmail({
          orderId: order.order_number,
          customerName: customerName || customerEmail,
          items: items,
          total: Number(order.total),
          shippingAddress: shippingAddress
        });
        
        await sendEmail({
          to: customerEmail,
          subject: '🎉 Pedido Confirmado - KZSTORE',
          html: emailHtml
        });
        
        console.log(`✅ [ORDERS] Email de confirmação enviado para: ${customerEmail}`);
      } else {
        console.log(`⚠️  [ORDERS] Pedido sem email válido, pulando envio`);
      }
    } catch (emailError) {
      console.error('❌ [ORDERS] Erro ao enviar email de confirmação:', emailError);
      // Não falhar o pedido se o email falhar
    }
    
    // 📱 Enviar notificação WhatsApp para o CLIENTE (async - não bloqueia resposta)
    (async () => {
      try {
        let phone: string | null = null;
        
        // Tentar pegar telefone do shipping_address
        if (order.shipping_address) {
          const addr = typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address;
          phone = addr?.phone || addr?.telefone || addr?.telefone_principal || null;
        }
        
        // Se não encontrou, tentar pegar do perfil do cliente
        if (!phone && order.user_email) {
          const customer = await prisma.customerProfile.findUnique({ 
            where: { email: order.user_email } 
          });
          if (customer) phone = customer.telefone || null;
        }
        
        // Enviar WhatsApp se tiver telefone e configuração do Twilio
        if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
          console.log(`📱 [ORDERS] Iniciando envio WhatsApp para cliente: ${phone}`);
          const message = `🎉 Pedido Confirmado - KZSTORE\n\nPedido: #${order.order_number}\nTotal: ${Number(order.total || 0).toLocaleString('pt-AO')} Kz\n\nObrigado pela sua compra!`;
          
          const result = await enqueueWhatsApp({ 
            to: `whatsapp:${phone}`, 
            body: message 
          });
          
          console.log(`✅ [ORDERS] WhatsApp para cliente processado:`, result);
        } else {
          if (!phone) {
            console.log(`⚠️  [ORDERS] Cliente sem telefone, pulando WhatsApp`);
          } else {
            console.log(`⚠️  [ORDERS] Twilio não configurado, pulando WhatsApp`);
          }
        }
      } catch (whatsappError) {
        console.error('❌ [ORDERS] Erro ao enviar WhatsApp para cliente:', whatsappError);
      }
    })();
    
    // 📧📱 Enviar notificação para ADMIN
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@kzstore.ao';
      const adminWhatsApp = process.env.ADMIN_WHATSAPP;
      
      console.log(`🔍 [ADMIN NOTIF] Configuração:`, {
        adminEmail,
        adminWhatsApp,
        twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID
      });
      
      // Email para admin
      if (adminEmail) {
        console.log(`📧 [ORDERS] Enviando notificação de novo pedido para admin: ${adminEmail}`);
        
        const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #E31E24;">🔔 Novo Pedido Recebido!</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Pedido:</strong> #${order.order_number}</p>
              <p><strong>Cliente:</strong> ${order.user_name}</p>
              <p><strong>Email:</strong> ${order.user_email}</p>
              <p><strong>Total:</strong> ${Number(order.total).toLocaleString('pt-AO')} Kz</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Método de Pagamento:</strong> ${order.payment_method}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="https://kzstore.ao/admin" style="background: #E31E24; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ver Pedido no Painel Admin
              </a>
            </p>
          </div>
        `;
        
        const emailResult = await sendEmail({
          to: adminEmail,
          subject: `🔔 Novo Pedido #${order.order_number} - KZSTORE`,
          html: adminEmailHtml
        });
        
        console.log(`✅ [ORDERS] Email para admin resultado:`, emailResult);
      } else {
        console.log(`⚠️  [ORDERS] ADMIN_EMAIL não configurado, pulando email para admin`);
      }
      
      // WhatsApp para admin (async - não bloqueia resposta)
      if (adminWhatsApp && process.env.TWILIO_ACCOUNT_SID) {
        console.log(`📱 [ORDERS] Iniciando envio WhatsApp para admin: ${adminWhatsApp}`);
        const adminMessage = `🔔 NOVO PEDIDO - KZSTORE\n\nPedido: #${order.order_number}\nCliente: ${order.user_name}\nTotal: ${Number(order.total).toLocaleString('pt-AO')} Kz\n\nAcesse: https://kzstore.ao/admin`;
        
        // Fire and forget - não aguardar resposta do Twilio
        enqueueWhatsApp({
          to: `whatsapp:${adminWhatsApp}`,
          body: adminMessage
        }).then((result) => {
          console.log(`✅ [ORDERS] WhatsApp para admin enviado:`, result);
        }).catch((err) => {
          console.error(`❌ [ORDERS] Erro WhatsApp admin:`, err);
        });
      } else {
        console.log(`⚠️  [ORDERS] ADMIN_WHATSAPP ou Twilio não configurado, pulando WhatsApp para admin`);
      }
    } catch (adminNotificationError) {
      console.error('❌ [ORDERS] Erro ao enviar notificação para admin:', adminNotificationError);
    }
    
    const orderConverted = convertDecimalsToNumbers(order);
    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - TEMPORÁRIO: Listar usuários (apenas admins)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
    
    res.json({ users, total: users.length });
  } catch (error: any) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:email - TEMPORÁRIO: Apagar usuário específico
app.delete('/api/admin/users/:email', requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    
    // Proteção: não permitir apagar admin@kzstore.ao
    if (email === 'admin@kzstore.ao') {
      return res.status(403).json({ error: 'Não é permitido apagar este admin' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    await prisma.user.delete({ where: { email } });
    
    console.log(`🗑️ [ADMIN] Usuário ${email} apagado por ${req.userEmail}`);
    
    res.json({ 
      success: true, 
      message: `Usuário ${email} apagado com sucesso`,
      deleted: user
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/status - Atualizar status do pedido
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    
    console.log(`🔄 [ORDERS] Updating order ${id} status to: ${status}`);
    console.log(`📋 [ORDERS] Additional data:`, additionalData);
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
        ...additionalData,
      },
    });
    
    const orderConverted = convertDecimalsToNumbers(order);
    console.log(`✅ [ORDERS] Order ${order.order_number} updated successfully`);
    console.log(`📦 [ORDERS] New status: ${status}, User ID: ${order.user_id}`);
    
    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('❌ [ORDERS] Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/payment - Atualizar status de pagamento
app.patch('/api/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        payment_status,
        updated_at: new Date(),
      },
    });
    
    const orderConverted = convertDecimalsToNumbers(order);
    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/tracking - Adicionar número de rastreamento
app.patch('/api/orders/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, status } = req.body;
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        tracking_number,
        status: status || 'shipped',
        updated_at: new Date(),
      },
    });
    
    const orderConverted = convertDecimalsToNumbers(order);
    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('Error adding tracking number:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WHATSAPP MESSAGE ROUTES (Twilio)
// ============================================

// POST /api/whatsapp/send - Enviar mensagem WhatsApp (Admin only)
app.post('/api/whatsapp/send', requireAdmin, async (req: any, res) => {
  try {
    const { to, body, contentSid, contentVariables } = req.body;
    if (!to) return res.status(400).json({ error: 'to (E.164 number) is required' });
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const result = await sendWhatsAppTemplate({ to: toFormatted, contentSid, contentVariables, body });
    // Optionally, log to DB
    try {
      await prisma.whatsAppMessage.create({
        data: {
          message_sid: result?.sid,
          to: toFormatted,
          from: process.env.TWILIO_WHATSAPP_NUMBER || '',
          template_sid: contentSid || null,
          body: body || (contentVariables && JSON.stringify(contentVariables)) || null,
          status: 'sent',
          metadata: { raw: result },
        }
      });
    } catch (err) {
      console.error('Error logging WhatsApp message to DB', err);
    }

    res.json({ success: true, sid: result?.sid });
  } catch (err: any) {
    console.error('Error sending WhatsApp message', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// POST /api/whatsapp/status - Twilio webhook for message status updates
app.post('/api/whatsapp/status', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const twilioSignature = req.get('x-twilio-signature') || '';
    // Validate the request signature if secret is configured
    try {
      if (process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WEBHOOK_SECRET) {
        const twilioLib = require('twilio');
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const valid = twilioLib.validateRequest(process.env.TWILIO_AUTH_TOKEN, String(twilioSignature), url, req.body);
        if (!valid) {
          console.warn('⚠️ Twilio signature validation failed');
          return res.sendStatus(403);
        }
      }
    } catch (valErr) {
      console.warn('Twilio validation step threw', valErr);
    }
    // Twilio posts form-encoded data (MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage)
    const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = req.body;
    console.log('📬 Twilio status webhook:', { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage });
    // Update DB record if present
    try {
      const existing = await prisma.whatsAppMessage.findUnique({ where: { message_sid: MessageSid } });
      if (existing) {
        await prisma.whatsAppMessage.update({ where: { id: existing.id }, data: { status: MessageStatus, error_code: ErrorCode ? Number(ErrorCode) : null, error_message: ErrorMessage || null } });
      }
    } catch (dbErr) {
      console.error('Error updating WhatsApp message status in DB', dbErr);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in Twilio webhook', err);
    res.sendStatus(500);
  }
});

// DELETE /api/orders/:id - Deletar pedido
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REVIEWS ROUTES
// ============================================

// GET /api/reviews - Buscar todos ou filtrar por query params
app.get('/api/reviews', async (req: any, res) => {
  try {
    const { product_id, user_email, status, mine } = req.query;
    
    const where: any = {};
    if (product_id) where.product_id = product_id as string;
    if (user_email) where.user_email = user_email as string;
    if (status) where.status = status as string;
    
    // If `mine=true` is passed, require auth and filter to logged-in user
    if (mine === 'true') {
      if (!req.cookies || !req.cookies.kz_jwt) {
        return res.status(401).json({ error: 'Autenticação necessária' });
      }
      // authMiddleware will attach req.userId
      try {
        // Reuse authMiddleware
        await new Promise((resolve, reject) => authMiddleware(req, res, (err?: any) => (err ? reject(err) : resolve(true))));
      } catch (err) {
        return res.status(401).json({ error: 'Autenticação inválida' });
      }
      if (req.userId) where.user_id = req.userId;
    }
    
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    res.json({ reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:id - Buscar review por ID
app.get('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id },
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ review });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reviews - Criar review (usuários autenticados somente)
app.post('/api/reviews', authMiddleware, async (req: any, res) => {
  try {
    console.log('📝 [REVIEWS] Creating review with data:', req.body);
    
    // Validar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: req.body.product_id }
    });
    
    if (!product) {
      console.error('❌ [REVIEWS] Product not found:', req.body.product_id);
      return res.status(404).json({ 
        error: 'Product not found',
        details: `Product with id ${req.body.product_id} does not exist`
      });
    }
    
    // Criar review apenas com campos válidos
    const reviewData: any = {
      product_id: req.body.product_id,
      user_name: req.body.user_name,
      user_email: req.body.user_email,
      rating: req.body.rating,
      comment: req.body.comment || '',
      status: 'approved', // 🔥 AUTO-APROVAR para aparecer imediatamente
      is_approved: true,
    };
    
    // Sempre associar o review ao usuário autenticado
    if (req.userId) {
      reviewData.user_id = req.userId;
    }
    
    console.log('📝 [REVIEWS] Clean data for Prisma:', reviewData);
    
    const review = await prisma.review.create({
      data: reviewData,
    });
    console.log('✅ [REVIEWS] Review created successfully:', review.id);
    res.status(201).json({ review, message: 'Review submitted successfully. Pending approval.' });
  } catch (error: any) {
    console.error('❌ [REVIEWS] Error creating review:', error);
    console.error('❌ [REVIEWS] Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Failed to create review',
      details: error.message,
      code: error.code,
      hint: error.meta?.target || null
    });
  }
});

// PUT /api/reviews/:id - Atualizar review (apenas autor ou admin)
app.put('/api/reviews/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Verificar se o usuário é o autor ou é admin
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrado' });
    if (existing.user_id !== req.userId) {
      // Verificar admin
      const user = await prisma.customerProfile.findUnique({ where: { id: req.userId } });
      if (!user || (user.role !== 'admin' && !user.is_admin)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }
    const review = await prisma.review.update({ where: { id }, data: req.body });
    res.json({ review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reviews/:id - Deletar review (apenas autor ou admin)
app.delete('/api/reviews/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrado' });
    if (existing.user_id !== req.userId) {
      const user = await prisma.customerProfile.findUnique({ where: { id: req.userId } });
      if (!user || (user.role !== 'admin' && !user.is_admin)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }
    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COUPONS ROUTES
// ============================================

// GET /api/coupons - Buscar todos os cupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { created_at: 'desc' },
    });
    const couponsConverted = convertDecimalsToNumbers(coupons);
    res.json({ coupons: couponsConverted });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/active - Buscar cupons ativos
app.get('/api/coupons/active', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        is_active: true,
        OR: [
          { valid_until: null },
          { valid_until: { gte: now } }
        ]
      },
      orderBy: { created_at: 'desc' },
    });
    
    // Filtrar cupons com limite de uso
    const validCoupons = coupons.filter(coupon => {
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return false;
      }
      return true;
    });
    
    const couponsConverted = convertDecimalsToNumbers(validCoupons);
    res.json({ coupons: couponsConverted });
  } catch (error: any) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/code/:code - Buscar cupom por código
app.get('/api/coupons/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }
    
    const couponConverted = convertDecimalsToNumbers(coupon);
    res.json({ coupon: couponConverted });
  } catch (error: any) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/:code - Validar cupom (legacy route)
app.get('/api/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }
    
    if (!coupon.is_active) {
      return res.status(400).json({ error: 'Cupom inativo' });
    }
    
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Cupom atingiu limite de uso' });
    }
    
    res.json({ coupon });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/coupons - Criar cupom
app.post('/api/coupons', async (req, res) => {
  try {
    const coupon = await prisma.coupon.create({
      data: req.body,
    });
    const couponConverted = convertDecimalsToNumbers(coupon);
    res.json({ coupon: couponConverted });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/coupons/:id - Atualizar cupom
app.put('/api/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: req.body,
    });
    const couponConverted = convertDecimalsToNumbers(coupon);
    res.json({ coupon: couponConverted });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/coupons/:id - Deletar cupom
app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AFFILIATES ROUTES (Sistema de Afiliados)
// ============================================

// GET /api/affiliates - Buscar todos os afiliados
app.get('/api/affiliates', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            clicks: true,
            commissions: true,
          },
        },
      },
    });
    res.json({ affiliates });
  } catch (error: any) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/affiliates/stats - Estatísticas gerais de afiliados
app.get('/api/affiliates/stats', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const totalAffiliates = await prisma.affiliate.count();
    const activeAffiliates = await prisma.affiliate.count({
      where: { status: 'active' },
    });
    
    const aggregates = await prisma.affiliate.aggregate({
      _sum: {
        total_sales: true,
        total_commission: true,
        pending_commission: true,
        paid_commission: true,
        total_clicks: true,
      },
    });

    res.json({
      total: totalAffiliates,
      active: activeAffiliates,
      totalSales: aggregates._sum.total_sales || 0,
      totalCommission: aggregates._sum.total_commission || 0,
      pendingCommission: aggregates._sum.pending_commission || 0,
      paidCommission: aggregates._sum.paid_commission || 0,
      totalClicks: aggregates._sum.total_clicks || 0,
    });
  } catch (error: any) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/affiliates/code/:code - Buscar afiliado por código
app.get('/api/affiliates/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const affiliate = await prisma.affiliate.findUnique({
      where: { affiliate_code: code },
    });
    
    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }
    
    res.json({ affiliate });
  } catch (error: any) {
    console.error('Error fetching affiliate by code:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/affiliates/:id - Buscar afiliado por ID
app.get('/api/affiliates/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        clicks: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        commissions: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
      },
    });
    
    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }
    
    res.json({ affiliate });
  } catch (error: any) {
    console.error('Error fetching affiliate:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/affiliates - Criar novo afiliado
app.post('/api/affiliates', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const {
      name,
      email,
      phone,
      commission_rate,
      bank_name,
      account_holder,
      account_number,
      iban,
    } = req.body;

    // Gerar código único de afiliado
    const codeBase = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Verificar se código já existe
    let affiliate_code = codeBase;
    let counter = 1;
    while (await prisma.affiliate.findUnique({ where: { affiliate_code } })) {
      affiliate_code = `${codeBase}${counter}`;
      counter++;
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        phone,
        affiliate_code,
        commission_rate: parseFloat(commission_rate),
        bank_name,
        account_holder,
        account_number,
        iban,
        status: 'active',
        is_active: true,
      },
    });

    res.status(201).json({ affiliate });
  } catch (error: any) {
    console.error('Error creating affiliate:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/affiliates/:id - Atualizar afiliado
app.put('/api/affiliates/:id', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      commission_rate,
      bank_name,
      account_holder,
      account_number,
      iban,
      status,
      is_active,
    } = req.body;

    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        commission_rate: commission_rate ? parseFloat(commission_rate) : undefined,
        bank_name,
        account_holder,
        account_number,
        iban,
        status,
        is_active,
      },
    });

    res.json({ affiliate });
  } catch (error: any) {
    console.error('Error updating affiliate:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/affiliates/:id - Deletar afiliado
app.delete('/api/affiliates/:id', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.affiliate.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting affiliate:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/affiliates/track-click - Registrar clique de afiliado (público)
app.post('/api/affiliates/track-click', async (req, res) => {
  try {
    const { affiliate_code, product_id, product_name } = req.body;
    
    // Buscar afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { affiliate_code },
    });
    
    if (!affiliate || !affiliate.is_active) {
      return res.status(404).json({ error: 'Afiliado não encontrado ou inativo' });
    }

    // Registrar clique
    const click = await prisma.affiliateClick.create({
      data: {
        affiliate_id: affiliate.id,
        product_id,
        product_name,
        ip_address: req.ip || req.headers['x-forwarded-for'] as string,
        user_agent: req.headers['user-agent'],
        referrer: req.headers['referer'],
      },
    });

    // Atualizar contador de cliques
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        total_clicks: {
          increment: 1,
        },
      },
    });

    res.json({ success: true, click_id: click.id });
  } catch (error: any) {
    console.error('Error tracking affiliate click:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/affiliates/convert-sale - Registrar conversão de venda
app.post('/api/affiliates/convert-sale', authMiddleware, async (req: any, res) => {
  try {
    const { click_id, order_id } = req.body;

    // Buscar o clique
    const click = await prisma.affiliateClick.findUnique({
      where: { id: click_id },
      include: { affiliate: true },
    });

    if (!click) {
      return res.status(404).json({ error: 'Clique não encontrado' });
    }

    // Buscar o pedido
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Marcar clique como convertido
    await prisma.affiliateClick.update({
      where: { id: click_id },
      data: {
        converted: true,
        order_id,
      },
    });

    // Calcular comissão
    const commission_amount = (Number(order.total) * Number(click.affiliate.commission_rate)) / 100;

    // Criar registro de comissão
    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliate_id: click.affiliate.id,
        order_id,
        order_total: order.total,
        commission_rate: click.affiliate.commission_rate,
        commission_amount,
        status: 'pending',
      },
    });

    // Atualizar estatísticas do afiliado
    await prisma.affiliate.update({
      where: { id: click.affiliate.id },
      data: {
        total_sales: {
          increment: Number(order.total),
        },
        total_commission: {
          increment: commission_amount,
        },
        pending_commission: {
          increment: commission_amount,
        },
      },
    });

    res.json({ success: true, commission });
  } catch (error: any) {
    console.error('Error converting sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/affiliates/commissions/:id/pay - Marcar comissão como paga
app.put('/api/affiliates/commissions/:id/pay', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_reference, payment_notes } = req.body;

    const commission = await prisma.affiliateCommission.findUnique({
      where: { id },
    });

    if (!commission) {
      return res.status(404).json({ error: 'Comissão não encontrada' });
    }

    // Atualizar comissão
    const updatedCommission = await prisma.affiliateCommission.update({
      where: { id },
      data: {
        status: 'paid',
        paid_at: new Date(),
        payment_method,
        payment_reference,
        payment_notes,
      },
    });

    // Atualizar estatísticas do afiliado
    await prisma.affiliate.update({
      where: { id: commission.affiliate_id },
      data: {
        pending_commission: {
          decrement: Number(commission.commission_amount),
        },
        paid_commission: {
          increment: Number(commission.commission_amount),
        },
      },
    });

    res.json({ commission: updatedCommission });
  } catch (error: any) {
    console.error('Error paying commission:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/affiliates/:id/commissions - Buscar comissões de um afiliado
app.get('/api/affiliates/:id/commissions', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where: any = { affiliate_id: id };
    if (status) {
      where.status = status;
    }

    const commissions = await prisma.affiliateCommission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            order_number: true,
            user_name: true,
            created_at: true,
          },
        },
      },
    });

    res.json({ commissions });
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/affiliates/:id/clicks - Buscar cliques de um afiliado
app.get('/api/affiliates/:id/clicks', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { converted } = req.query;

    const where: any = { affiliate_id: id };
    if (converted !== undefined) {
      where.converted = converted === 'true';
    }

    const clicks = await prisma.affiliateClick.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
      include: {
        product: {
          select: {
            nome: true,
            imagem_url: true,
          },
        },
      },
    });

    res.json({ clicks });
  } catch (error: any) {
    console.error('Error fetching clicks:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CUSTOMERS ROUTES
// ============================================

// GET /api/customers - Buscar todos os clientes
app.get('/api/customers', authMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const customers = await prisma.customerProfile.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/:id - Buscar cliente por ID
app.get('/api/customers/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    // Only admin or the customer themselves can fetch this data
    if (req.userId !== customer.id) {
      const user = await prisma.customerProfile.findUnique({ where: { id: req.userId } });
      if (!user || (user.role !== 'admin' && !user.is_admin)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }
    res.json({ customer });
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/email/:email - Buscar cliente por email
app.get('/api/customers/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const customer = await prisma.customerProfile.findUnique({
      where: { email },
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ customer });
  } catch (error: any) {
    console.error('Error fetching customer by email:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customers - Criar cliente
app.post('/api/customers', requireAdmin, async (req, res) => {
  try {
    const customer = await prisma.customerProfile.create({
      data: req.body,
    });
    res.json({ customer });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/customers/:id - Atualizar cliente
app.put('/api/customers/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.customerProfile.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    // Only admin or the owner can update
    if (req.userId !== existing.id) {
      const user = await prisma.customerProfile.findUnique({ where: { id: req.userId } });
      if (!user || (user.role !== 'admin' && !user.is_admin)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }
    const customer = await prisma.customerProfile.update({
      where: { id },
      data: req.body,
    });
    res.json({ customer });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/customers/:id - Deletar cliente
app.delete('/api/customers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customerProfile.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FLASH SALES ROUTES
// ============================================

// GET /api/flash-sales - Buscar flash sales ativas
app.get('/api/flash-sales', async (req, res) => {
  try {
    const { product_id } = req.query;
    const now = new Date();
    console.log('🔍 [GET /api/flash-sales] Current time:', now);
    console.log('🔍 [GET /api/flash-sales] Filter by product_id:', product_id);
    
    // Primeiro busca TODOS os flash sales para debug
    const allFlashSales = await prisma.flashSale.findMany({
      include: {
        product: true,
      },
    });
    console.log('🔍 [GET /api/flash-sales] Total flash sales in DB:', allFlashSales.length);
    allFlashSales.forEach(sale => {
      console.log(`  - ID: ${sale.id}, is_active: ${sale.is_active}, start: ${sale.start_date}, end: ${sale.end_date}`);
    });
    
    // Montar where clause
    const where: any = {
      is_active: true,
      start_date: { lte: now },
      end_date: { gte: now },
    };
    
    // Filtrar por produto específico se fornecido
    if (product_id) {
      where.product_id = product_id as string;
    }
    
    // Agora busca os ativos no período
    const flashSales = await prisma.flashSale.findMany({
      where,
      include: {
        product: true,
      },
    });
    console.log('🔍 [GET /api/flash-sales] Active flash sales:', flashSales.length);
    
    // Adicionar product_image de cada produto relacionado
    const salesWithImages = flashSales.map(sale => ({
      ...sale,
      product_image: sale.product?.imagem_url || null,
    }));
    
    const converted = convertDecimalsToNumbers({ flashSales: salesWithImages });
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching flash sales:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/flash-sales - Criar flash sale
app.post('/api/flash-sales', async (req, res) => {
  try {
    const saleData = req.body;
    console.log('📝 [POST /api/flash-sales] Received data:', saleData);
    
    const newSale = await prisma.flashSale.create({
      data: {
        product_id: saleData.product_id,
        title: saleData.title || 'Flash Sale',
        description: saleData.description,
        product_name: saleData.product_name,
        original_price: saleData.original_price,
        sale_price: saleData.discounted_price || saleData.sale_price,
        discount_percentage: saleData.discount_percentage,
        stock_limit: saleData.stock_limit || 100,
        stock_sold: 0,
        start_date: new Date(saleData.start_date),
        end_date: new Date(saleData.end_date),
        is_active: saleData.is_active !== false,
      },
      include: {
        product: true,
      },
    });
    
    console.log('✅ [POST /api/flash-sales] Created:', newSale.id);
    
    // Adicionar product_image
    const saleWithImage = {
      ...newSale,
      product_image: newSale.product?.imagem_url || null,
    };
    
    const converted = convertDecimalsToNumbers(saleWithImage);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating flash sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/flash-sales/:id - Atualizar flash sale
app.put('/api/flash-sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedSale = await prisma.flashSale.update({
      where: { id },
      data: {
        product_id: updates.product_id,
        title: updates.title,
        description: updates.description,
        product_name: updates.product_name,
        original_price: updates.original_price,
        sale_price: updates.discounted_price || updates.sale_price,
        discount_percentage: updates.discount_percentage,
        stock_limit: updates.stock_limit,
        stock_sold: updates.stock_sold,
        start_date: updates.start_date ? new Date(updates.start_date) : undefined,
        end_date: updates.end_date ? new Date(updates.end_date) : undefined,
        is_active: updates.is_active,
        updated_at: new Date(),
      },
    });
    
    const converted = convertDecimalsToNumbers(updatedSale);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating flash sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/flash-sales/:id - Deletar flash sale
app.delete('/api/flash-sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.flashSale.delete({
      where: { id },
    });
    
    res.json({ message: 'Flash sale deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting flash sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRICE ALERTS ROUTES
// ============================================
// GET /api/loyalty/account - Buscar conta por email
app.get('/api/loyalty/account', authMiddleware, async (req: any, res) => {
  try {
    const { user_email } = req.query;
    const reqUserEmail = req.userEmail as string | undefined;

    if (!user_email && !reqUserEmail) {
      return res.status(400).json({ error: 'user_email required' });
    }

    const email = (user_email as string) || reqUserEmail;
    const account = await prisma.loyaltyAccount.findUnique({ where: { user_email: email } });
    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }
    res.json({ account });
  } catch (error: any) {
    console.error('Error fetching loyalty account:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loyalty/history - Buscar histórico por email
app.get('/api/loyalty/history', authMiddleware, async (req: any, res) => {
  try {
    const { user_email } = req.query;
    const reqUserEmail = req.userEmail as string | undefined;
    const email = (user_email as string) || reqUserEmail;
    if (!email) return res.status(400).json({ error: 'user_email required' });

    const history = await prisma.loyaltyHistory.findMany({ where: { user_email: email }, orderBy: { created_at: 'desc' } });
    res.json({ history });
  } catch (error: any) {
    console.error('Error fetching loyalty history:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loyalty/redeem - Resgatar pontos (auth required)
app.post('/api/loyalty/redeem', authMiddleware, async (req: any, res) => {
  try {
    const { points, reason } = req.body;
    const userEmail = req.userEmail as string;
    if (!points || points <= 0) return res.status(400).json({ error: 'Invalid points' });
    const account = await prisma.loyaltyAccount.findUnique({ where: { user_email: userEmail } });
    if (!account) return res.status(404).json({ error: 'Loyalty account not found' });
    if (account.points < points) return res.status(400).json({ error: 'Insufficient points' });

    // Deduct points and add history
    const newPoints = account.points - points;
    await prisma.loyaltyAccount.update({ where: { user_email: userEmail }, data: { points: newPoints, total_spent: account.total_spent + points } });

    await prisma.loyaltyHistory.create({ data: { user_email: userEmail, type: 'redeemed', points, reason: reason || 'redeem', balance_after: newPoints } });

    const updatedAccount = await prisma.loyaltyAccount.findUnique({ where: { user_email: userEmail } });
    res.json({ success: true, account: updatedAccount });
  } catch (error: any) {
    console.error('Error redeeming loyalty points:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/price-alerts - Criar alerta de preço
app.post('/api/price-alerts', authMiddleware, async (req: any, res) => {
  try {
    const alertData = req.body;
    const user_id = req.userId as string | undefined;
    
    const newAlert = await prisma.priceAlert.create({ data: {
      product_id: alertData.product_id,
      target_price: alertData.target_price,
      user_email: alertData.user_email,
      user_name: alertData.user_name,
      user_id: user_id || null,
      notified: false,
    } });
    
    const converted = convertDecimalsToNumbers(newAlert);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/price-alerts - Buscar alertas de preço (auth required; admin can filter by email)
app.get('/api/price-alerts', authMiddleware, async (req: any, res) => {
  try {
    const { user_email } = req.query;
    const reqUserEmail = req.userEmail as string | undefined;
    const reqUserRole = req.userRole as string | undefined;
    
    const where: any = {};
    if (reqUserRole === 'admin' && user_email) {
      where.user_email = user_email as string;
    } else if (reqUserEmail) {
      where.user_email = reqUserEmail;
    }
    const alerts = await prisma.priceAlert.findMany({ where, orderBy: { created_at: 'desc' } });
    
    const converted = convertDecimalsToNumbers(alerts);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/price-alerts/:id - Deletar alerta (apenas dono ou admin)
app.delete('/api/price-alerts/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.priceAlert.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Alerta não encontrado' });
    const reqUserEmail = req.userEmail as string | undefined;
    const reqUserRole = req.userRole as string | undefined;
    if (existing.user_email !== reqUserEmail && !(reqUserRole === 'admin' || reqUserRole === 'superadmin')) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    await prisma.priceAlert.delete({ where: { id } });
    
    res.json({ message: 'Price alert deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PRE-ORDERS ROUTES (Pré-vendas)
// ============================================

// POST /api/pre-orders - Criar pré-venda
app.post('/api/pre-orders', async (req, res) => {
  try {
    const data: any = req.body;
    const newPreOrder = await prisma.preOrder.create({
      data: {
        user_name: data.user_name,
        user_email: data.user_email,
        product_id: data.product_id,
        product_name: data.product_name,
        quantity: data.quantity,
        price: data.price,
        total: data.total,
        estimated_delivery: data.estimated_delivery,
        paid_amount: data.paid_amount || 0,
        payment_proof: data.payment_proof,
        notes: data.notes,
        status: data.status || 'pending',
        payment_status: data.payment_status || 'pending',
      },
    });

    const converted = convertDecimalsToNumbers(newPreOrder);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating pre-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/pre-orders - Listar pré-vendas
app.get('/api/pre-orders', async (req, res) => {
  try {
    const { user_email, status } = req.query;
    const where: any = {};
    if (user_email) where.user_email = user_email as string;
    if (status) where.status = status as string;

    const preOrders = await prisma.preOrder.findMany({ where, orderBy: { created_at: 'desc' } });
    const converted = convertDecimalsToNumbers(preOrders);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching pre-orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/pre-orders/:id - Atualizar pré-venda
app.put('/api/pre-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const data: any = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.payment_status !== undefined) data.payment_status = updates.payment_status;
    if (updates.paid_amount !== undefined) data.paid_amount = updates.paid_amount;
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.estimated_delivery !== undefined) data.estimated_delivery = updates.estimated_delivery;
    
    const updatedPreOrder = await prisma.preOrder.update({
      where: { id },
      data,
    });
    
    const converted = convertDecimalsToNumbers(updatedPreOrder);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating pre-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/pre-orders/:id - Deletar pré-venda
app.delete('/api/pre-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.preOrder.delete({
      where: { id },
    });
    
    res.json({ message: 'Pre-order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pre-order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADVERTISEMENTS ROUTES (Anúncios/Banners)
// ============================================

// GET /api/ads - Listar anúncios
app.get('/api/ads', async (req, res) => {
  try {
    const { posicao, ativo } = req.query;
    
    const where: any = {};
    if (posicao) where.posicao = posicao as string;
    if (ativo !== undefined) where.ativo = ativo === 'true';
    
    // Buscar apenas anúncios dentro do período ativo
    const now = new Date();
    where.data_inicio = { lte: now };
    where.OR = [
      { data_fim: null },
      { data_fim: { gte: now } }
    ];
    
    console.log('📢 [Ads API] Query filters:', { posicao, ativo, now: now.toISOString() });
    
    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { criado_em: 'desc' },
    });

    console.log(`📢 [Ads API] Found ${ads.length} ads`);

    // Mapear imagem_url_v2 → imagem_url para compatibilidade com frontend
    const converted = convertDecimalsToNumbers(ads).map((ad: any) => ({
      ...ad,
      imagem_url: ad.imagem_url_v2,
    }));

    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads - Criar anúncio
app.post('/api/ads', async (req, res) => {
  try {
    const data = req.body;
    
    const newAd = await prisma.advertisement.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        imagem_url_v2: data.imagem_url,
        link_url: data.link_url,
        posicao: data.posicao,
        tipo: data.tipo || 'banner',
        ativo: data.ativo !== undefined ? data.ativo : true,
        data_inicio: new Date(data.data_inicio),
        data_fim: data.data_fim ? new Date(data.data_fim) : null,
        cliques: 0,
        visualizacoes: 0,
        criado_por: data.criado_por || 'admin',
      },
    });
    
    const converted = convertDecimalsToNumbers(newAd);
    res.json(converted);
  } catch (error: any) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/ads/:id - Atualizar anúncio
app.put('/api/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 [PUT /api/ads/:id] Atualizando anúncio:', id);
    console.log('📝 [PUT /api/ads/:id] URL da imagem length:', updates.imagem_url?.length || 0);

    // Usar raw SQL para bypass validação do Prisma (temporário até cache limpar)
    if (updates.imagem_url) {
      await prisma.$executeRawUnsafe(`
        UPDATE advertisements
        SET imagem_url_v2 = ?,
            titulo = ?,
            descricao = ?,
            link_url = ?,
            posicao = ?,
            tipo = ?,
            ativo = ?,
            data_inicio = ?,
            data_fim = ?,
            atualizado_em = NOW()
        WHERE id = ?
      `,
        updates.imagem_url,
        updates.titulo || 'Anúncio',
        updates.descricao || null,
        updates.link_url || null,
        updates.posicao || 'home-hero-banner',
        updates.tipo || 'banner',
        updates.ativo !== undefined ? (updates.ativo ? 1 : 0) : 1,
        updates.data_inicio ? new Date(updates.data_inicio) : null,
        updates.data_fim ? new Date(updates.data_fim) : null,
        id
      );
      
      // Buscar registro atualizado
      const updatedAd = await prisma.advertisement.findUnique({
        where: { id }
      });

      const converted = convertDecimalsToNumbers(updatedAd);
      // Mapear imagem_url_v2 → imagem_url para compatibilidade com frontend
      return res.json({ ...converted, imagem_url: converted.imagem_url_v2 });
    }
    
    // Se não tem imagem_url, usar método normal
    const data: any = {};
    if (updates.titulo) data.titulo = updates.titulo;
    if (updates.descricao !== undefined) data.descricao = updates.descricao;
    if (updates.link_url !== undefined) data.link_url = updates.link_url;
    if (updates.posicao) data.posicao = updates.posicao;
    if (updates.tipo) data.tipo = updates.tipo;
    if (updates.ativo !== undefined) data.ativo = updates.ativo;
    if (updates.data_inicio) data.data_inicio = new Date(updates.data_inicio);
    if (updates.data_fim !== undefined) data.data_fim = updates.data_fim ? new Date(updates.data_fim) : null;
    
    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data,
    });

    const converted = convertDecimalsToNumbers(updatedAd);
    // Mapear imagem_url_v2 → imagem_url para compatibilidade com frontend
    res.json({ ...converted, imagem_url: converted.imagem_url_v2 });
  } catch (error: any) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/ads/:id - Deletar anúncio
app.delete('/api/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.advertisement.delete({
      where: { id },
    });
    
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/:id/impression - Registrar visualização
app.post('/api/ads/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.advertisement.update({
      where: { id },
      data: {
        visualizacoes: { increment: 1 },
      },
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/:id/click - Registrar clique
app.post('/api/ads/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.advertisement.update({
      where: { id },
      data: {
        cliques: { increment: 1 },
      },
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ads/stats - Estatísticas de anúncios
app.get('/api/ads/stats', async (req, res) => {
  try {
    const totalAds = await prisma.advertisement.count();
    const activeAds = await prisma.advertisement.count({ where: { ativo: true } });
    
    const stats = await prisma.advertisement.aggregate({
      _sum: {
        cliques: true,
        visualizacoes: true,
      },
    });
    
    const totalCliques = stats._sum.cliques || 0;
    const totalVisualizacoes = stats._sum.visualizacoes || 0;
    const ctr = totalVisualizacoes > 0 ? (totalCliques / totalVisualizacoes) * 100 : 0;
    
    res.json({
      total_ads: totalAds,
      ads_ativos: activeAds,
      total_cliques: totalCliques,
      total_visualizacoes: totalVisualizacoes,
      ctr: parseFloat(ctr.toFixed(2)),
    });
  } catch (error: any) {
    console.error('Error getting ad stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TICKETS ROUTES
// ============================================

// GET /api/tickets - Buscar tickets do usuário logado ou todos (se admin)
app.get('/api/tickets', authMiddleware, async (req: any, res) => {
  try {
    const { status, category, userId } = req.query;
    
    // Verificar se usuário é admin
    const isAdmin = req.userRole === 'admin' || req.userRole === 'staff';
    
    const where: any = {
      category: {
        not: 'trade-in' // Excluir trade-ins da lista de tickets normais
      }
    };
    
    // Se não for admin, mostrar apenas tickets do próprio usuário
    if (!isAdmin) {
      where.user_id = req.userId;
    } else {
      // Se for admin e especificou userId no query, filtrar por esse userId
      if (userId) where.user_id = userId;
    }
    
    if (status) where.status = status;
    if (category) where.category = category;
    
    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    
    res.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tickets/:id - Buscar ticket por ID
app.get('/api/tickets/:id', authMiddleware, async (req: any, res) => {
  try {
    console.log('[Tickets] Buscando ticket:', req.params.id, 'User:', req.userId);
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    
    if (!ticket) {
      console.log('[Tickets] Ticket não encontrado:', req.params.id);
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    console.log('[Tickets] Ticket encontrado:', ticket.id, 'User ID:', ticket.user_id);
    
    // Check if user is admin first
    let isAdmin = false;
    
    // Try User table first (admin/staff)
    const adminUser = await prisma.user.findUnique({ 
      where: { id: req.userId },
      select: { user_type: true }
    });
    
    console.log('[Tickets] User lookup:', adminUser);
    
    if (adminUser) {
      isAdmin = adminUser.user_type === 'admin';
    } else {
      // Try CustomerProfile
      const customer = await prisma.customerProfile.findUnique({ 
        where: { id: req.userId },
        select: { role: true }
      });
      
      console.log('[Tickets] Customer lookup:', customer);
      
      if (customer) {
        isAdmin = customer.role === 'admin';
      }
    }
    
    console.log('[Tickets] Is admin?', isAdmin);
    
    // Admin can see all tickets, user can only see their own
    if (!isAdmin && ticket.user_id !== req.userId && ticket.user_email !== req.userEmail) {
      console.log('[Tickets] Acesso negado - não é admin e não é dono do ticket');
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    console.log('[Tickets] Acesso permitido, retornando ticket');
    res.json({ ticket });
  } catch (error: any) {
    console.error('[Tickets] ❌ Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets - Criar novo ticket
app.post('/api/tickets', authMiddleware, async (req: any, res) => {
  try {
    const user_id = req.userId as string;
    const { user_name, user_email, subject, category, priority, description } = req.body;
    
    // Gerar número do ticket
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    const ticketNumber = `TK${year}${month}${day}-${random}`;
    
    const ticket = await prisma.ticket.create({
      data: {
        ticket_number: ticketNumber,
        user_id,
        user_name: user_name || undefined,
        user_email: user_email || undefined,
        subject,
        category: category || 'outros',
        priority: priority || 'normal',
        status: 'open',
        description,
        messages: [],
      },
    });
    
    res.status(201).json({ ticket });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets/:id/messages - Adicionar mensagem ao ticket
app.post('/api/tickets/:id/messages', authMiddleware, async (req: any, res) => {
  try {
    const { sender_id, sender_name, message, is_admin } = req.body;
    
    console.log('[Tickets] Adicionando mensagem:', {
      ticketId: req.params.id,
      sender_id,
      sender_name,
      is_admin,
      req_userId: req.userId
    });
    
    // Validate sender identity
    if (sender_id && sender_id !== req.userId) {
      // Check if user is admin (can send on behalf of others)
      let userIsAdmin = false;
      
      // Try User table first
      const adminUser = await prisma.user.findUnique({ 
        where: { id: req.userId },
        select: { user_type: true }
      });
      
      if (adminUser) {
        userIsAdmin = adminUser.user_type === 'admin';
      } else {
        // Try CustomerProfile
        const customer = await prisma.customerProfile.findUnique({ 
          where: { id: req.userId },
          select: { role: true }
        });
        
        if (customer) {
          userIsAdmin = customer.role === 'admin';
        }
      }
      
      if (!userIsAdmin) {
        console.log('[Tickets] ❌ Acesso negado - não é admin e sender_id diferente');
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      console.log('[Tickets] ✅ Admin pode enviar mensagem');
    }
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    
    if (!ticket) {
      console.log('[Tickets] ❌ Ticket não encontrado');
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }
    
    const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
    const newMessage = {
      id: Date.now().toString(),
      sender_id,
      sender_name,
      message,
      is_admin: is_admin || false,
      created_at: new Date().toISOString(),
    };
    
    console.log('[Tickets] Salvando mensagem:', newMessage);
    
    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        messages: [...messages, newMessage],
        status: ticket.status === 'open' && is_admin ? 'in_progress' : ticket.status,
      },
    });
    
    console.log('[Tickets] ✅ Mensagem adicionada com sucesso');
    res.json({ ticket: updatedTicket });
  } catch (error: any) {
    console.error('[Tickets] ❌ Error adding message:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tickets/:id/status - Atualizar status do ticket
app.put('/api/tickets/:id/status', requireAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;
    const updateData: any = { status };
    
    if (status === 'resolved') updateData.resolved_at = new Date();
    if (status === 'closed') updateData.closed_at = new Date();
    
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: updateData,
    });
    
    res.json({ ticket });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tickets/:id/assign - Atribuir ticket a admin
app.put('/api/tickets/:id/assign', requireAdmin, async (req: any, res) => {
  try {
    const { assigned_to } = req.body;
    
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { assigned_to },
    });
    
    res.json({ ticket });
  } catch (error: any) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tickets/:id - Deletar ticket
app.delete('/api/tickets/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.ticket.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tickets/:id/attachments - Adicionar anexo ao ticket
app.post('/api/tickets/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Upload para Cloudflare R2
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const filename = `ticket-${uniqueSuffix}${ext}`;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await r2Client.send(new PutObjectCommand(uploadParams));
    const fileUrl = `${r2PublicUrl}/${filename}`;
    const attachment = {
      id: Date.now().toString(),
      name: req.file!.originalname,
      url: fileUrl,
      size: req.file!.size,
      type: req.file!.mimetype,
      uploaded_at: new Date().toISOString()
    };

    const attachments = Array.isArray(ticket.attachments) ? ticket.attachments : [];
    attachments.push(attachment);

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { attachments }
    });

    res.status(200).json({
      message: 'Anexo adicionado com sucesso',
      attachment,
      ticket: updatedTicket
    });
  } catch (error: any) {
    console.error('Erro ao adicionar anexo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// QUOTES (ORÇAMENTOS) ROUTES
// ============================================

// GET /api/quotes - Buscar orçamentos (Admin: todos, User: próprios)
app.get('/api/quotes', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId as string;

    // Verificar se é admin
    let isAdmin = false;
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true }
    });

    if (adminUser?.user_type === 'admin') {
      isAdmin = true;
    } else {
      const customer = await prisma.customerProfile.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      if (customer?.role === 'admin') {
        isAdmin = true;
      }
    }

    // Se admin: buscar todos, senão: buscar apenas do usuário
    const quotes = await prisma.quote.findMany({
      where: isAdmin ? {} : { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    res.json({ quotes });
  } catch (error: any) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quotes/:id - Buscar orçamento por ID
app.get('/api/quotes/:id', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId as string;
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
    });
    
    if (!quote) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    // Verificar permissão
    let isAdmin = false;
    const adminUser = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { user_type: true }
    });
    
    if (adminUser?.user_type === 'admin') {
      isAdmin = true;
    } else {
      const customer = await prisma.customerProfile.findUnique({ 
        where: { id: userId },
        select: { role: true }
      });
      if (customer?.role === 'admin') {
        isAdmin = true;
      }
    }
    
    if (!isAdmin && quote.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    res.json({ quote });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quotes - Criar novo orçamento
app.post('/api/quotes', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId as string;
    const { user_name, user_email, user_phone, company, requirements, budget } = req.body;

    // Gerar número do orçamento
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    const quoteNumber = `QT${year}${month}${day}-${random}`;

    const quote = await prisma.quote.create({
      data: {
        quote_number: quoteNumber,
        user_id: userId,
        user_name,
        user_email,
        user_phone,
        company: company || null,
        requirements,
        budget: budget ? parseFloat(budget) : null,
        status: 'pending',
        priority: 'normal',
      },
    });

    res.status(201).json({ quote });
  } catch (error: any) {
    console.error('Error creating quote:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/quotes/:id - Atualizar orçamento (Admin responde)
app.put('/api/quotes/:id', requireAdmin, async (req: any, res) => {
  try {
    const { status, admin_proposal, proposed_items, total_amount, admin_notes, assigned_to } = req.body;
    
    const updateData: any = { updated_at: new Date() };
    
    if (status) {
      updateData.status = status;
      if (status === 'sent') updateData.responded_at = new Date();
      if (status === 'accepted') updateData.accepted_at = new Date();
      if (status === 'rejected') updateData.rejected_at = new Date();
    }
    
    if (admin_proposal !== undefined) updateData.admin_proposal = admin_proposal;
    if (proposed_items !== undefined) updateData.proposed_items = proposed_items;
    if (total_amount !== undefined) updateData.total_amount = parseFloat(total_amount);
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: updateData,
    });
    
    console.log('✅ Orçamento atualizado:', quote.quote_number);
    
    res.json({ quote });
  } catch (error: any) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/quotes/:id - Deletar orçamento
app.delete('/api/quotes/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.quote.delete({
      where: { id: req.params.id },
    });
    
    console.log('✅ Orçamento deletado:', req.params.id);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trade-in - Criar solicitação de trade-in
app.post('/api/trade-in', async (req, res) => {
  try {
    const { name, email, phone, brand, model, imei, condition, description, images } = req.body;
    
    console.log('📱 [TRADE-IN] Nova solicitação:', { name, brand, model, images: images?.length || 0 });
    
    // Calcular valor estimado baseado na condição
    const baseValue = 50000; // Base de 50.000 Kz
    const conditionMultiplier = {
      'Bom (pequenos sinais de uso)': 0.8,
      'Razoável': 0.5,
      'Com defeito': 0.2
    };
    
    const estimated_value = Math.round(baseValue * (conditionMultiplier[condition as keyof typeof conditionMultiplier] || 0.5));
    
    // Criar ticket para a solicitação
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    const ticketNumber = `TI${year}${month}${day}-${random}`;
    
    // Adicionar imagens à descrição se fornecidas
    let imagesSection = '';
    if (images && Array.isArray(images) && images.length > 0) {
      imagesSection = '\n\nImagens do Dispositivo:\n' + images.join('\n');
    }
    
    const ticket = await prisma.ticket.create({
      data: {
        ticket_number: ticketNumber,
        user_id: '', // Trade-in pode não ter user_id
        user_name: name,
        user_email: email,
        subject: `Trade-In: ${brand} ${model}`,
        category: 'trade-in',
        priority: 'normal',
        status: 'open',
        description: `
Dispositivo: ${brand} ${model}
Condição: ${condition}
IMEI: ${imei || 'Não informado'}
Telefone: ${phone}
Descrição: ${description || 'Não fornecida'}

Valor Estimado: ${estimated_value.toLocaleString()} Kz${imagesSection}
        `.trim(),
        messages: [],
      },
    });
    
    console.log('✅ [TRADE-IN] Solicitação criada:', ticketNumber);
    
    res.status(201).json({ 
      success: true,
      tradeIn: {
        id: ticket.id,
        ticket_number: ticketNumber,
        estimated_value,
        status: 'pending'
      },
      message: 'Solicitação de trade-in enviada com sucesso!'
    });
  } catch (error: any) {
    console.error('❌ [TRADE-IN] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar solicitação' });
  }
});

// GET /api/trade-in - Listar todas as solicitações de trade-in (admin)
app.get('/api/trade-in', async (req, res) => {
  try {
    debugLog('📋 [TRADE-IN] Buscando solicitações...');
    
    const tickets = await prisma.ticket.findMany({
      where: {
        category: 'trade-in'
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Transformar tickets em formato trade-in
    const tradeIns = tickets.map(ticket => {
      // Extrair valor estimado da descrição
      const estimatedMatch = ticket.description.match(/Valor Estimado: ([\d.,\s]+) Kz/);
      const estimated_value = estimatedMatch ? parseInt(estimatedMatch[1].replace(/[.,\s]/g, '')) : 0;
      
      // Extrair informações da descrição (multi-line)
      const lines = ticket.description.split('\n');
      const deviceLine = lines.find(l => l.includes('Dispositivo:'));
      const conditionLine = lines.find(l => l.includes('Condição:'));
      const imeiLine = lines.find(l => l.includes('IMEI:'));
      const phoneLine = lines.find(l => l.includes('Telefone:'));
      
      const device = deviceLine ? deviceLine.replace('Dispositivo:', '').trim() : 'Dispositivo';
      const condition = conditionLine ? conditionLine.replace('Condição:', '').trim() : '';
      const imei = imeiLine ? imeiLine.replace('IMEI:', '').trim() : '';
      const phone = phoneLine ? phoneLine.replace('Telefone:', '').trim() : '';
      
      // Extrair URLs de imagens
      const imagesSection = ticket.description.match(/Imagens do Dispositivo:([\s\S]*?)(?=\n\n|$)/);
      const images = imagesSection ? imagesSection[1].split('\n').filter(line => line.trim().startsWith('http')).map(url => url.trim()) : [];
      
      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_name: ticket.user_name,
        user_email: ticket.user_email,
        phone,
        device,
        condition,
        imei,
        images,
        estimated_value,
        final_value: null,
        status: ticket.status === 'open' ? 'pending' : ticket.status === 'closed' ? 'completed' : ticket.status,
        admin_notes: '',
        createdAt: ticket.created_at ? ticket.created_at.toISOString() : new Date().toISOString(),
        updatedAt: ticket.updated_at ? ticket.updated_at.toISOString() : new Date().toISOString()
      };
    });
    
    debugLog('✅ [TRADE-IN] Encontrados:', tradeIns.length);
    res.json(tradeIns);
  } catch (error: any) {
    console.error('❌ [TRADE-IN] Erro ao buscar:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar solicitações' });
  }
});

// GET /api/trade-in/my-requests - Listar solicitações do usuário logado
app.get('/api/trade-in/my-requests', authMiddleware, async (req: any, res) => {
  try {
    debugLog('🔍 [TRADE-IN MY-REQUESTS] Endpoint chamado');
    debugLog('👤 [TRADE-IN MY-REQUESTS] req.userId:', req.userId);
    
    // Buscar email do usuário pelo ID
    let userEmail = req.userEmail;
    
    if (!userEmail && req.userId) {
      // Tentar buscar em User
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { email: true }
      });
      
      if (user) {
        userEmail = user.email;
      } else {
        // Tentar buscar em CustomerProfile
        const customer = await prisma.customerProfile.findUnique({
          where: { id: req.userId },
          select: { email: true }
        });
        
        if (customer) {
          userEmail = customer.email;
        }
      }
    }
    
    if (!userEmail) {
      console.error('❌ [TRADE-IN MY-REQUESTS] Email do usuário não encontrado');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    debugLog('📋 [TRADE-IN MY-REQUESTS] Buscando solicitações do usuário:', userEmail);
    
    const tickets = await prisma.ticket.findMany({
      where: {
        category: 'trade-in',
        user_email: userEmail
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Transformar tickets em formato trade-in
    const tradeIns = tickets.map(ticket => {
      const estimatedMatch = ticket.description.match(/Valor Estimado: ([\d.,\s]+) Kz/);
      const estimated_value = estimatedMatch ? parseInt(estimatedMatch[1].replace(/[.,\s]/g, '')) : 0;
      
      // Extrair informações linha por linha
      const lines = ticket.description.split('\n');
      const deviceLine = lines.find(l => l.includes('Dispositivo:'));
      const conditionLine = lines.find(l => l.includes('Condição:'));
      
      const device = deviceLine ? deviceLine.replace('Dispositivo:', '').trim() : 'Dispositivo';
      const condition = conditionLine ? conditionLine.replace('Condição:', '').trim() : '';
      
      // Extrair URLs de imagens
      const imagesSection = ticket.description.match(/Imagens do Dispositivo:([\s\S]*?)(?=\n\n|$)/);
      const images = imagesSection ? imagesSection[1].split('\n').filter(line => line.trim().startsWith('http')).map(url => url.trim()) : [];
      
      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        device,
        condition,
        images,
        estimated_value,
        status: ticket.status,
        createdAt: ticket.created_at ? ticket.created_at.toISOString() : new Date().toISOString()
      };
    });
    
    console.log('✅ [TRADE-IN MY-REQUESTS] Encontradas', tradeIns.length, 'solicitações do usuário');
    console.log('📦 [TRADE-IN MY-REQUESTS] Dados:', JSON.stringify(tradeIns, null, 2));
    res.json(tradeIns);
  } catch (error: any) {
    console.error('❌ [TRADE-IN] Erro ao buscar:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar solicitações' });
  }
});

// PUT /api/trade-in/:id - Atualizar/Avaliar trade-in (admin)
app.put('/api/trade-in/:id', authMiddleware, async (req: any, res) => {
  try {
    console.log('📝 [TRADE-IN UPDATE] Atualizando trade-in:', req.params.id);
    console.log('📝 [TRADE-IN UPDATE] Dados:', req.body);

    const ticketId = req.params.id; // Manter como string
    const { finalValue, adminNotes, status } = req.body;

    // Verificar se é admin
    if (req.userRole !== 'admin' && req.userRole !== 'staff') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket || ticket.category !== 'trade-in') {
      return res.status(404).json({ error: 'Trade-in não encontrado' });
    }

    // Atualizar ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status || ticket.status,
        updated_at: new Date()
      }
    });

    // Criar nova descrição com valor final e notas do admin
    let newDescription = ticket.description;
    if (finalValue) {
      const finalValueLine = `\nValor Final: ${finalValue} AOA`;
      if (!newDescription.includes('Valor Final:')) {
        newDescription += finalValueLine;
      } else {
        newDescription = newDescription.replace(/\nValor Final:.*$/m, finalValueLine);
      }
    }
    
    if (adminNotes) {
      const notesLine = `\nNotas do Admin: ${adminNotes}`;
      if (!newDescription.includes('Notas do Admin:')) {
        newDescription += notesLine;
      } else {
        newDescription = newDescription.replace(/\nNotas do Admin:.*$/m, notesLine);
      }
    }

    // Atualizar descrição se mudou
    if (newDescription !== ticket.description) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { description: newDescription }
      });
    }

    console.log('✅ [TRADE-IN UPDATE] Trade-in atualizado:', ticketId);

    res.json({
      success: true,
      ticket: updatedTicket,
      finalValue: finalValue || null
    });
  } catch (error: any) {
    console.error('❌ [TRADE-IN UPDATE] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar trade-in' });
  }
});


// ============================================
// FAVORITES ROUTES
// ============================================

// POST /api/favorites - Adicionar aos favoritos
app.post('/api/favorites', authMiddleware, async (req: any, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.userId as string; // enforced from token

    if (!user_id || !product_id) {
      return res.status(400).json({ error: 'user_id e product_id são obrigatórios' });
    }

    // Verificar se já existe
    const existing = await prisma.favorite.findFirst({
      where: {
        user_id,
        product_id,
      },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const favorite = await prisma.favorite.create({
      data: {
        user_id,
        product_id,
      },
    });

    res.status(201).json(favorite);
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/favorites - Buscar favoritos do usuário logado (admin pode filtrar por user_id)
app.get('/api/favorites', authMiddleware, async (req: any, res) => {
  try {
    const { user_id } = req.query;
    const reqUserId = req.userId as string;
    const reqUserRole = req.userRole as string;

    // Admin can fetch favorites for arbitrary users
    const where: any = { user_id: reqUserRole === 'admin' && user_id ? (user_id as string) : reqUserId };
    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        product: true,
      },
    });

    res.json({ favorites });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/favorites/:productId - Remover dos favoritos do usuário logado
app.delete('/api/favorites/:productId', authMiddleware, async (req: any, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId as string;

    const favorite = await prisma.favorite.findFirst({ where: { user_id: userId, product_id: productId } });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: error.message });
  }
});


// ============================================
// CATEGORIES ROUTES
// ============================================

// GET /api/categories - Buscar todas as categorias
app.get('/api/categories', cacheMiddleware(1800), async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        subcategories: {
          orderBy: { order: 'asc' }
        }
      }
    });
    const converted = convertDecimalsToNumbers(categories);
    res.json({ categories: converted });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id - Buscar categoria por ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const converted = convertDecimalsToNumbers(category);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - Criar categoria
app.post('/api/categories', async (req, res) => {
  try {
    const categoryData = req.body;

    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        icon: categoryData.icon,
        image_url: categoryData.image_url,
        parent_id: categoryData.parent_id || null,
        order: categoryData.order || 0,
        active: categoryData.active !== false,
      },
    });

    // Invalidar cache de categorias
    await invalidateCache('cache:/api/categories*');

    const converted = convertDecimalsToNumbers(newCategory);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/categories/:id - Atualizar categoria
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });
    
    const converted = convertDecimalsToNumbers(updatedCategory);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - Deletar categoria
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.category.delete({
      where: { id },
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories/bulk-update - Atualizar múltiplas categorias (ADMIN)
app.post('/api/categories/bulk-update', requireAdmin, async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories must be an array' });
    }
    
    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deletar todas as categorias e subcategorias existentes
      await tx.subcategory.deleteMany({});
      await tx.category.deleteMany({});
      
      // Criar novas categorias
      for (const cat of categories) {
        // Gerar slug a partir do nome (usar id como sufixo para garantir unicidade)
        const categorySlug = (cat.name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '-' + cat.id).substring(0, 190);
        
        const category = await tx.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            slug: categorySlug,
            icon: cat.icon || '📦',
            order: cat.order || 0,
          }
        });
        
        // Criar subcategorias se existirem
        if (cat.subcategories && cat.subcategories.length > 0) {
          for (const sub of cat.subcategories) {
            // Gerar slug a partir do nome da subcategoria (usar id como sufixo)
            const subSlug = (sub.name.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '') + '-' + sub.id).substring(0, 190);
            
            await tx.subcategory.create({
              data: {
                id: sub.id,
                name: sub.name,
                slug: subSlug,
                // icon: sub.icon || '',  // ← Removido temporariamente
                category_id: category.id,
                order: sub.order || 0,
              }
            });
          }
        }
      }
    });
    
    res.json({ message: 'Categories synchronized successfully', count: categories.length });
  } catch (error: any) {
    console.error('Error bulk updating categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories/initialize-defaults - Inicializar categorias padrão (ADMIN)
app.post('/api/categories/initialize-defaults', requireAdmin, async (req, res) => {
  try {
    const defaultCategories = [
      {
        id: 'ram',
        name: 'Memória RAM',
        icon: '💾',
        order: 1,
        subcategories: [
          { id: 'ram-ddr4', name: 'DDR4', order: 1 },
          { id: 'ram-ddr5', name: 'DDR5', order: 2 },
          { id: 'ram-server', name: 'Servidor', order: 3 },
        ]
      },
      {
        id: 'storage',
        name: 'Armazenamento',
        icon: '💽',
        order: 2,
        subcategories: [
          { id: 'storage-ssd', name: 'SSD', order: 1 },
          { id: 'storage-hdd', name: 'HDD', order: 2 },
          { id: 'storage-nvme', name: 'NVMe', order: 3 },
        ]
      },
      {
        id: 'minipc',
        name: 'Mini PCs',
        icon: '🖥️',
        order: 3,
        subcategories: [
          { id: 'minipc-intel', name: 'Intel', order: 1 },
          { id: 'minipc-amd', name: 'AMD', order: 2 },
        ]
      },
      {
        id: 'camera',
        name: 'Câmeras Wi-Fi',
        icon: '📹',
        order: 4,
        subcategories: [
          { id: 'camera-indoor', name: 'Indoor', order: 1 },
          { id: 'camera-outdoor', name: 'Outdoor', order: 2 },
        ]
      },
      {
        id: 'network',
        name: 'Redes e Internet',
        icon: '🌐',
        order: 5,
        subcategories: [
          { id: 'network-router', name: 'Roteadores', order: 1 },
          { id: 'network-switch', name: 'Switches', order: 2 },
          { id: 'network-wifi', name: 'Access Points', order: 3 },
        ]
      },
      {
        id: 'software',
        name: 'Software',
        icon: '💿',
        order: 6,
        subcategories: [
          { id: 'software-os', name: 'Sistemas Operacionais', order: 1 },
          { id: 'software-office', name: 'Produtividade', order: 2 },
          { id: 'software-security', name: 'Segurança', order: 3 },
        ]
      },
      {
        id: 'mobile',
        name: 'Telemóveis',
        icon: '📱',
        order: 7,
        subcategories: [
          { id: 'mobile-smartphone', name: 'Smartphones', order: 1 },
          { id: 'mobile-accessories', name: 'Acessórios', order: 2 },
        ]
      }
    ];

    // Verificar se já existem categorias
    const existingCount = await prisma.category.count();
    if (existingCount > 0) {
      return res.json({ 
        message: 'Categories already exist', 
        count: existingCount,
        skipped: true 
      });
    }

    // Criar categorias padrão
    for (const cat of defaultCategories) {
      const category = await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          order: cat.order,
        }
      });

      // Criar subcategorias
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          await prisma.subcategory.create({
            data: {
              id: sub.id,
              name: sub.name,
              category_id: category.id,
              order: sub.order,
            }
          });
        }
      }
    }

    res.json({ 
      message: 'Default categories initialized successfully', 
      count: defaultCategories.length 
    });
  } catch (error: any) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SUBCATEGORIES ROUTES
// ============================================

// GET /api/subcategories - Buscar todas as subcategorias
app.get('/api/subcategories', async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      orderBy: { order: 'asc' },
    });
    const converted = convertDecimalsToNumbers(subcategories);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subcategories/:id - Buscar subcategoria por ID
app.get('/api/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });
    
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    const converted = convertDecimalsToNumbers(subcategory);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subcategories - Criar subcategoria
app.post('/api/subcategories', async (req, res) => {
  try {
    const subcategoryData = req.body;
    
    const newSubcategory = await prisma.subcategory.create({
      data: {
        category_id: subcategoryData.category_id,
        name: subcategoryData.name,
        slug: subcategoryData.slug,
        description: subcategoryData.description,
        order: subcategoryData.order || 0,
        active: subcategoryData.active !== false,
      },
    });
    
    const converted = convertDecimalsToNumbers(newSubcategory);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/subcategories/:id - Atualizar subcategoria
app.put('/api/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });
    
    const converted = convertDecimalsToNumbers(updatedSubcategory);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/subcategories/:id - Deletar subcategoria
app.delete('/api/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.subcategory.delete({
      where: { id },
    });
    
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TEAM MEMBERS ROUTES
// ============================================

// GET /api/team - Buscar todos os membros da equipe
app.get('/api/team', async (req, res) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { created_at: 'desc' },
    });
    const converted = convertDecimalsToNumbers(members);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/team/:id - Buscar membro por ID
app.get('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const member = await prisma.teamMember.findUnique({
      where: { id },
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    const converted = convertDecimalsToNumbers(member);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/team/email/:email - Buscar membro por email
app.get('/api/team/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const member = await prisma.teamMember.findUnique({
      where: { email: decodeURIComponent(email) },
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    const converted = convertDecimalsToNumbers(member);
    res.json(converted);
  } catch (error: any) {
    console.error('Error fetching team member by email:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/team - Criar membro da equipe
app.post('/api/team', async (req, res) => {
  try {
    const memberData = req.body;
    
    const newMember = await prisma.teamMember.create({
      data: {
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        role: memberData.role,
        department: memberData.department,
        avatar: memberData.avatar,
        bio: memberData.bio,
        permissions: memberData.permissions || [],
        active: memberData.active !== false,
        hire_date: memberData.hire_date ? new Date(memberData.hire_date) : new Date(),
        salary: memberData.salary,
      },
    });
    
    const converted = convertDecimalsToNumbers(newMember);
    res.status(201).json(converted);
  } catch (error: any) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/team/:id - Atualizar membro da equipe
app.put('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...updates,
        hire_date: updates.hire_date ? new Date(updates.hire_date) : undefined,
        last_login: updates.last_login ? new Date(updates.last_login) : undefined,
        updated_at: new Date(),
      },
    });
    
    const converted = convertDecimalsToNumbers(updatedMember);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/team/:id - Deletar membro da equipe
app.delete('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.teamMember.delete({
      where: { id },
    });
    
    res.json({ message: 'Team member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/team/:id/last-login - Atualizar último login
app.patch('/api/team/:id/last-login', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        last_login: new Date(),
      },
    });
    
    const converted = convertDecimalsToNumbers(updatedMember);
    res.json(converted);
  } catch (error: any) {
    console.error('Error updating last login:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Migration endpoint (temporário para debug)
app.post('/api/admin/run-migration', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Executando migration manual de advertisements...');
    
    // Verificar estado atual
    const before = await prisma.$queryRawUnsafe(`
      SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'advertisements' 
      AND COLUMN_NAME = 'imagem_url'
    `) as any[];
    
    console.log('📊 Antes:', before);
    
    // Aplicar migration
    await prisma.$executeRawUnsafe(`
      ALTER TABLE advertisements 
      MODIFY COLUMN imagem_url TEXT NOT NULL
    `);
    
    // Verificar depois
    const after = await prisma.$queryRawUnsafe(`
      SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'advertisements' 
      AND COLUMN_NAME = 'imagem_url'
    `) as any[];
    
    console.log('📊 Depois:', after);
    
    // Converter BigInt para string antes de enviar JSON
    const beforeSafe = before.map(row => ({
      ...row,
      CHARACTER_MAXIMUM_LENGTH: row.CHARACTER_MAXIMUM_LENGTH ? String(row.CHARACTER_MAXIMUM_LENGTH) : null
    }));
    
    const afterSafe = after.map(row => ({
      ...row,
      CHARACTER_MAXIMUM_LENGTH: row.CHARACTER_MAXIMUM_LENGTH ? String(row.CHARACTER_MAXIMUM_LENGTH) : null
    }));
    
    res.json({ 
      success: true, 
      before: beforeSafe, 
      after: afterSafe,
      message: 'Migration aplicada com sucesso' 
    });
    
  } catch (error: any) {
    console.error('❌ Erro na migration:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// 🔐 AUTH ROUTES (Autenticação de Equipe)
// ============================================

// Login de membros
app.post('/api/auth/login', loginHandler);

// Criar admin
app.post('/api/auth/create-admin', createAdminHandler);

// Trocar senha
app.post('/api/auth/change-password', requireAuth, changePasswordHandler);

// ⚠️ REMOVIDO - Rota duplicada, já existe em authRoutes (backend/auth.ts)
// app.get('/api/auth/me', requireAuth, meHandler);

// Recuperação de senha
app.post('/api/auth/forgot-password', forgotPasswordHandler);
app.post('/api/auth/reset-password', resetPasswordHandler);

// OAuth - Facebook e Google
app.post('/api/auth/oauth/facebook', facebookOAuthHandler);
app.post('/api/auth/oauth/google', googleOAuthHandler);

// ============================================
// 👥 TEAM MEMBERS ROUTES (Gestão de Equipe)
// ============================================

// Listar membros
app.get('/api/team-members', async (req, res) => {
  try {
    const { role, is_active, department } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (department) where.department = department;

    const members = await prisma.teamMember.findMany({
      where,
      orderBy: { invited_at: 'desc' }
    });

    res.json(convertDecimalsToNumbers(members));
  } catch (error: any) {
    console.error('❌ Erro ao listar membros:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar novo membro
app.post('/api/team-members', async (req, res) => {
  try {
    const { email, name, role, permissions, department, phone, invited_by, send_email = true } = req.body;

    if (!email || !name || !role || !invited_by) {
      return res.status(400).json({ 
        error: 'Email, nome, cargo e convidado por são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Este email já está registrado' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está cadastrado como usuário' });
    }

    // Gerar senha temporária
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Criar membro
    const newMember = await prisma.teamMember.create({
      data: {
        email: email.toLowerCase(),
        name,
        role,
        permissions: permissions || {},
        department,
        phone,
        invited_by,
        temp_password: tempPassword,
        password_changed: false
      }
    });

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name,
        user_type: 'team',
        is_active: true,
        team_member_id: newMember.id
      }
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: invited_by,
        user_name: 'Admin',
        user_role: 'admin',
        action_type: 'create',
        entity_type: 'team_member',
        entity_id: newMember.id,
        description: `Convidou ${name} (${email}) como ${role}`,
        metadata: { member: convertDecimalsToNumbers(newMember) }
      }
    });

    // Enviar email com credenciais (se solicitado)
    if (send_email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const roleLabels: any = {
          admin: 'Administrador',
          editor: 'Editor',
          moderator: 'Moderador',
          viewer: 'Visualizador'
        };

        const deptLabels: any = {
          vendas: 'Vendas',
          estoque: 'Estoque',
          marketing: 'Marketing',
          suporte: 'Suporte'
        };

        await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME || 'KZSTORE Angola'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
          to: [email],
          subject: '🎉 Bem-vindo à Equipe KZSTORE!',
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
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Bem-vindo à Nossa Equipe!</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Olá ${name}! 👋</h2>
                
                <p>Você foi convidado para fazer parte da equipe KZSTORE como <strong>${roleLabels[role] || role}</strong>${department ? ` no departamento de <strong>${deptLabels[department] || department}</strong>` : ''}.</p>
                
                <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
                  <h3 style="margin-top: 0; color: #667eea;">🔑 Suas Credenciais de Acesso</h3>
                  <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 10px 0;"><strong>Senha Temporária:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
                  <p style="margin: 15px 0 0 0; color: #e74c3c; font-size: 14px;">⚠️ <strong>Importante:</strong> Altere sua senha no primeiro acesso!</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://kzstore.ao/admin" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acessar Painel Admin</a>
                </div>
                
                <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 25px 0; border-radius: 5px;">
                  <h4 style="margin-top: 0; color: #2e7d32;">✨ Suas Permissões</h4>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    ${role === 'admin' ? '<li>Acesso completo ao sistema</li>' : ''}
                    ${role === 'editor' ? '<li>Criar e editar produtos</li><li>Gerenciar pedidos</li><li>Visualizar relatórios</li>' : ''}
                    ${role === 'moderator' ? '<li>Editar produtos</li><li>Gerenciar pedidos</li><li>Moderar conteúdo</li>' : ''}
                    ${role === 'viewer' ? '<li>Visualizar produtos e pedidos</li><li>Acessar relatórios</li>' : ''}
                  </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  Se você tiver alguma dúvida, entre em contato com o administrador do sistema.
                </p>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                  © ${new Date().getFullYear()} KZSTORE Angola. Todos os direitos reservados.
                </p>
              </div>
            </body>
            </html>
          `
        });

        console.log(`📧 Email de boas-vindas enviado para ${email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
        // Não falhar se o email não for enviado
      }
    }

    res.status(201).json({
      success: true,
      message: 'Membro criado com sucesso',
      member: convertDecimalsToNumbers(newMember),
      credentials: {
        email,
        tempPassword,
        needsPasswordChange: true
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar membro
app.put('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, permissions, is_active, department, phone, avatar_url, updated_by } = req.body;

    const existingMember = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

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
            before: convertDecimalsToNumbers(existingMember),
            after: convertDecimalsToNumbers(updatedMember) 
          }
        }
      });
    }

    res.json(convertDecimalsToNumbers(updatedMember));
  } catch (error: any) {
    console.error('❌ Erro ao atualizar membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Desativar membro
app.delete('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deleted_by } = req.body;

    const member = await prisma.teamMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }

    const deactivatedMember = await prisma.teamMember.update({
      where: { id },
      data: { is_active: false }
    });

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
          metadata: { member: convertDecimalsToNumbers(member) }
        }
      });
    }

    res.json({ 
      message: 'Membro desativado com sucesso',
      member: convertDecimalsToNumbers(deactivatedMember) 
    });
  } catch (error: any) {
    console.error('❌ Erro ao remover membro:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📋 PENDING ACTIONS ROUTES (Ações Pendentes)
// ============================================

// Listar ações pendentes
app.get('/api/pending-actions', async (req, res) => {
  try {
    const { status, action_type, entity_type } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (action_type) where.action_type = action_type;
    if (entity_type) where.entity_type = entity_type;

    const actions = await prisma.pendingAction.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { requested_at: 'desc' }
      ]
    });

    res.json(convertDecimalsToNumbers(actions));
  } catch (error: any) {
    console.error('❌ Erro ao listar ações pendentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar ação pendente
app.post('/api/pending-actions', async (req, res) => {
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

    if (!action_type || !entity_type || !action_data || !requested_by || !requested_by_name) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: action_type, entity_type, action_data, requested_by, requested_by_name' 
      });
    }

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

    res.status(201).json(convertDecimalsToNumbers(newAction));
  } catch (error: any) {
    console.error('❌ Erro ao criar ação pendente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Aprovar ação
app.put('/api/pending-actions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewed_by, reviewed_by_name, review_notes } = req.body;

    if (!reviewed_by || !reviewed_by_name) {
      return res.status(400).json({ error: 'reviewed_by e reviewed_by_name são obrigatórios' });
    }

    const action = await prisma.pendingAction.findUnique({
      where: { id }
    });

    if (!action) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    if (action.status !== 'pending') {
      return res.status(400).json({ error: 'Esta ação já foi processada' });
    }

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

    await prisma.activityLog.create({
      data: {
        user_id: reviewed_by,
        user_name: reviewed_by_name,
        user_role: 'admin',
        action_type: 'approve',
        entity_type: action.entity_type,
        entity_id: action.entity_id,
        description: `Aprovou ${action.action_type} em ${action.entity_type}`,
        metadata: { action: convertDecimalsToNumbers(approvedAction) }
      }
    });

    res.json(convertDecimalsToNumbers(approvedAction));
  } catch (error: any) {
    console.error('❌ Erro ao aprovar ação:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rejeitar ação
app.put('/api/pending-actions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewed_by, reviewed_by_name, review_notes } = req.body;

    if (!reviewed_by || !reviewed_by_name || !review_notes) {
      return res.status(400).json({ error: 'reviewed_by, reviewed_by_name e review_notes são obrigatórios' });
    }

    const action = await prisma.pendingAction.findUnique({
      where: { id }
    });

    if (!action) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    if (action.status !== 'pending') {
      return res.status(400).json({ error: 'Esta ação já foi processada' });
    }

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

    await prisma.activityLog.create({
      data: {
        user_id: reviewed_by,
        user_name: reviewed_by_name,
        user_role: 'admin',
        action_type: 'reject',
        entity_type: action.entity_type,
        entity_id: action.entity_id,
        description: `Rejeitou ${action.action_type} em ${action.entity_type}`,
        metadata: { action: convertDecimalsToNumbers(rejectedAction), reason: review_notes }
      }
    });

    res.json(convertDecimalsToNumbers(rejectedAction));
  } catch (error: any) {
    console.error('❌ Erro ao rejeitar ação:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 📊 ACTIVITY LOGS ROUTES (Logs de Atividade)
// ============================================

// Listar logs
app.get('/api/activity-logs', async (req, res) => {
  try {
    const { user_id, action_type, entity_type, limit = '50' } = req.query;
    
    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (action_type) where.action_type = action_type;
    if (entity_type) where.entity_type = entity_type;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(convertDecimalsToNumbers(logs));
  } catch (error: any) {
    console.error('❌ Erro ao listar logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from React build
const buildPath = path.join(process.cwd(), 'build');

// Servir assets com cache longo (arquivos com hash)
app.use('/assets', express.static(path.join(buildPath, 'assets'), {
  maxAge: '1y', // Cache de 1 ano para assets (têm hash no nome)
  immutable: true
}));

// Servir outros arquivos estáticos
app.use(express.static(buildPath, {
  maxAge: 0, // Sem cache para arquivos sem hash
  setHeaders: (res, filePath) => {
    // Desabilitar cache completamente para index.html
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      // Adicionar timestamp no ETag para forçar reload
      const buildTime = process.env.BUILD_TIME || Date.now().toString();
      res.setHeader('ETag', `"${buildTime}"`);
    }
  }
}));

// 📧 Endpoint de Contato
app.post('/api/contact', async (req, res) => {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;
    
    console.log('📧 [CONTACT] Nova mensagem de contato recebida:', { nome, email, assunto });
    
    // Validar campos obrigatórios
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    // Gerar email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
    .value { margin-bottom: 15px; }
    .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📩 Nova Mensagem de Contato</h1>
      <p>KZSTORE Angola</p>
    </div>
    
    <div class="content">
      <div class="info-box">
        <div class="label">👤 Nome:</div>
        <div class="value">${nome}</div>
        
        <div class="label">📧 Email:</div>
        <div class="value">${email}</div>
        
        ${telefone ? `
        <div class="label">📱 Telefone:</div>
        <div class="value">${telefone}</div>
        ` : ''}
        
        <div class="label">📋 Assunto:</div>
        <div class="value">${assunto}</div>
      </div>
      
      <div class="message-box">
        <div class="label">💬 Mensagem:</div>
        <div class="value" style="white-space: pre-wrap;">${mensagem}</div>
      </div>
      
      <div class="footer">
        <p><strong>KZSTORE Angola</strong></p>
        <p>www.kzstore.ao</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    
    // Enviar email para o admin
    await sendEmail({
      to: 'leuboy30@gmail.com', // Email do admin
      subject: `📩 Contato KZSTORE: ${assunto}`,
      html: emailHtml
    });
    
    console.log('✅ [CONTACT] Email de contato enviado com sucesso!');
    
    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('❌ [CONTACT] Erro ao processar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
});

// PATCH /api/products/fix-shipping - Atualizar produtos sem shipping definido (TEMPORÁRIO - ADMIN)
app.patch('/api/products/fix-shipping', requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Atualizando produtos sem shipping_type definido...');
    
    const result = await prisma.$executeRaw`
      UPDATE products 
      SET 
        shipping_type = 'free',
        shipping_cost_aoa = 0,
        shipping_cost_usd = 0
      WHERE shipping_type IS NULL 
         OR shipping_type = ''
         OR (shipping_type = 'paid' AND shipping_cost_aoa = 0)
    `;
    
    const freeCount = await prisma.product.count({ where: { shipping_type: 'free' } });
    const paidCount = await prisma.product.count({ where: { shipping_type: 'paid' } });
    
    console.log(`✅ ${result} produtos atualizados`);
    res.json({ 
      success: true, 
      updated: result,
      stats: { free: freeCount, paid: paidCount }
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar shipping:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PRODUCT FEEDS - WhatsApp, Facebook, Google (BEFORE SPA FALLBACK)
// ============================================================================

/**
 * Helper: Notify feed update (for webhooks)
 */
async function notifyFeedUpdate(action: 'create' | 'update' | 'delete', productId: string) {
  try {
    console.log(`📢 Feed update notification: ${action} product ${productId}`);
    debugLog(`Feed notification: ${action} - ${productId}`);
  } catch (error) {
    console.error('Error notifying feed update:', error);
  }
}

/**
 * Helper: Convert product to feed format
 */
function productToFeedItem(product: any, baseUrl: string) {
  const slug = product.nome
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const productUrl = `${baseUrl}/produto/${slug}-${product.id}`;
  
  let availability = 'out of stock';
  if (product.is_pre_order) {
    availability = 'preorder';
  } else if (product.estoque > 0) {
    availability = 'in stock';
  }
  
  const conditionMap: any = {
    'Novo': 'new',
    'Usado': 'used',
    'Refurbished': 'refurbished',
    'Recondicionado': 'refurbished'
  };
  const condition = conditionMap[product.condicao || 'Novo'] || 'new';
  
  return {
    id: product.id,
    title: product.nome,
    description: product.descricao || product.nome,
    link: productUrl,
    image_link: product.imagem_url || '',
    additional_image_links: Array.isArray(product.imagens) ? product.imagens : [],
    price: `${product.preco_aoa.toFixed(2)} AOA`,
    availability,
    condition,
    brand: product.marca || 'KZStore',
    gtin: product.codigo_barras || '',
    mpn: product.sku || product.id,
    google_product_category: mapCategoryToGoogle(product.categoria),
    product_type: `${product.categoria}${product.subcategoria ? ' > ' + product.subcategoria : ''}`,
    custom_label_0: product.categoria,
    custom_label_1: product.subcategoria || '',
    inventory_count: product.estoque,
    sale_price: product.preco_aoa < (product.preco_usd || 999999) ? `${product.preco_aoa.toFixed(2)} AOA` : undefined,
  };
}

/**
 * Helper: Map category to Google Product Category
 */
function mapCategoryToGoogle(category: string): string {
  const categoryMap: any = {
    'Componentes PC': '1295',
    'Hardware': '1295',
    'Software': '4020',
    'Servidores': '1294',
    'Rede': '317',
    'Armazenamento': '1294',
    'Memória RAM': '1295',
    'SSD': '4745',
    'Mini PC': '325',
    'Laptops': '298',
    'Monitores': '356',
    'Periféricos': '275',
    'Áudio': '249',
    'Gaming': '1239',
    'Telefones': '267',
    'Tablets': '4745',
    'Smartwatches': '4612',
    'Eletrônicos': '222',
  };
  return categoryMap[category] || '222';
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * GET /feed.json - JSON feed for WhatsApp Business & Facebook
 */
app.get('/feed.json', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      orderBy: { created_at: 'desc' }
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const feedItems = products.map(p => productToFeedItem(p, baseUrl));
    
    res.json({
      title: 'KZStore - Tech & Electronics',
      link: baseUrl,
      description: 'A maior loja online de produtos eletrônicos em Angola',
      updated: new Date().toISOString(),
      products: feedItems
    });
  } catch (error: any) {
    console.error('Error generating JSON feed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /feed.xml - Facebook Commerce Manager feed
 */
app.get('/feed.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      orderBy: { created_at: 'desc' }
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>KZStore - Tech &amp; Electronics</title>\n';
    xml += `    <link>${baseUrl}</link>\n`;
    xml += '    <description>A maior loja online de produtos eletrônicos em Angola</description>\n';
    
    for (const product of products) {
      const item = productToFeedItem(product, baseUrl);
      
      xml += '    <item>\n';
      xml += `      <g:id>${escapeXml(item.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXml(item.title)}</g:title>\n`;
      xml += `      <g:description>${escapeXml(item.description)}</g:description>\n`;
      xml += `      <g:link>${escapeXml(item.link)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXml(item.image_link)}</g:image_link>\n`;
      
      if (item.additional_image_links && item.additional_image_links.length > 0) {
        item.additional_image_links.slice(0, 10).forEach((img: string) => {
          xml += `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `      <g:price>${escapeXml(item.price)}</g:price>\n`;
      xml += `      <g:availability>${escapeXml(item.availability)}</g:availability>\n`;
      xml += `      <g:condition>${escapeXml(item.condition)}</g:condition>\n`;
      xml += `      <g:brand>${escapeXml(item.brand)}</g:brand>\n`;
      
      if (item.gtin) {
        xml += `      <g:gtin>${escapeXml(item.gtin)}</g:gtin>\n`;
      }
      
      xml += `      <g:mpn>${escapeXml(item.mpn)}</g:mpn>\n`;
      xml += `      <g:google_product_category>${item.google_product_category}</g:google_product_category>\n`;
      xml += `      <g:product_type>${escapeXml(item.product_type)}</g:product_type>\n`;
      
      xml += '    </item>\n';
    }
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error('Error generating XML feed:', error);
    res.status(500).send(`<?xml version="1.0"?><error>${error.message}</error>`);
  }
});

/**
 * GET /google-feed.xml - Google Merchant Center feed
 */
app.get('/google-feed.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { ativo: true },
      orderBy: { created_at: 'desc' }
    });
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <title>KZStore Product Feed</title>\n';
    xml += `  <link rel="self" href="${baseUrl}/google-feed.xml"/>\n`;
    xml += `  <updated>${new Date().toISOString()}</updated>\n`;
    
    for (const product of products) {
      const item = productToFeedItem(product, baseUrl);
      
      xml += '  <entry>\n';
      xml += `    <g:id>${escapeXml(item.id)}</g:id>\n`;
      xml += `    <g:title>${escapeXml(item.title.substring(0, 150))}</g:title>\n`;
      xml += `    <g:description>${escapeXml(item.description.substring(0, 5000))}</g:description>\n`;
      xml += `    <g:link>${escapeXml(item.link)}</g:link>\n`;
      xml += `    <g:image_link>${escapeXml(item.image_link)}</g:image_link>\n`;
      
      if (item.additional_image_links && item.additional_image_links.length > 0) {
        item.additional_image_links.slice(0, 10).forEach((img: string) => {
          xml += `    <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `    <g:price>${escapeXml(item.price)}</g:price>\n`;
      xml += `    <g:availability>${escapeXml(item.availability)}</g:availability>\n`;
      xml += `    <g:condition>${escapeXml(item.condition)}</g:condition>\n`;
      xml += `    <g:brand>${escapeXml(item.brand)}</g:brand>\n`;
      
      // Google não aceita GTINs começando com 2, 02, 04 (restricted range)
      // Omitir GTIN e usar identifier_exists=false para produtos sem GTIN válido
      const hasValidGtin = item.gtin && !item.gtin.startsWith('2') && !item.gtin.startsWith('02') && !item.gtin.startsWith('04');
      
      if (hasValidGtin) {
        xml += `    <g:gtin>${escapeXml(item.gtin)}</g:gtin>\n`;
      } else {
        xml += `    <g:identifier_exists>false</g:identifier_exists>\n`;
      }
      
      xml += `    <g:mpn>${escapeXml(item.mpn)}</g:mpn>\n`;
      xml += `    <g:google_product_category>${item.google_product_category}</g:google_product_category>\n`;
      xml += `    <g:product_type>${escapeXml(item.product_type)}</g:product_type>\n`;
      xml += `    <g:custom_label_0>${escapeXml(item.custom_label_0)}</g:custom_label_0>\n`;
      
      if (item.custom_label_1) {
        xml += `    <g:custom_label_1>${escapeXml(item.custom_label_1)}</g:custom_label_1>\n`;
      }
      
      xml += '  </entry>\n';
    }
    
    xml += '</feed>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    console.error('Error generating Google feed:', error);
    res.status(500).send(`<?xml version="1.0"?><error>${error.message}</error>`);
  }
});

/**
 * POST /api/feeds/regenerate - Trigger feed regeneration (for webhooks/cron)
 */
app.post('/api/feeds/regenerate', requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Feed regeneration triggered');
    const productCount = await prisma.product.count({ where: { ativo: true } });
    
    res.json({
      success: true,
      message: 'Feeds regenerated successfully',
      products: productCount,
      feeds: ['/feed.json', '/feed.xml', '/google-feed.xml'],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error regenerating feeds:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// END PRODUCT FEEDS
// ============================================================================

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/clv - Calculate Customer Lifetime Value
 * Query params: startDate, endDate, customerId (optional)
 */
app.get('/api/analytics/clv', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);
    if (customerId) params.customerId = customerId as string;

    const result = await calculateCLV(params);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error calculating CLV:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/conversion - Calculate conversion rate
 * Query params: startDate, endDate (optional)
 */
app.get('/api/analytics/conversion', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);

    const result = await calculateConversionRate(params);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error calculating conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/revenue - Calculate revenue reports
 * Query params: startDate, endDate, groupBy (day|week|month)
 */
app.get('/api/analytics/revenue', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);
    if (groupBy) params.groupBy = groupBy as 'day' | 'week' | 'month';

    const result = await calculateRevenue(params);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error calculating revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/funnel - Analyze sales funnel
 * Query params: startDate, endDate (optional)
 */
app.get('/api/analytics/funnel', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);

    const result = await analyzeSalesFunnel(params);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error analyzing funnel:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/metrics/history - Get historical metrics
 * Query params: metricType (required), startDate, endDate, limit
 */
app.get('/api/analytics/metrics/history', requireAdmin, async (req, res) => {
  try {
    const { metricType, startDate, endDate, limit } = req.query;

    if (!metricType) {
      return res.status(400).json({ error: 'metricType is required' });
    }

    const params: any = {
      metricType: metricType as string
    };

    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);
    if (limit) params.limit = parseInt(limit as string);

    const result = await getHistoricalMetrics(params);

    res.json({
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error fetching historical metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// END ANALYTICS ENDPOINTS
// ============================================================================

// ============================================================================
// BULK OPERATIONS ENDPOINTS
// ============================================================================

/**
 * POST /api/products/import - Import products from CSV or Excel file
 * Requires file upload via multipart/form-data
 * Field name: 'file'
 */
app.post('/api/products/import', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let fileType: 'csv' | 'xlsx';
    if (fileExtension === '.csv') {
      fileType = 'csv';
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      fileType = 'xlsx';
    } else {
      // Cleanup uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid file type. Only CSV and Excel files are supported.' });
    }

    console.log(`📥 [BULK] Starting import from ${fileType.toUpperCase()}: ${req.file.originalname}`);

    const result = await importProductsFromFile(filePath, fileType);

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    // Invalidate cache
    await invalidateCache('cache:/api/products*');

    res.json({
      success: true,
      data: result,
      message: `Import completed: ${result.success} succeeded, ${result.failed} failed`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [BULK] Error importing products:', error);

    // Cleanup file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/export - Export products to CSV, Excel, or PDF
 * Query params: format (csv|xlsx|pdf), filters (optional)
 */
app.get('/api/products/export', requireAdmin, async (req, res) => {
  try {
    const { format, category, ativo, destaque } = req.query;

    if (!format || !['csv', 'xlsx', 'pdf'].includes(format as string)) {
      return res.status(400).json({ error: 'Invalid format. Must be csv, xlsx, or pdf' });
    }

    // Build filters
    const filters: any = {};
    if (category) filters.categoria = category;
    if (ativo !== undefined) filters.ativo = ativo === 'true';
    if (destaque !== undefined) filters.destaque = destaque === 'true';

    console.log(`📤 [BULK] Exporting products to ${(format as string).toUpperCase()}...`);

    let filePath: string;

    switch (format) {
      case 'csv':
        filePath = await exportProductsToCSV(filters);
        break;
      case 'xlsx':
        filePath = await exportProductsToExcel(filters);
        break;
      case 'pdf':
        filePath = await exportProductsToPDF(filters);
        break;
      default:
        return res.status(400).json({ error: 'Invalid format' });
    }

    const fileName = path.basename(filePath);

    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('❌ [BULK] Error sending file:', err);
      }

      // Cleanup file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    });
  } catch (error: any) {
    console.error('❌ [BULK] Error exporting products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products/bulk-update - Update multiple products at once
 * Body: { productIds: string[], updates: object }
 */
app.post('/api/products/bulk-update', requireAdmin, async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'productIds array is required and must not be empty' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'updates object is required' });
    }

    console.log(`📝 [BULK] Updating ${productIds.length} products...`);

    const result = await bulkUpdateProducts(productIds, updates);

    // Invalidate cache
    await invalidateCache('cache:/api/products*');

    res.json({
      success: true,
      data: result,
      message: `${result.updated} products updated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [BULK] Error in bulk update:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// END BULK OPERATIONS ENDPOINTS
// ============================================================================

// ============================================================================
// RECOMMENDATION ENDPOINTS
// ============================================================================

/**
 * GET /api/recommendations/product/:productId - Get product-based recommendations
 * "Customers who bought this also bought..."
 * Query params: limit (default 5)
 */
app.get('/api/recommendations/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const recommendations = await getProductRecommendations(productId, limit);

    res.json({
      success: true,
      data: convertDecimalsToNumbers(recommendations),
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [RECOMMENDATIONS] Error getting product recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/user/:userId - Get personalized recommendations
 * Based on user purchase history
 * Query params: limit (default 10)
 */
app.get('/api/recommendations/user/:userId', authMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Users can only get their own recommendations (unless admin)
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recommendations = await getPersonalizedRecommendations(userId, limit);

    res.json({
      success: true,
      data: convertDecimalsToNumbers(recommendations),
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [RECOMMENDATIONS] Error getting personalized recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/popular - Get popular products
 * Most sold in last 30 days
 * Query params: limit (default 10)
 */
app.get('/api/recommendations/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const products = await getPopularProducts(limit);

    res.json({
      success: true,
      data: convertDecimalsToNumbers(products),
      count: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [RECOMMENDATIONS] Error getting popular products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/related/:productId - Get related products
 * By category and subcategory
 * Query params: limit (default 4)
 */
app.get('/api/recommendations/related/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

    const products = await getRelatedProducts(productId, limit);

    res.json({
      success: true,
      data: convertDecimalsToNumbers(products),
      count: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [RECOMMENDATIONS] Error getting related products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/trending - Get trending products
 * Featured and new products
 * Query params: limit (default 10)
 */
app.get('/api/recommendations/trending', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const products = await getTrendingProducts(limit);

    res.json({
      success: true,
      data: convertDecimalsToNumbers(products),
      count: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ [RECOMMENDATIONS] Error getting trending products:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// END RECOMMENDATION ENDPOINTS
// ============================================================================

// SPA fallback - serve index.html for any route that doesn't match API or static files
app.use((req, res, next) => {
  // Don't handle API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Forçar revalidação completa do index.html
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // ETag dinâmico baseado no timestamp do deploy
  const buildTime = process.env.BUILD_TIME || Date.now().toString();
  res.setHeader('ETag', `"${buildTime}"`);
  
  // Se o cliente enviou If-None-Match, sempre retornar 200 (forçar reload)
  if (req.headers['if-none-match']) {
    // Ignorar ETag do cliente e sempre enviar conteúdo novo
  }
  
  res.sendFile(path.join(buildPath, 'index.html'));
});

// ============================================
// ERROR HANDLING - Sentry (MUST BE LAST MIDDLEWARE!)
// ============================================
app.use(sentryErrorHandler);

// Global error handler (after Sentry)
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Unhandled error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 API Server rodando em http://localhost:${PORT}`);
  console.log(`🌐 Acessível na rede em http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  
  // Testar conexão com banco de dados
  try {
    console.log('\n🔍 Testando conexão com banco de dados...');
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    console.log(`✅ Banco conectado! ${ordersCount} pedidos e ${productsCount} produtos encontrados\n`);
    
    // Aplicar migration: adicionar coluna icon em subcategories (se não existir)
    try {
      console.log('🔧 Verificando schema de subcategories...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE subcategories 
        ADD COLUMN IF NOT EXISTS icon VARCHAR(200) NULL AFTER description
      `);
      console.log('✅ Schema de subcategories atualizado!');
    } catch (migrationError: any) {
      if (migrationError.message?.includes('Duplicate column') || migrationError.message?.includes('already exists')) {
        console.log('ℹ️ Coluna icon já existe em subcategories');
      } else {
        console.warn('⚠️ Erro ao aplicar migration (pode ser ignorado se coluna já existe):', migrationError.message);
      }
    }
    
    // Aplicar migration: renomear imagem_url para imagem_url_v2 (forçar metadata refresh)
    try {
      console.log('🔧 Verificando schema de advertisements...');
      
      // Tentar renomear coluna
      await prisma.$executeRawUnsafe(`
        ALTER TABLE advertisements 
        CHANGE COLUMN imagem_url imagem_url_v2 TEXT NOT NULL
      `);
      console.log('✅ Coluna renomeada para imagem_url_v2 (TEXT)!');
    } catch (migrationError: any) {
      if (migrationError.message?.includes("Unknown column 'imagem_url'")) {
        console.log('ℹ️ Coluna imagem_url_v2 já existe (migração já aplicada)');
      } else {
        console.warn('⚠️ Erro ao aplicar migration de advertisements:', migrationError.message);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    console.error('⚠️  Verifique se o MySQL está rodando e as credenciais em .env estão corretas\n');
  }
});

// ============================================================================
// BUILD 131: ADVANCED E-COMMERCE FEATURES
// ============================================================================

// 📦 PUBLIC ORDER TRACKING (sem login)
app.get('/api/orders/track', async (req, res) => {
  try {
    const { order_number, email } = req.query;

    if (!order_number || !email) {
      return res.status(400).json({ error: 'Número do pedido e email são obrigatórios' });
    }

    const order = await prisma.order.findFirst({
      where: {
        order_number: order_number as string,
        user_email: email as string
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const orderConverted = convertDecimalsToNumbers(order);
    res.json({ order: orderConverted });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚚 SHIPPING ZONES
app.get('/api/shipping-zones', async (req, res) => {
  try {
    const zones = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM ShippingZone WHERE is_active = true ORDER BY name ASC
    `);
    res.json({ zones });
  } catch (error: any) {
    console.error('Error fetching shipping zones:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shipping-zones', requireAdmin, async (req, res) => {
  try {
    const { name, province, municipalities, cost, estimated_days } = req.body;
    const id = `zone-${province.toLowerCase().replace(/\s+/g, '-')}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO ShippingZone (id, name, province, municipalities, cost, estimated_days, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())
    `, id, name, province, JSON.stringify(municipalities || []), cost, estimated_days);

    res.json({ message: 'Zona de envio criada com sucesso', id });
  } catch (error: any) {
    console.error('Error creating shipping zone:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/shipping-zones/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClauses = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), id];

    await prisma.$executeRawUnsafe(`
      UPDATE ShippingZone SET ${setClauses}, updated_at = NOW() WHERE id = ?
    `, ...values);

    res.json({ message: 'Zona de envio atualizada' });
  } catch (error: any) {
    console.error('Error updating shipping zone:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/shipping-zones/calculate', async (req, res) => {
  try {
    const { province } = req.query;

    if (!province) {
      return res.status(400).json({ error: 'Província é obrigatória' });
    }

    const zones = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM ShippingZone WHERE province = ? AND is_active = true LIMIT 1
    `, province);

    if (zones.length === 0) {
      return res.json({ cost: 3500, estimated_days: 3, zone: 'default' });
    }

    const zone = zones[0];
    res.json({ 
      cost: Number(zone.cost), 
      estimated_days: zone.estimated_days,
      zone: zone.name 
    });
  } catch (error: any) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({ error: error.message });
  }
});

// 📧 NEWSLETTER
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email, name, source } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO NewsletterSubscriber (id, email, name, status, subscribed_at, source)
      VALUES (?, ?, ?, 'active', NOW(), ?)
      ON DUPLICATE KEY UPDATE 
        status = 'active', 
        name = COALESCE(?, name),
        subscribed_at = NOW()
    `, id, email, name, source || 'website', name);

    res.json({ message: 'Inscrito com sucesso!' });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    await prisma.$executeRawUnsafe(`
      UPDATE NewsletterSubscriber 
      SET status = 'unsubscribed', unsubscribed_at = NOW() 
      WHERE email = ?
    `, email);

    res.json({ message: 'Desinscrito com sucesso' });
  } catch (error: any) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/newsletter/subscribers', requireAdmin, async (req, res) => {
  try {
    const subscribers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM NewsletterSubscriber ORDER BY subscribed_at DESC
    `);
    res.json({ subscribers, total: subscribers.length });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    // Return empty array if table doesn't exist
    if (error?.meta?.code === '42P01' || error?.code === 'P2010') {
      return res.json({ subscribers: [], total: 0 });
    }
    res.status(500).json({ error: error.message });
  }
});

// 📨 EMAIL CAMPAIGNS
app.post('/api/campaigns', requireAdmin, async (req, res) => {
  try {
    const { name, subject, content_html, content_text, scheduled_at } = req.body;
    const id = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO EmailCampaign 
      (id, name, subject, content_html, content_text, status, scheduled_at, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, NOW(), NOW())
    `, id, name, subject, content_html, content_text || '', scheduled_at || null, req.userId);

    res.json({ message: 'Campanha criada', id });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns', requireAdmin, async (req, res) => {
  try {
    const campaigns = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM EmailCampaign ORDER BY created_at DESC
    `);
    res.json({ campaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🛒 CART SYNC (Cloud Cart)
app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.userId;
    const sessionId = req.headers['x-session-id'] as string;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID ou Session ID necessário' });
    }

    const carts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM Cart 
      WHERE ${userId ? 'user_id = ?' : 'session_id = ?'}
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY updated_at DESC
      LIMIT 1
    `, userId || sessionId);

    if (carts.length === 0) {
      return res.json({ cart: null });
    }

    const cart = carts[0];
    res.json({ 
      cart: {
        ...cart,
        items: typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items
      }
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = req.userId;
    const sessionId = req.headers['x-session-id'] as string || `sess_${Date.now()}`;

    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Delete old cart
    await prisma.$executeRawUnsafe(`
      DELETE FROM Cart WHERE ${userId ? 'user_id = ?' : 'session_id = ?'}
    `, userId || sessionId);

    // Insert new cart
    await prisma.$executeRawUnsafe(`
      INSERT INTO Cart (id, user_id, session_id, items, total, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, id, userId, sessionId, JSON.stringify(items), total, expiresAt);

    res.json({ message: 'Carrinho salvo', id });
  } catch (error: any) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/cart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total } = req.body;

    await prisma.$executeRawUnsafe(`
      UPDATE Cart 
      SET items = ?, total = ?, updated_at = NOW()
      WHERE id = ?
    `, JSON.stringify(items), total, id);

    res.json({ message: 'Carrinho atualizado' });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const userId = req.userId;
    const sessionId = req.headers['x-session-id'] as string;

    await prisma.$executeRawUnsafe(`
      DELETE FROM Cart WHERE ${userId ? 'user_id = ?' : 'session_id = ?'}
    `, userId || sessionId);

    res.json({ message: 'Carrinho deletado' });
  } catch (error: any) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔔 PUSH NOTIFICATIONS
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    const userId = req.userId;

    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      return res.status(400).json({ error: 'Dados de subscrição inválidos' });
    }

    const id = `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO PushSubscription 
      (id, user_id, endpoint, keys_auth, keys_p256dh, user_agent, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())
      ON DUPLICATE KEY UPDATE is_active = true, updated_at = NOW()
    `, id, userId, endpoint, keys.auth, keys.p256dh, req.headers['user-agent'] || '');

    res.json({ message: 'Subscrito com sucesso' });
  } catch (error: any) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/push/send', requireAdmin, async (req, res) => {
  try {
    const { title, body, url, user_id } = req.body;

    // TODO: Implement web-push library para enviar notificações
    // Requer configuração de VAPID keys no .env
    
    res.json({ message: 'Push notification enviado', sent: 0 });
  } catch (error: any) {
    console.error('Error sending push:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔗 ERP WEBHOOKS
app.post('/api/webhooks/stock-update', async (req, res) => {
  try {
    const { product_id, stock, source } = req.body;

    if (!product_id || stock === undefined) {
      return res.status(400).json({ error: 'product_id e stock são obrigatórios' });
    }

    // Log webhook event
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO WebhookEvent 
      (id, event_type, payload, source, status, created_at, updated_at)
      VALUES (?, 'stock.updated', ?, ?, 'pending', NOW(), NOW())
    `, eventId, JSON.stringify(req.body), source || 'external_erp');

    // Update product stock
    await prisma.product.update({
      where: { id: product_id },
      data: { 
        estoque: stock,
        updated_at: new Date()
      }
    });

    // Mark event as processed
    await prisma.$executeRawUnsafe(`
      UPDATE WebhookEvent 
      SET status = 'processed', processed_at = NOW() 
      WHERE id = ?
    `, eventId);

    res.json({ message: 'Estoque atualizado via webhook', product_id, stock });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    // Mark as failed
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE WebhookEvent 
        SET status = 'failed', error_message = ?, retry_count = retry_count + 1 
        WHERE id = ?
      `, error.message, req.body.event_id);
    } catch {}

    res.status(500).json({ error: error.message });
  }
});

app.get('/api/webhooks/events', requireAdmin, async (req, res) => {
  try {
    const { status, event_type } = req.query;
    
    let query = 'SELECT * FROM WebhookEvent WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const events = await prisma.$queryRawUnsafe<any[]>(query, ...params);
    res.json({ events, total: events.length });
  } catch (error: any) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// END BUILD 131
// ============================================================================

// ============================================================================
// PHASE 4: CRON JOBS - Automated Tasks
// ============================================================================

/**
 * CRON JOB 1: Check low stock alerts
 * Frequency: Every 30 minutes
 * Schedule: star-slash-30 star star star star (cron format)
 * Trigger with Google Cloud Scheduler
 */
app.post('/api/cron/low-stock-alerts', async (req, res) => {
  try {
    console.log('📦 [CRON] Iniciando verificação de estoque baixo...');
    const result = await checkLowStockAlerts();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro na verificação de estoque:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB 2: Process abandoned carts
 * Frequency: Every hour (0 * * * *)
 */
app.post('/api/cron/abandoned-carts', async (req, res) => {
  try {
    console.log('🛒 [CRON] Processando carrinhos abandonados...');
    const result = await processAbandonedCarts();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro no processamento de carrinhos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB 3: Calculate daily metrics
 * Frequency: Daily at 23:59 (59 23 * * *)
 */
app.post('/api/cron/daily-metrics', async (req, res) => {
  try {
    console.log('📊 [CRON] Calculando métricas diárias...');
    const result = await calculateDailyMetrics();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro no cálculo de métricas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB 4: Cleanup old carts
 * Frequency: Daily at 02:00 (0 2 * * *)
 */
app.post('/api/cron/cleanup-carts', async (req, res) => {
  try {
    console.log('🧹 [CRON] Limpando carrinhos antigos...');
    const result = await cleanupOldCarts();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro na limpeza de carrinhos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB 5: Update featured products
 * Frequency: Weekly on Sunday at 00:00 (0 0 * * 0)
 */
app.post('/api/cron/update-featured', async (req, res) => {
  try {
    console.log('⭐ [CRON] Atualizando produtos em destaque...');
    const result = await updateFeaturedProducts();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro ao atualizar produtos em destaque:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB 6: Send weekly report
 * Frequency: Weekly on Monday at 09:00 (0 9 * * 1)
 */
app.post('/api/cron/weekly-report', async (req, res) => {
  try {
    console.log('📧 [CRON] Enviando relatório semanal...');
    const result = await sendWeeklyReport();
    res.json({
      success: true,
      data: result,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro ao enviar relatório:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CRON JOB MASTER: Run all cron jobs manually (Admin only)
 * For testing purposes
 */
app.post('/api/cron/run-all', requireAdmin, async (req, res) => {
  try {
    console.log('🤖 [CRON] Executando TODOS os cron jobs manualmente...');

    const results = await Promise.allSettled([
      checkLowStockAlerts(),
      processAbandonedCarts(),
      calculateDailyMetrics(),
      cleanupOldCarts(),
      updateFeaturedProducts(),
      sendWeeklyReport()
    ]);

    const summary = results.map((result, index) => {
      const jobNames = [
        'Low Stock Alerts',
        'Abandoned Carts',
        'Daily Metrics',
        'Cleanup Carts',
        'Update Featured',
        'Weekly Report'
      ];

      return {
        job: jobNames[index],
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      };
    });

    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('❌ [CRON] Erro ao executar todos os cron jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/cron/create-abandoned-carts-table
 * Temporary migration endpoint to create abandoned_carts table
 * Call once to create the table, then can be removed
 */
app.post('/api/cron/create-abandoned-carts-table', async (req, res) => {
  try {
    console.log('📦 [MIGRATION] Creating abandoned_carts table...');

    // Execute raw SQL to create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`abandoned_carts\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`user_id\` VARCHAR(100) NULL,
        \`user_email\` VARCHAR(200) NULL,
        \`user_name\` VARCHAR(200) NULL,
        \`items\` JSON NOT NULL COMMENT 'Array de produtos no carrinho',
        \`total_aoa\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`cart_data\` JSON NULL COMMENT 'Dados adicionais do carrinho',
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'abandoned' COMMENT 'abandoned, recovered, expired',
        \`reminder_sent\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`reminder_sent_at\` DATETIME(3) NULL,
        \`recovered_at\` DATETIME(3) NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        \`expires_at\` DATETIME(3) NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_email\` (\`user_email\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_reminder_sent\` (\`reminder_sent\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ [MIGRATION] Table created successfully!');

    // Verify table exists
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SHOW TABLES LIKE 'abandoned_carts'
    `);

    if (result.length > 0) {
      console.log('✅ [MIGRATION] Verification: Table exists');

      // Show table structure
      const structure = await prisma.$queryRawUnsafe<any[]>(`
        DESCRIBE abandoned_carts
      `);

      res.json({
        success: true,
        message: 'Table abandoned_carts created successfully',
        tableExists: true,
        structure: structure
      });
    } else {
      res.json({
        success: false,
        message: 'Table creation command executed but table not found',
        tableExists: false
      });
    }
  } catch (error: any) {
    console.error('❌ [MIGRATION] Error creating table:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// END PHASE 4
// ============================================================================

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
