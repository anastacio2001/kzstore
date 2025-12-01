import { getPrismaClient } from './src/utils/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = getPrismaClient();

async function testLogin() {
  const testEmail = 'admin@kzstore.com';
  const testPassword = 'admin123';
  
  console.log('🔍 Testando login com:', testEmail);
  
  // 1. Verificar CustomerProfile
  const customer = await prisma.customerProfile.findUnique({
    where: { email: testEmail }
  });
  
  if (customer) {
    console.log('\n📧 Encontrado em CustomerProfile');
    console.log('  Email:', customer.email);
    console.log('  Nome:', customer.nome);
    console.log('  Active:', customer.is_active);
    console.log('  Password hash exists:', !!customer.password);
    
    if (customer.password) {
      const isValid = await bcrypt.compare(testPassword, customer.password);
      console.log('  ✅ Senha "admin123" válida?', isValid);
    }
  } else {
    console.log('\n❌ NÃO encontrado em CustomerProfile');
  }
  
  // 2. Verificar User table
  const user = await prisma.user.findUnique({
    where: { email: testEmail }
  });
  
  if (user) {
    console.log('\n🔐 Encontrado em User');
    console.log('  Email:', user.email);
    console.log('  Nome:', user.name);
    console.log('  Type:', user.user_type);
    console.log('  Active:', user.is_active);
    console.log('  Password hash exists:', !!user.password_hash);
    
    if (user.password_hash) {
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('  ✅ Senha "admin123" válida?', isValid);
    }
  } else {
    console.log('\n❌ NÃO encontrado em User');
  }
  
  // 3. Se não existe, criar
  if (!customer && !user) {
    console.log('\n🆕 Criando novo admin...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const newCustomer = await prisma.customerProfile.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        nome: 'Administrator',
        telefone: '244931054015',
        role: 'admin',
        is_admin: true,
        is_active: true
      }
    });
    
    console.log('✅ Admin criado em CustomerProfile:', newCustomer.email);
    console.log('📝 Use essas credenciais:');
    console.log('   Email: admin@kzstore.com');
    console.log('   Senha: admin123');
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
