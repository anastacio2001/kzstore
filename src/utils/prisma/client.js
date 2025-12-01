"use strict";
/**
 * Cliente Prisma centralizado para KZSTORE
 * Substitui o cliente Supabase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.disconnectPrisma = disconnectPrisma;
const client_1 = require("@prisma/client");
let prismaInstance;
/**
 * Cliente Prisma singleton
 * Reutiliza a mesma instância em desenvolvimento (hot reload)
 */
function getPrismaClient() {
    if (!prismaInstance) {
        if (process.env.NODE_ENV === 'production') {
            prismaInstance = new client_1.PrismaClient({
                log: ['error', 'warn'],
            });
        }
        else {
            // Em desenvolvimento, reutilizar instância global
            if (!global.prisma) {
                global.prisma = new client_1.PrismaClient({
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
async function disconnectPrisma() {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
    }
}
// Export default para facilitar importação
exports.default = getPrismaClient;
