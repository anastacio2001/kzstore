import { getPrismaClient } from './src/utils/prisma/client';

const prisma = getPrismaClient();

async function listarAdmins() {
  try {
    console.log('🔍 Buscando usuários admin...\n');
    
    // Buscar na tabela User (user_type = 'admin')
    const usersAdmin = await prisma.user.findMany({
      where: {
        user_type: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        user_type: true,
        created_at: true,
        last_login: true
      }
    });
    
    // Buscar na tabela CustomerProfile (legado)
    const customersAdmin = await prisma.customerProfile.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { is_admin: true }
        ]
      },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        is_admin: true,
        created_at: true
      }
    });
    
    console.log('📊 USUÁRIOS ADMIN (Tabela User):');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (usersAdmin.length === 0) {
      console.log('  ⚠️  Nenhum admin encontrado na tabela User\n');
    } else {
      usersAdmin.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sem nome'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tipo: ${user.user_type}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Criado em: ${user.created_at}`);
        console.log(`   Último login: ${user.last_login || 'Nunca'}\n`);
      });
    }
    
    console.log('\n📊 USUÁRIOS ADMIN (Tabela CustomerProfile - Legado):');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (customersAdmin.length === 0) {
      console.log('  ⚠️  Nenhum admin encontrado na tabela CustomerProfile\n');
    } else {
      customersAdmin.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.nome || 'Sem nome'}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Role: ${customer.role}`);
        console.log(`   is_admin: ${customer.is_admin}`);
        console.log(`   ID: ${customer.id}`);
        console.log(`   Criado em: ${customer.created_at}\n`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`✅ Total de admins encontrados: ${usersAdmin.length + customersAdmin.length}`);
    console.log(`   - Na tabela User: ${usersAdmin.length}`);
    console.log(`   - Na tabela CustomerProfile: ${customersAdmin.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao listar admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarAdmins();
