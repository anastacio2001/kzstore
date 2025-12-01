/**
 * Script para criar usuário de teste
 * Execute: node criar-usuario.js
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarUsuario() {
  console.log('🔧 Criando usuário de teste...\n');

  const email = 'teste@kzstore.com';
  const senha = 'senha123'; // Senha simples para teste
  const nome = 'Usuário Teste';

  try {
    // Verificar se usuário já existe
    const existente = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (existente) {
      console.log('⚠️  Usuário já existe!');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', senha);
      console.log('\n✅ Use essas credenciais para fazer login!');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.customerProfile.create({
      data: {
        email: email,
        password: hashedPassword,
        nome: nome,
        telefone: '+244931054015',
        role: 'customer',
        is_admin: false,
        is_active: true
      }
    });

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('👤 Nome:', nome);
    console.log('🆔 ID:', usuario.id);
    console.log('\n🎉 Agora você pode fazer login no site!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Também criar um admin
async function criarAdmin() {
  console.log('\n🔧 Criando usuário ADMIN...\n');

  const email = 'admin@kzstore.com';
  const senha = 'kzstore2024'; // Senha simples para teste (demo)
  const nome = 'Administrador KZSTORE';

  try {
    // Verificar se admin já existe
    const existente = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (existente) {
      console.log('⚠️  Admin já existe!');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', senha);
      console.log('\n✅ Use essas credenciais para acessar o painel admin!');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar admin
    const admin = await prisma.customerProfile.create({
      data: {
        email: email,
        password: hashedPassword,
        nome: nome,
        telefone: '+244931054015',
        role: 'admin',
        is_admin: true,
        is_active: true
      }
    });

    console.log('✅ Admin criado com sucesso!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('👤 Nome:', nome);
    console.log('🆔 ID:', admin.id);
    console.log('\n🎉 Acesse http://localhost:3000/#admin');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
(async () => {
  await criarUsuario();
  await criarAdmin();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 RESUMO DAS CREDENCIAIS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n👤 USUÁRIO CLIENTE:');
  console.log('   Email: teste@kzstore.com');
  console.log('   Senha: senha123');
  console.log('\n👑 USUÁRIO ADMIN:');
  console.log('   Email: admin@kzstore.com');
  console.log('   Senha: kzstore2024');
  console.log('   URL: http://localhost:3000/#admin');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Pronto para testar!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();
