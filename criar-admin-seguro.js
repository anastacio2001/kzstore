/**
 * Script para criar usuário ADMIN com senha forte
 * 
 * USO:
 * node criar-admin-seguro.js
 * 
 * IMPORTANTE: Execute este script apenas UMA VEZ em produção!
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function validatePassword(password) {
  if (password.length < 8) {
    return 'Senha deve ter no mínimo 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra maiúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'Senha deve conter pelo menos um número';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
  }
  return null;
}

async function createAdmin() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║      CRIAR USUÁRIO ADMINISTRADOR - KZSTORE            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Verificar se já existe admin
    const existingAdmin = await prisma.customerProfile.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  ATENÇÃO: Já existe um usuário admin cadastrado!\n');
      console.log('   Email:', existingAdmin.email);
      console.log('   Nome:', existingAdmin.nome);
      console.log('   ID:', existingAdmin.id);
      console.log('\n');
      
      const continuar = await question('Deseja criar outro admin? (sim/não): ');
      if (continuar.toLowerCase() !== 'sim' && continuar.toLowerCase() !== 's') {
        console.log('\n❌ Operação cancelada.\n');
        rl.close();
        process.exit(0);
      }
    }

    // Coletar informações
    console.log('\n📝 Preencha as informações do administrador:\n');
    
    const nome = await question('Nome completo: ');
    if (!nome || nome.trim().length < 3) {
      console.log('\n❌ Nome inválido! Deve ter pelo menos 3 caracteres.\n');
      rl.close();
      process.exit(1);
    }

    const email = await question('Email: ');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('\n❌ Email inválido!\n');
      rl.close();
      process.exit(1);
    }

    // Verificar se email já existe
    const existingEmail = await prisma.customerProfile.findUnique({
      where: { email }
    });

    if (existingEmail) {
      console.log('\n❌ Este email já está cadastrado!\n');
      rl.close();
      process.exit(1);
    }

    const telefone = await question('Telefone (opcional): ');

    console.log('\n🔐 SENHA FORTE é obrigatória!\n');
    console.log('   Requisitos:');
    console.log('   ✓ Mínimo 8 caracteres');
    console.log('   ✓ Pelo menos 1 letra maiúscula');
    console.log('   ✓ Pelo menos 1 letra minúscula');
    console.log('   ✓ Pelo menos 1 número');
    console.log('   ✓ Pelo menos 1 caractere especial (!@#$%^&*)\n');

    let senha = '';
    let senhaValida = false;

    while (!senhaValida) {
      senha = await question('Senha: ');
      const error = validatePassword(senha);
      
      if (error) {
        console.log(`\n❌ ${error}\n`);
        continue;
      }

      const senhaConfirm = await question('Confirme a senha: ');
      
      if (senha !== senhaConfirm) {
        console.log('\n❌ As senhas não coincidem! Tente novamente.\n');
        continue;
      }

      senhaValida = true;
    }

    // Confirmar criação
    console.log('\n\n╔════════════════════════════════════════════════════════╗');
    console.log('║              CONFIRME OS DADOS                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   Nome:     ${nome}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Telefone: ${telefone || '(não informado)'}`);
    console.log(`   Role:     ADMIN`);
    console.log('\n');

    const confirmar = await question('Confirmar criação do admin? (sim/não): ');
    
    if (confirmar.toLowerCase() !== 'sim' && confirmar.toLowerCase() !== 's') {
      console.log('\n❌ Operação cancelada.\n');
      rl.close();
      process.exit(0);
    }

    // Criar admin
    console.log('\n⏳ Criando usuário administrador...\n');

    const hashedPassword = await bcrypt.hash(senha, 10);

    const admin = await prisma.customerProfile.create({
      data: {
        email,
        nome,
        telefone: telefone || null,
        password: hashedPassword,
        role: 'admin',
        is_admin: true,
        is_active: true
      }
    });

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║           ✅ ADMIN CRIADO COM SUCESSO!                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Nome:', admin.nome);
    console.log('   Role:', admin.role);
    console.log('\n');
    console.log('🔐 IMPORTANTE: Guarde estas credenciais em local seguro!\n');
    console.log('   Email:', email);
    console.log('   Senha: ********** (não será mostrada novamente)\n');
    console.log('💡 Você pode fazer login em: http://localhost:3000\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro ao criar admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Executar
createAdmin();
