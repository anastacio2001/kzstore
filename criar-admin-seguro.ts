import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║          CRIAR NOVO USUÁRIO ADMINISTRADOR               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Coletar dados do novo admin
    const nome = await question('Nome completo: ');
    const email = await question('Email: ');
    const telefone = await question('Telefone (com código do país, ex: +244931054015): ');
    let password = await question('Senha (mínimo 8 caracteres): ');

    // Validações
    if (!nome || nome.length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!telefone || telefone.length < 9) {
      throw new Error('Telefone inválido');
    }

    if (!password || password.length < 8) {
      throw new Error('Senha deve ter pelo menos 8 caracteres');
    }

    console.log('\n🔒 Gerando hash seguro da senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar se já existe um admin com este email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('\n⚠️  Usuário já existe!');
      const update = await question('Deseja atualizar a senha? (s/n): ');
      
      if (update.toLowerCase() === 's') {
        await prisma.user.update({
          where: { email },
          data: {
            nome,
            telefone,
            senha: hashedPassword,
            role: 'admin',
            is_admin: true,
            ativo: true
          }
        });
        console.log('\n✅ Senha atualizada com sucesso!');
      } else {
        console.log('\n❌ Operação cancelada.');
        rl.close();
        await prisma.$disconnect();
        return;
      }
    } else {
      // Criar novo admin
      const newAdmin = await prisma.user.create({
        data: {
          id: uuidv4(),
          nome,
          email,
          telefone,
          senha: hashedPassword,
          role: 'admin',
          is_admin: true,
          ativo: true
        }
      });

      console.log('\n✅ Usuário administrador criado com sucesso!');
      console.log(`\n📧 Email: ${newAdmin.email}`);
      console.log(`👤 Nome: ${newAdmin.nome}`);
      console.log(`🔑 Role: ${newAdmin.role}`);
    }

    // Perguntar se deseja remover admin antigo
    console.log('\n─────────────────────────────────────────────────────────');
    const removeOld = await question('\nDeseja remover usuários admin antigos? (s/n): ');
    
    if (removeOld.toLowerCase() === 's') {
      const oldAdmins = await prisma.user.findMany({
        where: {
          email: {
            not: email
          },
          role: 'admin'
        }
      });

      if (oldAdmins.length > 0) {
        console.log(`\n📋 Encontrados ${oldAdmins.length} admin(s) antigo(s):`);
        oldAdmins.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.email} (${admin.nome})`);
        });

        const confirmDelete = await question('\nConfirma remoção? (s/n): ');
        
        if (confirmDelete.toLowerCase() === 's') {
          for (const admin of oldAdmins) {
            await prisma.user.delete({
              where: { id: admin.id }
            });
            console.log(`   ✅ Removido: ${admin.email}`);
          }
          console.log('\n✅ Admins antigos removidos com sucesso!');
        }
      } else {
        console.log('\n✅ Nenhum admin antigo encontrado.');
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    CONFIGURAÇÃO COMPLETA                ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n🔐 Credenciais do Administrador:`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`\n⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!`);
    console.log(`\n🌐 Acesse: https://kzstore.ao/login\n`);

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdminUser();
