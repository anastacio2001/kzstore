import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Inicializa conexão com Redis
 */
export function initializeRedis() {
  // Redis desabilitado temporariamente no Cloud Run
  console.log('⚠️  Redis desabilitado - sistema funcionando sem cache');
  redisClient = null;
  return null;

  /*
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy() {
        // Não tentar reconectar
        return null;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis erro:', err.message);
      redisClient = null;
    });

    redisClient.on('close', () => {
      console.log('⚠️  Redis desconectado');
      redisClient = null;
    });

    // Conecta ao Redis com timeout
    Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]).catch((err) => {
      console.error('❌ Falha ao conectar ao Redis:', err.message);
      console.log('⚠️  Cache desabilitado - continuando sem Redis');
      if (redisClient) {
        redisClient.disconnect();
        redisClient = null;
      }
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar Redis:', error);
    console.log('⚠️  Cache desabilitado - continuando sem Redis');
    redisClient = null;
  }

  return redisClient;
  */
}

/**
 * Retorna o cliente Redis (ou null se não conectado)
 */
export function getRedisClient(): Redis | null {
  return redisClient;
}

/**
 * Middleware de cache para Express
 */
export function cacheMiddleware(duration: number = 3600) {
  return async (req: any, res: any, next: any) => {
    // Se Redis não está disponível, pula o cache
    if (!redisClient || !redisClient.status === 'ready') {
      return next();
    }

    // Só cacheia requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Tenta buscar do cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`📦 Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      // Se não tem cache, intercepta a resposta
      console.log(`🔍 Cache MISS: ${cacheKey}`);
      const originalJson = res.json.bind(res);

      res.json = (data: any) => {
        // Salva no cache
        redisClient!.setex(cacheKey, duration, JSON.stringify(data)).catch((err) => {
          console.error('Erro ao salvar cache:', err);
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de cache:', error);
      next();
    }
  };
}

/**
 * Invalida cache por padrão de chave
 */
export async function invalidateCache(pattern: string) {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🗑️  Cache invalidado: ${keys.length} chaves removidas (${pattern})`);
    }
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
  }
}

/**
 * Salva dados no cache
 */
export async function setCache(key: string, value: any, ttl: number = 3600) {
  if (!redisClient) return false;

  try {
    await redisClient.setex(`cache:${key}`, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
    return false;
  }
}

/**
 * Busca dados do cache
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao buscar cache:', error);
    return null;
  }
}

/**
 * Remove dados do cache
 */
export async function deleteCache(key: string) {
  if (!redisClient) return false;

  try {
    await redisClient.del(`cache:${key}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar cache:', error);
    return false;
  }
}

/**
 * Limpa todo o cache
 */
export async function flushCache() {
  if (!redisClient) return false;

  try {
    await redisClient.flushall();
    console.log('🗑️  Todo o cache foi limpo');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
}

/**
 * Fecha conexão com Redis (para graceful shutdown)
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    console.log('👋 Redis desconectado');
  }
}
