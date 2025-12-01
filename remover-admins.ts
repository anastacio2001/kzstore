import { getPrismaClient } from './src/utils/prisma/client';

const prisma = getPrismaClient();

async function removerAdmins() {
  try {
    console.log('🔄 Atualizando permissões de admin...\n');
    
    // Emails que devem permanecer como admin
    const adminAutorizados = [
      'l.anastacio001@gmail.com',
      'antoniioanastaciio@gmail.com'
    ];
    
    // 1. Atualizar tabela User - Remover admin de todos exceto os autorizados
    const resultUser = await prisma.user.updateMany({
      where: {
        user_type: 'admin',
        email: {
          notIn: adminAutorizados
        }
      },
      data: {
        user_type: 'customer'
      }
    });
    
    console.log(`✅ Tabela User: ${resultUser.count} usuários alterados para customer\n`);
    
    // 2. Atualizar tabela CustomerProfile - Remover admin de todos exceto os autorizados
    const resultCustomer1 = await prisma.customerProfile.updateMany({
      where: {
        role: 'admin',
        email: {
          notIn: adminAutorizados
        }
      },
      data: {
        role: 'customer',
        is_admin: false
      }
    });
    
    const resultCustomer2 = await prisma.customerProfile.updateMany({
      where: {
        is_admin: true,
        email: {
          notIn: adminAutorizados
        }
      },
      data: {
        role: 'customer',
        is_admin: false
      }
    });
    
    console.log(`✅ Tabela CustomerProfile: ${resultCustomer1.count + resultCustomer2.count} usuários alterados\n`);
    
    // 3. Verificar quem permanece como admin
    console.log('📊 Usuários que permanecem como ADMIN:\n');
    
    const adminsRestantes = await prisma.user.findMany({
      where: {
        user_type: 'admin'
      },
      select: {
        name: true,
        email: true,
        user_type: true
      }
    });
    
    const adminsRestantesCustomer = await prisma.customerProfile.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { is_admin: true }
        ]
      },
      select: {
        nome: true,
        email: true,
        role: true
      }
    });
    
    adminsRestantes.forEach(user => {
      console.log(`  ✓ ${user.name} (${user.email})`);
    });
    
    adminsRestantesCustomer.forEach(customer => {
      console.log(`  ✓ ${customer.nome} (${customer.email}) [Legado]`);
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Permissões atualizadas com sucesso!');
    console.log(`   Total de admins agora: ${adminsRestantes.length + adminsRestantesCustomer.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removerAdmins();
