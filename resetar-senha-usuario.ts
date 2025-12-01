import { getPrismaClient } from './src/utils/prisma/client.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = getPrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function resetPassword() {
  try {
    console.log('🔐 RESETAR SENHA DE USUÁRIO\n');
    
    // Pedir email
    const email = await question('Digite o email do usuário: ');
    
    if (!email.trim()) {
      console.log('❌ Email não pode estar vazio');
      rl.close();
      return;
    }
    
    // Buscar usuário em CustomerProfile
    let customer = await prisma.customerProfile.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    // Buscar em User se não encontrar em CustomerProfile
    let user = null;
    if (!customer) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
    }
    
    if (!customer && !user) {
      console.log(`\n❌ Usuário não encontrado: ${email}`);
      console.log('\n📋 Usuários disponíveis:');
      
      const customers = await prisma.customerProfile.findMany({
        select: { email: true, nome: true },
        take: 10
      });
      
      customers.forEach(c => {
        console.log(`  - ${c.email} (${c.nome})`);
      });
      
      rl.close();
      return;
    }
    
    // Mostrar informações do usuário
    if (customer) {
      console.log('\n✅ Usuário encontrado em CustomerProfile:');
      console.log(`   Email: ${customer.email}`);
      console.log(`   Nome: ${customer.nome}`);
      console.log(`   Role: ${customer.role}`);
      console.log(`   Ativo: ${customer.is_active}`);
    } else if (user) {
      console.log('\n✅ Usuário encontrado em User:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.name}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   Ativo: ${user.is_active}`);
    }
    
    // Pedir nova senha
    const novaSenha = await question('\nDigite a nova senha (mínimo 6 caracteres): ');
    
    if (novaSenha.length < 6) {
      console.log('❌ Senha deve ter no mínimo 6 caracteres');
      rl.close();
      return;
    }
    
    // Confirmar
    const confirmar = await question(`\n⚠️  Confirma resetar senha para "${email}"? (sim/não): `);
    
    if (confirmar.toLowerCase() !== 'sim') {
      console.log('❌ Operação cancelada');
      rl.close();
      return;
    }
    
    // Hash da nova senha
    console.log('\n🔒 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar no banco
    if (customer) {
      await prisma.customerProfile.update({
        where: { id: customer.id },
        data: { password: hashedPassword }
      });
    } else if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password_hash: hashedPassword }
      });
    }
    
    console.log('\n✅ Senha resetada com sucesso!');
    console.log('\n📝 Novas credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${novaSenha}`);
    console.log('\n💡 Você já pode fazer login com essas credenciais.');
    
  } catch (error) {
    console.error('\n❌ Erro ao resetar senha:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

resetPassword();
