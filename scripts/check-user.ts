import { getPrismaClient } from '../src/utils/prisma/client';

const prisma = getPrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'teste@kzstore.ao' } 
  });
  console.log('User:', user);
  await prisma.$disconnect();
}

checkUser();
