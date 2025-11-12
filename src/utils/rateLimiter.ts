/**
 * Sistema de Rate Limiting Client-Side
 * Previne spam e abuso de formulários, cupons, etc.
 */

interface RateLimitConfig {
  maxAttempts: number; // Máximo de tentativas
  windowMs: number; // Janela de tempo em milissegundos
  blockDurationMs?: number; // Tempo de bloqueio após exceder limite
}

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Verifica se uma ação está permitida
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.records.get(key);

    // Se não existe registro, permitir
    if (!record) {
      this.records.set(key, {
        count: 1,
        firstAttempt: now
      });
      return true;
    }

    // Se está bloqueado
    if (record.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // Se a janela expirou, resetar
    if (now - record.firstAttempt > config.windowMs) {
      this.records.set(key, {
        count: 1,
        firstAttempt: now
      });
      return true;
    }

    // Incrementar contador
    record.count++;

    // Se excedeu o limite
    if (record.count > config.maxAttempts) {
      if (config.blockDurationMs) {
        record.blockedUntil = now + config.blockDurationMs;
      }
      return false;
    }

    return true;
  }

  /**
   * Obter tempo restante de bloqueio (em segundos)
   */
  getBlockedTime(key: string): number {
    const record = this.records.get(key);
    if (!record?.blockedUntil) return 0;

    const remaining = Math.ceil((record.blockedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Resetar rate limit para uma chave
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Limpar registros antigos (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    this.records.forEach((record, key) => {
      // Remover se a janela expirou há mais de 1 hora
      if (now - record.firstAttempt > 3600000) {
        this.records.delete(key);
      }
    });
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Limpar registros a cada 10 minutos
setInterval(() => rateLimiter.cleanup(), 600000);

// Configurações pré-definidas
export const RATE_LIMIT_CONFIGS = {
  // Aplicar cupom: 5 tentativas por minuto
  COUPON: {
    maxAttempts: 5,
    windowMs: 60000, // 1 minuto
    blockDurationMs: 300000 // 5 minutos de bloqueio
  },

  // Login: 3 tentativas a cada 5 minutos
  LOGIN: {
    maxAttempts: 3,
    windowMs: 300000, // 5 minutos
    blockDurationMs: 900000 // 15 minutos de bloqueio
  },

  // Criar pedido: 3 pedidos a cada 5 minutos
  CREATE_ORDER: {
    maxAttempts: 3,
    windowMs: 300000, // 5 minutos
    blockDurationMs: 600000 // 10 minutos de bloqueio
  },

  // Enviar formulário de contato: 2 por hora
  CONTACT_FORM: {
    maxAttempts: 2,
    windowMs: 3600000, // 1 hora
    blockDurationMs: 7200000 // 2 horas de bloqueio
  },

  // Criar avaliação: 5 por dia
  CREATE_REVIEW: {
    maxAttempts: 5,
    windowMs: 86400000, // 24 horas
    blockDurationMs: 86400000 // 24 horas de bloqueio
  },

  // Busca: 30 por minuto (prevenir DDoS)
  SEARCH: {
    maxAttempts: 30,
    windowMs: 60000, // 1 minuto
    blockDurationMs: 60000 // 1 minuto de bloqueio
  }
};

/**
 * Verificar se uma ação está permitida
 * @param action Nome da ação (ex: 'coupon', 'login')
 * @param identifier Identificador único (ex: email, IP simulado)
 */
export const checkRateLimit = (
  action: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string
): { allowed: boolean; blockedTime?: number } => {
  const config = RATE_LIMIT_CONFIGS[action];
  const key = `${action}:${identifier}`;
  
  const allowed = rateLimiter.isAllowed(key, config);
  
  if (!allowed) {
    const blockedTime = rateLimiter.getBlockedTime(key);
    return { allowed: false, blockedTime };
  }

  return { allowed: true };
};

/**
 * Resetar rate limit para um usuário/ação
 */
export const resetRateLimit = (action: string, identifier: string): void => {
  const key = `${action}:${identifier}`;
  rateLimiter.reset(key);
};

/**
 * Hook React para rate limiting
 */
export const useRateLimit = (
  action: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string
) => {
  const attempt = () => {
    const result = checkRateLimit(action, identifier);
    
    if (!result.allowed && result.blockedTime) {
      throw new Error(
        `Muitas tentativas. Tente novamente em ${result.blockedTime} segundos.`
      );
    }

    return result.allowed;
  };

  const reset = () => {
    resetRateLimit(action, identifier);
  };

  return { attempt, reset };
};

// Gerar um "fingerprint" do navegador (identificador único)
export const getBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');

  // Gerar hash simples
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
};
