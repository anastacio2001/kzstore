const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePassword() {
  const email = 'admin@kzstore.ao';
  const newPass = 'kzstore2024';
  try {
    const user = await prisma.customerProfile.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return;
    }
    const hashed = await bcrypt.hash(newPass, 10);
    await prisma.customerProfile.update({ where: { email }, data: { password: hashed } });
    console.log('✅ Updated password for', email);
  } catch (err) {
    console.error('❌ Error updating admin password:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
