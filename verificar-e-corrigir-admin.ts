import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarECorrigirAdmin() {
  try {
    console.log('🔍 Verificando usuários admin...\n');

    // Buscar todos os usuários
    const users = await prisma.customerProfile.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
      },
    });

    console.log(`📊 Total de usuários: ${users.length}\n`);

    // Listar todos os usuários
    users.forEach((user) => {
      console.log(`- ${user.email} (${user.nome}): role = ${user.role}`);
    });

    console.log('\n---\n');

    // Emails que devem ser admin
    const adminEmails = [
      'admin@kzstore.ao',
      'admin@kzstore.com',
      'geral@kzstore.com',
      'geral@kzstore.ao',
    ];

    // Atualizar usuários admin
    for (const email of adminEmails) {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        if (user.role !== 'admin') {
          console.log(`✏️  Atualizando ${user.email} de '${user.role}' para 'admin'`);
          await prisma.customerProfile.update({
            where: { id: user.id },
            data: { role: 'admin' },
          });
          console.log(`✅ ${user.email} agora é admin`);
        } else {
          console.log(`✓  ${user.email} já é admin`);
        }
      } else {
        console.log(`⚠️  Usuário ${email} não encontrado no banco`);
      }
    }

    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarECorrigirAdmin();
