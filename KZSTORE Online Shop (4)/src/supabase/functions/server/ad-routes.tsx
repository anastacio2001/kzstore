import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const adRoutes = new Hono();

// Helper function to check permissions
const checkPermission = async (userId: string, permission: string): Promise<boolean> => {
  const member = await kv.get(`team_member:${userId}`);
  if (!member) return false;
  return member.permissoes?.[permission] === true;
};

// Get all advertisements
adRoutes.get('/', async (c) => {
  try {
    const ads = await kv.getByPrefix('ad:');
    
    // Sort by creation date (newest first)
    const sortedAds = ads.sort((a, b) => 
      new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
    
    return c.json({ ads: sortedAds });
  } catch (error) {
    console.log('Error fetching ads:', error);
    return c.json({ error: 'Failed to fetch ads', details: String(error) }, 500);
  }
});

// Get active advertisements by position
adRoutes.get('/active/:position', async (c) => {
  try {
    const position = c.req.param('position');
    const ads = await kv.getByPrefix('ad:');
    
    const now = new Date();
    const activeAds = ads.filter(ad => {
      if (!ad.ativo) return false;
      if (ad.posicao !== position) return false;
      
      const dataInicio = new Date(ad.data_inicio);
      if (dataInicio > now) return false;
      
      if (ad.data_fim) {
        const dataFim = new Date(ad.data_fim);
        if (dataFim < now) return false;
      }
      
      return true;
    });
    
    return c.json({ ads: activeAds });
  } catch (error) {
    console.log('Error fetching active ads:', error);
    return c.json({ error: 'Failed to fetch active ads', details: String(error) }, 500);
  }
});

// Get ad statistics
adRoutes.get('/stats', async (c) => {
  try {
    const ads = await kv.getByPrefix('ad:');
    
    const stats = {
      total_ads: ads.length,
      ads_ativos: ads.filter(ad => ad.ativo).length,
      total_cliques: ads.reduce((sum, ad) => sum + (ad.cliques || 0), 0),
      total_visualizacoes: ads.reduce((sum, ad) => sum + (ad.visualizacoes || 0), 0),
      ctr: 0
    };
    
    stats.ctr = stats.total_visualizacoes > 0 
      ? (stats.total_cliques / stats.total_visualizacoes) * 100 
      : 0;
    
    return c.json({ stats });
  } catch (error) {
    console.log('Error fetching ad stats:', error);
    return c.json({ error: 'Failed to fetch ad stats', details: String(error) }, 500);
  }
});

// Create new advertisement
adRoutes.post('/', async (c) => {
  try {
    const adData = await c.req.json();
    
    // Basic validation
    if (!adData.titulo || !adData.imagem_url || !adData.posicao) {
      return c.json({ error: 'Missing required fields: titulo, imagem_url, posicao' }, 400);
    }
    
    const ad = {
      id: `ad_${Date.now()}`,
      titulo: adData.titulo,
      descricao: adData.descricao || '',
      imagem_url: adData.imagem_url,
      link_url: adData.link_url || '',
      posicao: adData.posicao,
      tipo: adData.tipo || 'banner',
      ativo: adData.ativo !== undefined ? adData.ativo : true,
      data_inicio: adData.data_inicio || new Date().toISOString(),
      data_fim: adData.data_fim || null,
      cliques: 0,
      visualizacoes: 0,
      criado_por: adData.criado_por || 'admin',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    
    await kv.set(`ad:${ad.id}`, ad);
    
    return c.json({ ad, message: 'Advertisement created successfully' }, 201);
  } catch (error) {
    console.log('Error creating ad:', error);
    return c.json({ error: 'Failed to create advertisement', details: String(error) }, 500);
  }
});

// Update advertisement
adRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingAd = await kv.get(`ad:${id}`);
    if (!existingAd) {
      return c.json({ error: 'Advertisement not found' }, 404);
    }
    
    const updatedAd = {
      ...existingAd,
      ...updates,
      id: existingAd.id, // Preserve ID
      criado_em: existingAd.criado_em, // Preserve creation date
      criado_por: existingAd.criado_por, // Preserve creator
      cliques: existingAd.cliques, // Preserve stats
      visualizacoes: existingAd.visualizacoes,
      atualizado_em: new Date().toISOString()
    };
    
    await kv.set(`ad:${id}`, updatedAd);
    
    return c.json({ ad: updatedAd, message: 'Advertisement updated successfully' });
  } catch (error) {
    console.log('Error updating ad:', error);
    return c.json({ error: 'Failed to update advertisement', details: String(error) }, 500);
  }
});

// Delete advertisement
adRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const existingAd = await kv.get(`ad:${id}`);
    if (!existingAd) {
      return c.json({ error: 'Advertisement not found' }, 404);
    }
    
    await kv.del(`ad:${id}`);
    
    return c.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.log('Error deleting ad:', error);
    return c.json({ error: 'Failed to delete advertisement', details: String(error) }, 500);
  }
});

// Track ad view
adRoutes.post('/:id/view', async (c) => {
  try {
    const id = c.req.param('id');
    
    const ad = await kv.get(`ad:${id}`);
    if (!ad) {
      return c.json({ error: 'Advertisement not found' }, 404);
    }
    
    ad.visualizacoes = (ad.visualizacoes || 0) + 1;
    await kv.set(`ad:${id}`, ad);
    
    return c.json({ message: 'View tracked' });
  } catch (error) {
    console.log('Error tracking view:', error);
    return c.json({ error: 'Failed to track view', details: String(error) }, 500);
  }
});

// Track ad click
adRoutes.post('/:id/click', async (c) => {
  try {
    const id = c.req.param('id');
    
    const ad = await kv.get(`ad:${id}`);
    if (!ad) {
      return c.json({ error: 'Advertisement not found' }, 404);
    }
    
    ad.cliques = (ad.cliques || 0) + 1;
    await kv.set(`ad:${id}`, ad);
    
    return c.json({ message: 'Click tracked' });
  } catch (error) {
    console.log('Error tracking click:', error);
    return c.json({ error: 'Failed to track click', details: String(error) }, 500);
  }
});

export { adRoutes };
