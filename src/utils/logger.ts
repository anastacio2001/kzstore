// Development logging utility
// In production, logs are disabled unless explicitly enabled

const isDev = import.meta.env.DEV;

export const devLog = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    // Errors are always logged
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  }
};

// For production monitoring (always active)
export const prodLog = {
  error: (context: string, error: any) => {
    console.error(`[ERROR] ${context}:`, error);
    // Aqui você pode adicionar integração com serviços como Sentry
  },
  warn: (context: string, message: string) => {
    console.warn(`[WARN] ${context}:`, message);
  }
};
