const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      order_number: true,
      user_id: true,
      user_email: true,
      total: true,
      status: true,
      created_at: true
    }
  });

  console.log('\n📦 ÚLTIMOS 5 PEDIDOS:');
  console.log('=====================\n');
  
  orders.forEach((order, i) => {
    console.log(`${i + 1}. Pedido: ${order.order_number}`);
    console.log(`   User ID: ${order.user_id}`);
    console.log(`   Email: ${order.user_email}`);
    console.log(`   Total: ${order.total} AOA`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Criado: ${order.created_at}`);
    console.log('');
  });
  
  console.log(`✅ Total de pedidos: ${orders.length}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
