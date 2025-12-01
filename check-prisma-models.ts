import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('🔍 Modelos disponíveis no Prisma Client:');
console.log(Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

// Verificar se User existe
console.log('\n✅ Modelo User existe?', 'user' in prisma);
console.log('✅ Modelo TeamMember existe?', 'teamMember' in prisma);

prisma.$disconnect();
