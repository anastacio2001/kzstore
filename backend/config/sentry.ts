import * as Sentry from '@sentry/node';
import { Express } from 'express';

/**
 * Inicializa o Sentry para monitoramento de erros
 * Deve ser chamado ANTES de qualquer rota ser definida
 */
export function initializeSentry(app: Express) {
  // Sentry temporariamente desabilitado
  console.log('⚠️  Sentry desabilitado temporariamente');
  return;

  const SENTRY_DSN = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  // Só inicializa se DSN estiver configurado
  if (!SENTRY_DSN) {
    console.log('⚠️  Sentry DSN não configurado - Error tracking desabilitado');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment,
    integrations: [
      // Integração com Express
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% em produção, 100% em dev

    // Filtrar informações sensíveis
    beforeSend(event, hint) {
      // Remove dados sensíveis de headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove dados sensíveis do body
      if (event.request?.data) {
        const data = event.request.data as any;
        if (data.password) data.password = '[FILTERED]';
        if (data.token) data.token = '[FILTERED]';
        if (data.credit_card) data.credit_card = '[FILTERED]';
      }

      return event;
    },

    // Ignorar erros conhecidos/esperados
    ignoreErrors: [
      'Non-Error exception captured',
      'Non-Error promise rejection captured',
      /timeout/i,
      /cancelled/i,
      'Navigation cancelled',
      'ResizeObserver loop limit exceeded'
    ],
  });

  console.log(`✅ Sentry inicializado (${environment})`);
}

/**
 * ErrorHandler do Sentry - deve ser adicionado DEPOIS de todas as rotas
 * mas ANTES de outros error handlers
 */
export const sentryErrorHandler = (err: any, req: any, res: any, next: any) => {
  Sentry.captureException(err);
  next(err);
};

/**
 * Captura exceção manualmente
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Captura mensagem de log
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Define contexto de usuário para tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username
  });
}

/**
 * Limpa contexto de usuário
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

export default Sentry;
