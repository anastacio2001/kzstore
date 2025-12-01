/**
 * Rotas de API para Blog Posts
 * 
 * Endpoints:
 * - GET    /api/blog         - Listar posts (públicos)
 * - GET    /api/blog/:slug   - Ver post específico
 * - POST   /api/blog         - Criar post (admin)
 * - PUT    /api/blog/:id     - Atualizar post (admin)
 * - DELETE /api/blog/:id     - Deletar post (admin)
 * - POST   /api/blog/:id/publish - Publicar post (admin)
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAdmin } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
    }
  }
});

/**
 * Helper para criar slug a partir do título
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

/**
 * GET /api/blog - Listar posts publicados (público)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      status = 'published',
      category,
      featured,
      search,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (featured === 'true') {
      where.is_featured = true;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { excerpt: { contains: search as string } },
        { content: { contains: search as string } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { published_at: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,  // 📝 Incluir conteúdo na lista
          cover_image: true,
          category: true,
          tags: true,
          author_name: true,
          status: true,
          is_featured: true,
          published_at: true,
          views_count: true,
          likes_count: true,
          created_at: true,
          updated_at: true
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    console.log('✅ [BLOG GET] Retornando', posts.length, 'posts');
    if (posts.length > 0) {
      console.log('✅ [BLOG GET] Primeiro post:', posts[0].title, '- Content length:', posts[0].content?.length || 0);
    }

    res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Error fetching posts:', error);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

/**
 * GET /api/blog/:slug - Ver post específico (público)
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Incrementar contador de visualizações
    await prisma.blogPost.update({
      where: { slug },
      data: { views_count: { increment: 1 } }
    });

    res.json({ post });
  } catch (error: any) {
    console.error('❌ [BLOG] Error fetching post:', error);
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
});

/**
 * POST /api/blog - Criar novo post (admin)
 */
router.post('/', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      excerpt,
      content,
      cover_image,
      images,
      category,
      tags,
      meta_title,
      meta_description,
      meta_keywords,
      is_featured = false,
      status = 'draft'
    } = req.body;

    // Validações
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    // Criar slug único
    let slug = createSlug(title);
    
    // Verificar se slug já existe
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      // Adicionar timestamp ao slug para torná-lo único
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        cover_image,
        images: images || [],
        category,
        tags: tags || [],
        author_id: (req as any).userId,
        author_name: (req as any).userName || 'Admin',
        author_email: (req as any).userEmail,
        meta_title: meta_title || title,
        meta_description: meta_description || excerpt,
        meta_keywords: meta_keywords || [],
        is_featured,
        status,
        published_at: status === 'published' ? new Date() : null
      }
    });

    console.log('✅ [BLOG] Post created:', post.id, 'Status:', status);
    res.status(201).json({ post });
  } catch (error: any) {
    console.error('❌ [BLOG] Error creating post:', error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

/**
 * PUT /api/blog/:id - Atualizar post (admin)
 */
router.put('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [BLOG] Recebendo atualização:', {
      id,
      bodyKeys: Object.keys(req.body),
      hasContent: !!req.body.content,
      contentLength: req.body.content?.length || 0,
      title: req.body.title
    });
    
    const {
      title,
      excerpt,
      content,
      cover_image,
      images,
      category,
      tags,
      meta_title,
      meta_description,
      meta_keywords,
      is_featured,
      status
    } = req.body;

    // Atualizar slug se o título mudou
    let updateData: any = {
      title,
      excerpt,
      content,
      cover_image,
      images,
      category,
      tags,
      meta_title,
      meta_description,
      meta_keywords,
      is_featured,
      status
    };

    // Se está publicando, adicionar data de publicação
    if (status === 'published' && req.body.status !== 'published') {
      updateData.published_at = new Date();
    }

    if (title) {
      const post = await prisma.blogPost.findUnique({ where: { id } });
      if (post && post.title !== title) {
        updateData.slug = createSlug(title);
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    console.log('✅ [BLOG] Post atualizado:', id, 'Status:', status, 'Content length:', content?.length || 0);
    res.json(post);
  } catch (error: any) {
    console.error('❌ [BLOG] Error updating post:', error);
    res.status(500).json({ error: 'Erro ao atualizar post' });
  }
});

/**
 * POST /api/blog/:id/publish - Publicar post (admin)
 */
router.post('/:id/publish', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'published',
        published_at: new Date()
      }
    });

    console.log('✅ [BLOG] Post published:', id);
    res.json({ post });
  } catch (error: any) {
    console.error('❌ [BLOG] Error publishing post:', error);
    res.status(500).json({ error: 'Erro ao publicar post' });
  }
});

/**
 * POST /api/blog/:id/unpublish - Despublicar post (admin)
 */
router.post('/:id/unpublish', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'draft'
      }
    });

    console.log('✅ [BLOG] Post unpublished:', id);
    res.json({ post });
  } catch (error: any) {
    console.error('❌ [BLOG] Error unpublishing post:', error);
    res.status(500).json({ error: 'Erro ao despublicar post' });
  }
});

/**
 * DELETE /api/blog/:id - Deletar post (admin)
 */
router.delete('/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id }
    });

    console.log('✅ [BLOG] Post deleted:', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ [BLOG] Error deleting post:', error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
});

/**
 * GET /api/blog/categories/list - Listar categorias únicas (público)
 */
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories
      .map(c => c.category)
      .filter(c => c !== null);

    res.json({ categories: categoryList });
  } catch (error: any) {
    console.error('❌ [BLOG] Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

/**
 * POST /api/blog/upload - Upload de imagem (admin)
 */
router.post('/upload', authMiddleware, requireAdmin, upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Retornar URL da imagem
    const imageUrl = `/uploads/blog/${req.file.filename}`;
    
    console.log('✅ [BLOG] Imagem enviada:', imageUrl);
    
    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('❌ [BLOG] Erro no upload:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer upload da imagem' });
  }
});

export default router;
