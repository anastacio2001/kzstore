#!/usr/bin/env tsx

/**
 * Script para criar primeiro administrador
 * Uso: npm run create-admin
 */

import { getPrismaClient } from './src/utils/prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = getPrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  console.log('\n🔥 KZSTORE - Criar Administrador\n');

  // Email admin atual
  const currentEmail = 'l.anastacio001@gmail.com';
  
  // Perguntar dados
  const name = await question('Nome do admin (deixe vazio para usar "Antonio Anastacio"): ');
  const email = await question(`Email do admin (deixe vazio para usar "${currentEmail}"): `);
  const password = await question('Senha (mínimo 8 caracteres): ');

  const adminName = name.trim() || 'Antonio Anastacio';
  const adminEmail = (email.trim() || currentEmail).toLowerCase();

  if (password.length < 8) {
    console.error('❌ Senha deve ter no mínimo 8 caracteres');
    process.exit(1);
  }

  try {
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existing) {
      console.log('\n⚠️ Este email já está cadastrado.');
      const update = await question('Deseja atualizar a senha? (s/n): ');
      
      if (update.toLowerCase() === 's') {
        const passwordHash = await bcrypt.hash(password, 10);
        
        await prisma.user.update({
          where: { email: adminEmail },
          data: { password_hash: passwordHash }
        });
        
        console.log('\n✅ Senha do admin atualizada com sucesso!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Nova senha: ${password}\n`);
      }
      
      rl.close();
      process.exit(0);
    }

    // Hash da senha
    console.log('\n🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar admin
    console.log('👤 Criando administrador...');
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password_hash: passwordHash,
        name: adminName,
        user_type: 'admin',
        is_active: true
      }
    });

    // Log de atividade
    await prisma.activityLog.create({
      data: {
        user_id: admin.id,
        user_name: admin.name,
        user_role: 'admin',
        action_type: 'create',
        entity_type: 'user',
        entity_id: admin.id,
        description: `Admin ${adminName} foi criado`
      }
    });

    console.log('\n✅ Administrador criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Nome: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Senha: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Acesse: https://kzstore.ao/admin\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao criar admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
