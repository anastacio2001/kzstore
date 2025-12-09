import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAdmin } from '../auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to convert BigInt to Number in query results
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Apply auth middleware to all routes
router.use(authMiddleware as any);
router.use(requireAdmin as any);

// ========================================
// COMMENT MODERATION ENDPOINTS
// ========================================

// Get comment stats
router.get('/comments/stats', async (req, res) => {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'spam' THEN 1 ELSE 0 END) as spam
      FROM blog_comments
    `) as any[];

    const stats = result[0];
    res.json(convertBigIntToNumber({ stats }));
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({ error: 'Failed to fetch comment stats' });
  }
});

// Get comments by status
router.get('/comments', async (req, res) => {
  try {
    const { status = 'pending', page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT 
        bc.*,
        bp.title as post_title
      FROM blog_comments bc
      LEFT JOIN blog_posts bp ON bc.post_id = bp.id
    `;

    if (status !== 'all') {
      query += ` WHERE bc.status = ?`;
    }

    query += ` ORDER BY bc.created_at DESC LIMIT ? OFFSET ?`;

    const params = status !== 'all' 
      ? [status, parseInt(limit as string), offset]
      : [parseInt(limit as string), offset];

    const comments = await prisma.$queryRawUnsafe(query, ...params) as any[];

    res.json(convertBigIntToNumber({ comments }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Update comment status
router.put('/comments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'spam', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await prisma.$queryRawUnsafe(
      'UPDATE blog_comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      status, id
    );

    res.json({ message: 'Comment status updated successfully' });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ error: 'Failed to update comment status' });
  }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$queryRawUnsafe('DELETE FROM blog_comments WHERE id = ?', id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ========================================
// ANALYTICS ENDPOINTS
// ========================================

// Get overview stats
router.get('/analytics/overview', async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    let query = `
      SELECT 
        COUNT(DISTINCT bp.id) as total_posts,
        COALESCE(SUM(bp.views_count), 0) as total_views,
        COALESCE(SUM(bp.comments_count), 0) as total_comments,
        COALESCE(SUM(bp.shares_count), 0) as total_shares,
        COALESCE(AVG(bp.views_count), 0) as avg_views_per_post
      FROM blog_posts bp
      WHERE bp.status = 'published'
    `;
    
    let result;
    if (range !== 'all') {
      const days = parseInt(range as string);
      query += ` AND bp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
      result = await prisma.$queryRawUnsafe(query, days) as any[];
    } else {
      result = await prisma.$queryRawUnsafe(query) as any[];
    }

    const stats = result[0];
    res.json(convertBigIntToNumber({ stats }));
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Get top posts
router.get('/analytics/top-posts', async (req, res) => {
  try {
    const { range = '30d', limit = '10' } = req.query;
    
    let query = `
      SELECT 
        bp.id,
        bp.title,
        bp.views_count,
        bp.likes_count,
        bp.comments_count,
        bp.shares_count
      FROM blog_posts bp
      WHERE bp.status = 'published'
    `;
    
    let posts;
    if (range !== 'all') {
      const days = parseInt(range as string);
      query += ` AND bp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY bp.views_count DESC
      LIMIT ?`;
      posts = await prisma.$queryRawUnsafe(query, days, parseInt(limit as string)) as any[];
    } else {
      query += `
      ORDER BY bp.views_count DESC
      LIMIT ?`;
      posts = await prisma.$queryRawUnsafe(query, parseInt(limit as string)) as any[];
    }

    res.json(convertBigIntToNumber({ posts }));
  } catch (error) {
    console.error('Error fetching top posts:', error);
    res.status(500).json({ error: 'Failed to fetch top posts' });
  }
});

// Get category stats
router.get('/analytics/categories', async (req, res) => {
  try {
    const categories = await prisma.$queryRawUnsafe(`
      SELECT 
        bp.category,
        COUNT(*) as total_posts,
        SUM(bp.views_count) as total_views,
        AVG(bp.views_count) as avg_views_per_post
      FROM blog_posts bp
      WHERE bp.status = 'published'
      GROUP BY bp.category
      ORDER BY total_views DESC
    `) as any[];

    res.json(convertBigIntToNumber({ categories }));
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

// Get top searches
router.get('/analytics/top-searches', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const searches = await prisma.$queryRawUnsafe(`
      SELECT 
        search_query,
        COUNT(*) as search_count,
        AVG(results_count) as results_count
      FROM blog_searches
      WHERE results_count > 0
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT ?
    `, parseInt(limit as string)) as any[];

    res.json(convertBigIntToNumber({ searches }));
  } catch (error) {
    console.error('Error fetching top searches:', error);
    res.status(500).json({ error: 'Failed to fetch top searches' });
  }
});

// Get searches with no results
router.get('/analytics/searches-no-results', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const searches = await prisma.$queryRawUnsafe(`
      SELECT 
        search_query,
        COUNT(*) as search_count,
        0 as results_count
      FROM blog_searches
      WHERE results_count = 0
      GROUP BY search_query
      ORDER BY search_count DESC
      LIMIT ?
    `, parseInt(limit as string)) as any[];

    res.json(convertBigIntToNumber({ searches }));
  } catch (error) {
    console.error('Error fetching searches with no results:', error);
    res.status(500).json({ error: 'Failed to fetch searches with no results' });
  }
});

// ========================================
// SHARE STATS ENDPOINTS
// ========================================

// Get shares by platform
router.get('/shares/platforms', async (req, res) => {
  try {
    const platforms = await prisma.$queryRawUnsafe(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM blog_shares
      GROUP BY platform
      ORDER BY count DESC
    `) as any[];

    // Converter BigInt antes de processar
    const platformsConverted = convertBigIntToNumber(platforms);
    const total = platformsConverted.reduce((sum: number, p: any) => sum + p.count, 0);
    const platformsWithPercentage = platformsConverted.map((p: any) => ({
      ...p,
      percentage: total > 0 ? (p.count / total) * 100 : 0
    }));

    res.json(convertBigIntToNumber({ platforms: platformsWithPercentage, total }));
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

// Get top shared posts
router.get('/shares/top-posts', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const posts = await prisma.$queryRawUnsafe(`
      SELECT 
        bp.id,
        bp.title,
        bp.shares_count,
        SUM(CASE WHEN bs.platform = 'whatsapp' THEN 1 ELSE 0 END) as whatsapp_shares,
        SUM(CASE WHEN bs.platform = 'facebook' THEN 1 ELSE 0 END) as facebook_shares,
        SUM(CASE WHEN bs.platform = 'twitter' THEN 1 ELSE 0 END) as twitter_shares,
        SUM(CASE WHEN bs.platform = 'linkedin' THEN 1 ELSE 0 END) as linkedin_shares,
        SUM(CASE WHEN bs.platform = 'email' THEN 1 ELSE 0 END) as email_shares
      FROM blog_posts bp
      LEFT JOIN blog_shares bs ON bp.id = bs.post_id
      WHERE bp.status = 'published'
      GROUP BY bp.id
      ORDER BY bp.shares_count DESC
      LIMIT ?
    `, parseInt(limit as string)) as any[];

    res.json(convertBigIntToNumber({ posts }));
  } catch (error) {
    console.error('Error fetching top shared posts:', error);
    res.status(500).json({ error: 'Failed to fetch top shared posts' });
  }
});

