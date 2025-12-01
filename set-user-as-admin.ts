import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setUserAsAdmin() {
  try {
    console.log('🔍 KZSTORE - Definir Usuário como Admin\n');

    // Listar todos os usuários
    const users = await prisma.customerProfile.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
      },
    });

    console.log('📋 Usuários disponíveis:\n');
    users.forEach((user, index) => {
      const adminMark = user.role === 'admin' ? '👑' : '  ';
      console.log(`${adminMark} ${index + 1}. ${user.email} (${user.nome}) - ${user.role}`);
    });

    console.log('\n');
    const answer = await question('Digite o número do usuário que deseja tornar admin (ou pressione Enter para cancelar): ');

    if (!answer.trim()) {
      console.log('Operação cancelada.');
      rl.close();
      return;
    }

    const userIndex = parseInt(answer) - 1;

    if (isNaN(userIndex) || userIndex < 0 || userIndex >= users.length) {
      console.log('❌ Número inválido!');
      rl.close();
      return;
    }

    const selectedUser = users[userIndex];

    if (selectedUser.role === 'admin') {
      console.log(`✓  ${selectedUser.email} já é admin!`);
      rl.close();
      return;
    }

    console.log(`\n✏️  Atualizando ${selectedUser.email} para admin...`);

    await prisma.customerProfile.update({
      where: { id: selectedUser.id },
      data: { role: 'admin' },
    });

    console.log(`✅ ${selectedUser.email} agora é ADMIN!`);
    rl.close();
  } catch (error) {
    console.error('❌ Erro:', error);
    rl.close();
  } finally {
    await prisma.$disconnect();
  }
}

setUserAsAdmin();
