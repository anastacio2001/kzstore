/**
 * Cliente Prisma centralizado para KZSTORE
 * Substitui o cliente Supabase
 */

import { PrismaClient } from '@prisma/client';

// Declaração global para evitar múltiplas instâncias em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

/**
 * Cliente Prisma singleton
 * Reutiliza a mesma instância em desenvolvimento (hot reload)
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    if (process.env.NODE_ENV === 'production') {
      prismaInstance = new PrismaClient({
        log: ['error', 'warn'],
      });
    } else {
      // Em desenvolvimento, reutilizar instância global
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: ['query', 'error', 'warn'],
        });
      }
      prismaInstance = global.prisma;
    }
  }
  
  return prismaInstance;
}

/**
 * Desconectar do banco de dados (útil em testes ou shutdown)
 */
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
  }
}

// Export default para facilitar importação
export default getPrismaClient;