// Get share timeline
router.get('/shares/timeline', async (req, res) => {
  try {
    const { days = '30' } = req.query;

    const timeline = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM blog_shares
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, parseInt(days as string)) as any[];

    res.json(convertBigIntToNumber({ timeline }));
  } catch (error) {
    console.error('Error fetching share timeline:', error);
    res.status(500).json({ error: 'Failed to fetch share timeline' });
  }
});

// ========================================
// NEWSLETTER POPUP STATS ENDPOINTS
// ========================================

// Get popup stats overview
router.get('/newsletter-popups/stats', async (req, res) => {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        SUM(CASE WHEN action = 'shown' THEN 1 ELSE 0 END) as total_shown,
        SUM(CASE WHEN action = 'subscribed' THEN 1 ELSE 0 END) as total_subscribed,
        SUM(CASE WHEN action = 'dismissed' THEN 1 ELSE 0 END) as total_dismissed,
        SUM(CASE WHEN action = 'closed' THEN 1 ELSE 0 END) as total_closed,
        CASE 
          WHEN SUM(CASE WHEN action = 'shown' THEN 1 ELSE 0 END) > 0 
          THEN (SUM(CASE WHEN action = 'subscribed' THEN 1 ELSE 0 END) / SUM(CASE WHEN action = 'shown' THEN 1 ELSE 0 END)) * 100
          ELSE 0 
        END as conversion_rate,
        AVG(TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP)) as avg_time_to_action
      FROM blog_newsletter_popups
    `) as any[];

    const stats = result[0];
    res.json(convertBigIntToNumber({ stats }));
  } catch (error) {
    console.error('Error fetching popup stats:', error);
    res.status(500).json({ error: 'Failed to fetch popup stats' });
  }
});

// Get popup performance by post
router.get('/newsletter-popups/by-post', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const posts = await prisma.$queryRawUnsafe(`
      SELECT 
        bp.id as post_id,
        bp.title as post_title,
        SUM(CASE WHEN np.action = 'shown' THEN 1 ELSE 0 END) as shown_count,
        SUM(CASE WHEN np.action = 'subscribed' THEN 1 ELSE 0 END) as subscribed_count,
        SUM(CASE WHEN np.action = 'dismissed' THEN 1 ELSE 0 END) as dismissed_count,
        SUM(CASE WHEN np.action = 'closed' THEN 1 ELSE 0 END) as closed_count,
        CASE 
          WHEN SUM(CASE WHEN np.action = 'shown' THEN 1 ELSE 0 END) > 0 
          THEN (SUM(CASE WHEN np.action = 'subscribed' THEN 1 ELSE 0 END) / SUM(CASE WHEN np.action = 'shown' THEN 1 ELSE 0 END)) * 100
          ELSE 0 
        END as conversion_rate
      FROM blog_posts bp
      LEFT JOIN blog_newsletter_popups np ON bp.id = np.post_id
      WHERE bp.status = 'published'
      GROUP BY bp.id
      ORDER BY shown_count DESC
      LIMIT ?
    `, parseInt(limit as string)) as any[];

    res.json(convertBigIntToNumber({ posts }));
  } catch (error) {
    console.error('Error fetching popup performance by post:', error);
    res.status(500).json({ error: 'Failed to fetch popup performance by post' });
  }
});

// Get popup timeline
router.get('/newsletter-popups/timeline', async (req, res) => {
  try {
    const { days = '30' } = req.query;

    const timeline = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN action = 'shown' THEN 1 ELSE 0 END) as shown,
        SUM(CASE WHEN action = 'subscribed' THEN 1 ELSE 0 END) as subscribed,
        SUM(CASE WHEN action = 'dismissed' THEN 1 ELSE 0 END) as dismissed,
        SUM(CASE WHEN action = 'closed' THEN 1 ELSE 0 END) as closed
      FROM blog_newsletter_popups
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, parseInt(days as string)) as any[];

    res.json(convertBigIntToNumber({ timeline }));
  } catch (error) {
    console.error('Error fetching popup timeline:', error);
    res.status(500).json({ error: 'Failed to fetch popup timeline' });
  }
});

export default router;
