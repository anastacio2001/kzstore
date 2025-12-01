import { getPrismaClient } from './src/utils/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = getPrismaClient();

async function testPassword() {
  const email = 'inaciofp779@gmail.com';
  
  const customer = await prisma.customerProfile.findUnique({
    where: { email }
  });
  
  if (!customer) {
    console.log('❌ Usuário não encontrado');
    return;
  }
  
  console.log('✅ Usuário:', customer.nome);
  console.log('📧 Email:', customer.email);
  console.log('🔐 Password hash:', customer.password?.substring(0, 30) + '...');
  console.log('');
  
  // Testar senhas comuns
  const senhasTeste = [
    'inacio123',
    '123456',
    'password',
    '925019060', // telefone
    'Inacio123',
    'inacio'
  ];
  
  console.log('🔍 Testando senhas comuns...\n');
  
  for (const senha of senhasTeste) {
    if (customer.password) {
      const match = await bcrypt.compare(senha, customer.password);
      if (match) {
        console.log('✅ SENHA ENCONTRADA:', senha);
        console.log('');
        console.log('📝 Credenciais funcionando:');
        console.log('   Email:', email);
        console.log('   Senha:', senha);
        await prisma.$disconnect();
        return;
      }
    }
  }
  
  console.log('❌ Nenhuma senha comum funcionou');
  console.log('💡 Você precisará resetar a senha ou criar novo usuário');
  
  await prisma.$disconnect();
}

testPassword();
