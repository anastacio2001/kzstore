/**
 * Blog Interactions API Routes
 * Gerencia likes, comentários, compartilhamentos e analytics de posts do blog
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// ============ LIKES ============

// Get likes count for a post
router.get('/blog/:postId/likes', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM blog_post_likes WHERE post_id = ${postId}
    `;
    
    res.json({ count: count[0]?.count || 0 });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// Toggle like on a post
router.post('/blog/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userEmail } = req.body;
    const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    // Check if already liked
    const existing = await prisma.$queryRaw`
      SELECT id FROM blog_post_likes 
      WHERE post_id = ${postId} AND user_email = ${userEmail}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Unlike
      await prisma.$executeRaw`
        DELETE FROM blog_post_likes 
        WHERE post_id = ${postId} AND user_email = ${userEmail}
      `;
      
      // Update counter
      await prisma.$executeRaw`
        UPDATE blog_posts 
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = ${postId}
      `;
      
      res.json({ liked: false, message: 'Like removed' });
    } else {
      // Like
      const likeId = uuidv4();
      await prisma.$executeRaw`
        INSERT INTO blog_post_likes (id, post_id, user_email, user_ip)
        VALUES (${likeId}, ${postId}, ${userEmail}, ${userIp})
      `;
      
      // Update counter
      await prisma.$executeRaw`
        UPDATE blog_posts 
        SET likes_count = likes_count + 1
        WHERE id = ${postId}
      `;
      
      res.json({ liked: true, message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ============ COMMENTS ============

// Get comments for a post
router.get('/blog/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const status = (req.query.status as string) || 'approved';
    
    const comments: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        c.*,
        (SELECT COUNT(*)::int FROM blog_post_comments WHERE parent_id = c.id) as replies_count
      FROM blog_post_comments c
      WHERE c.post_id = $1
        AND c.status = $2
        AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, postId, status);
    
    // Get replies for each comment
    for (const comment of comments) {
      const replies: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM blog_post_comments
        WHERE parent_id = $1 AND status = 'approved'
        ORDER BY created_at ASC
      `, comment.id);
      comment.replies = replies;
    }
    
    res.json({ comments });
  } catch (error) {
    console.error('❌ [BLOG] Error fetching comments:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Create new comment
router.post('/blog/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorName, authorEmail, authorWebsite, content, parentId } = req.body;
    const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    if (!authorName || !authorEmail || !content) {
      return res.status(400).json({ error: 'Name, email and content required' });
    }

    const commentId = uuidv4();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO blog_post_comments 
      (id, post_id, parent_id, author_name, author_email, author_website, content, status, user_ip, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
    `, commentId, postId, parentId || null, authorName, authorEmail, authorWebsite || null, content, userIp, userAgent || null);
    
    res.json({ 
      message: 'Comment submitted for moderation',
      commentId,
      status: 'pending'
    });
  } catch (error) {
    console.error('❌ [BLOG] Error creating comment:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// Admin: Approve comment
router.put('/admin/comments/:commentId/approve', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    await prisma.$executeRaw`
      UPDATE blog_post_comments 
      SET status = 'approved'
      WHERE id = ${commentId}
    `;
    
    // Update comments count
    const comment = await prisma.$queryRaw`
      SELECT post_id FROM blog_post_comments WHERE id = ${commentId}
    `;
    
    if (comment.length > 0) {
      await prisma.$executeRaw`
        UPDATE blog_posts 
        SET comments_count = (
          SELECT COUNT(*) FROM blog_post_comments 
          WHERE post_id = ${comment[0].post_id} AND status = 'approved'
        )
        WHERE id = ${comment[0].post_id}
      `;
    }
    
    res.json({ message: 'Comment approved' });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

// Admin: Delete comment
router.delete('/admin/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    await prisma.$executeRaw`
      DELETE FROM blog_post_comments WHERE id = ${commentId}
    `;
    
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============ SHARES ============

// Track share
router.post('/blog/:postId/share', async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.body;
    const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    if (!['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const shareId = uuidv4();
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO blog_post_shares (id, post_id, platform, user_ip)
      VALUES ($1, $2, $3, $4)
    `, shareId, postId, platform, userIp);
    
    // Update counter
    await prisma.$executeRawUnsafe(`
      UPDATE blog_posts 
      SET shares_count = shares_count + 1
      WHERE id = $1
    `, postId);
    
    res.json({ message: 'Share tracked' });
  } catch (error) {
    console.error('❌ [BLOG] Error tracking share:', error);
    res.status(500).json({ error: 'Erro ao registrar compartilhamento' });
  }
});

// ============ VIEWS & ANALYTICS ============

// Track view
router.post('/blog/:postId/view', async (req, res) => {
  try {
    const { postId } = req.params;
    const { sessionId, viewDuration } = req.body;
    const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'];
    
    const viewId = uuidv4();
    
    await prisma.$executeRaw`
      INSERT INTO blog_post_views 
      (id, post_id, user_ip, user_agent, referrer, session_id, view_duration)
      VALUES (
        ${viewId}, ${postId}, ${userIp}, ${userAgent || null}, 
        ${referrer || null}, ${sessionId || null}, ${viewDuration || null}
      )
    `;
    
    // Update views counter
    await prisma.$executeRaw`
      UPDATE blog_posts 
      SET views_count = views_count + 1
      WHERE id = ${postId}
    `;
    
    res.json({ message: 'View tracked' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Get post analytics
router.get('/blog/:postId/analytics', async (req, res) => {
  try {
    const { postId } = req.params;
    const days = Number(req.query.days) || 30;
    
    const post: any[] = await prisma.$queryRawUnsafe(`
      SELECT views_count, likes_count, comments_count, shares_count
      FROM blog_posts
      WHERE id = $1
    `, postId);
    
    const viewsByDay: any[] = await prisma.$queryRawUnsafe(`
      SELECT DATE(created_at) as date, COUNT(*)::int as views
      FROM blog_post_views
      WHERE post_id = $1
        AND created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, postId, days);
    
    const sharesByPlatform: any[] = await prisma.$queryRawUnsafe(`
      SELECT platform, COUNT(*)::int as count
      FROM blog_post_shares
      WHERE post_id = $1
      GROUP BY platform
    `, postId);
    
    const avgReadTime: any[] = await prisma.$queryRawUnsafe(`
      SELECT AVG(view_duration) as avg_duration
      FROM blog_post_views
      WHERE post_id = $1 AND view_duration IS NOT NULL
    `, postId);
    
    res.json({
      totals: post[0] || {},
      viewsByDay,
      sharesByPlatform,
      avgReadTime: avgReadTime[0]?.avg_duration || null
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all posts analytics (Admin)
router.get('/admin/blog/analytics', async (req, res) => {
  try {
    const topPosts = await prisma.$queryRaw`
      SELECT 
        id, title, slug, views_count, likes_count, comments_count, shares_count,
        published_at
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY views_count DESC
      LIMIT 10
    `;
    
    const totalStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_posts,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        SUM(comments_count) as total_comments,
        SUM(shares_count) as total_shares
      FROM blog_posts
      WHERE status = 'published'
    `;
    
    const recentActivity = await prisma.$queryRaw`
      SELECT 
        'comment' as type,
        author_name as user,
        created_at,
        post_id
      FROM blog_post_comments
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    res.json({
      topPosts,
      totalStats: totalStats[0] || {},
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
