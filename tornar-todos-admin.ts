import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function tornarTodosAdmin() {
  try {
    console.log('🔧 KZSTORE - Tornar TODOS os usuários admin (temporário para debug)\n');

    const result = await prisma.customerProfile.updateMany({
      where: {
        role: 'customer', // Apenas usuários que são customer
      },
      data: {
        role: 'admin',
      },
    });

    console.log(`✅ ${result.count} usuários atualizados para admin!`);

    // Listar todos
    const users = await prisma.customerProfile.findMany({
      select: {
        email: true,
        nome: true,
        role: true,
      },
    });

    console.log('\n📋 Usuários após atualização:\n');
    users.forEach((user) => {
      console.log(`👑 ${user.email} (${user.nome}) - ${user.role}`);
    });

    console.log('\n⚠️  IMPORTANTE: Após testar, você deve reverter alguns usuários de volta para "customer"!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

tornarTodosAdmin();
