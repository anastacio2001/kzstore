/**
 * Script para criar usuários com domínio .ao
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarUsuarios() {
  console.log('🔧 Criando usuários com domínio .ao...\n');

  const usuarios = [
    {
      email: 'teste@kzstore.ao',
      senha: 'senha123',
      nome: 'Usuário Teste',
      role: 'customer',
      is_admin: false
    },
    {
      email: 'admin@kzstore.ao',
      senha: 'kzstore2024',
      nome: 'Administrador KZSTORE',
      role: 'admin',
      is_admin: true
    },
    {
      email: 'julio@kzstore.ao',
      senha: 'julio123',
      nome: 'Julio',
      role: 'customer',
      is_admin: false
    }
  ];

  for (const user of usuarios) {
    try {
      // Verificar se já existe
      const existente = await prisma.customerProfile.findUnique({
        where: { email: user.email }
      });

      if (existente) {
        console.log(`⚠️  ${user.email} já existe!`);
        continue;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(user.senha, 10);

      // Criar usuário
      const usuario = await prisma.customerProfile.create({
        data: {
          email: user.email,
          password: hashedPassword,
          nome: user.nome,
          telefone: '+244931054015',
          role: user.role,
          is_admin: user.is_admin,
          is_active: true
        }
      });

      console.log(`✅ ${user.nome} criado!`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🔑 ${user.senha}\n`);

    } catch (error) {
      console.error(`❌ Erro ao criar ${user.email}:`, error.message);
    }
  }

  await prisma.$disconnect();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 CREDENCIAIS DISPONÍVEIS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('👤 CLIENTE (Domínio .com):');
  console.log('   teste@kzstore.com / senha123\n');

  console.log('👤 CLIENTE (Domínio .ao):');
  console.log('   teste@kzstore.ao / senha123');
  console.log('   julio@kzstore.ao / julio123\n');

  console.log('👑 ADMIN (Domínio .com):');
  console.log('   admin@kzstore.com / admin123\n');

  console.log('👑 ADMIN (Domínio .ao):');
  console.log('   admin@kzstore.ao / kzstore2024\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Use QUALQUER um desses para fazer login!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

criarUsuarios();
