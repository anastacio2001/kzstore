import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function criarUsuarioTeste() {
  try {
    console.log('🔐 Criando usuário de teste...\n');

    const hashedPassword = await bcrypt.hash('Test123!', 10);

    const user = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'teste.pedido@kzstore.ao',
        password_hash: hashedPassword,
        user_type: 'admin',
        is_active: true,
      },
    });

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email: teste.pedido@kzstore.ao');
    console.log('🔑 Senha: Test123!');
    console.log('\nDetalhes:', user);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuarioTeste();
