import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const customers = await prisma.customerProfile.findMany({
      select: { id: true, nome: true, email: true, created_at: true, is_admin: true }
    });
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, created_at: true, user_type: true }
    });
    
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    
    console.log(`\n✅ CustomerProfiles: ${customers.length}`);
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Products: ${products}`);
    console.log(`✅ Orders: ${orders}\n`);
    
    if (customers.length > 0) {
      console.log('Últimos 5 CustomerProfiles:');
      customers.slice(-5).forEach(c => console.log(`  - ${c.email} (${c.nome})`));
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
