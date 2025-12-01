const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.customerProfile.findMany();
    console.log('Users count:', users.length);
    for (const u of users) {
      console.log('-', u.email, '|', u.nome, '|', u.role, '| active:', u.is_active);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
