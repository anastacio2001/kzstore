import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createAdminUser() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║          CRIAR NOVO USUÁRIO ADMINISTRADOR               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Dados do novo admin
  const nome = 'Ladislau Anastacio';
  const email = 'l.anastacio001@gmail.com';
  const telefone = '+393512572408';
  const password = 'Mae2019@@@';

  console.log(`📋 Nome: ${nome}`);
  console.log(`📧 Email: ${email}`);
  console.log(`📱 Telefone: ${telefone}\n`);

  try {
    // Conectar ao banco de dados de produção
    console.log('🔌 Conectando ao banco de dados...');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'kzstore_app',
      password: 'Kzstore2024!',
      database: 'kzstore_prod'
    });

    console.log('✅ Conectado ao banco de dados!\n');

    // Gerar hash da senha
    console.log('🔒 Gerando hash seguro da senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar se usuário já existe
    const [existingUsers] = await connection.execute(
      'SELECT id, email, nome FROM customer_profiles WHERE email = ?',
      [email]
    );

    const users = existingUsers as any[];

    if (users.length > 0) {
      console.log('⚠️  Usuário já existe! Atualizando...');
      
      await connection.execute(
        `UPDATE customer_profiles SET 
          nome = ?,
          telefone = ?,
          password = ?,
          role = 'admin',
          is_admin = 1,
          is_active = 1,
          updated_at = NOW()
        WHERE email = ?`,
        [nome, telefone, hashedPassword, email]
      );

      console.log('✅ Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      const userId = uuidv4();
      
      await connection.execute(
        `INSERT INTO customer_profiles (
          id, nome, email, telefone, password, role, is_admin, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'admin', 1, 1, NOW(), NOW())`,
        [userId, nome, email, telefone, hashedPassword]
      );

      console.log('✅ Novo usuário administrador criado com sucesso!');
    }

    // Listar todos os admins
    console.log('\n📋 Listando administradores:');
    const [admins] = await connection.execute(
      'SELECT email, nome, created_at FROM customer_profiles WHERE role = "admin" ORDER BY created_at DESC'
    );

    const adminList = admins as any[];
    adminList.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.nome}`);
    });

    // Remover admins antigos (exceto o novo)
    console.log('\n🗑️  Removendo administradores antigos...');
    const result = await connection.execute(
      'DELETE FROM customer_profiles WHERE role = "admin" AND email != ?',
      [email]
    );

    const deleteResult = result[0] as any;
    if (deleteResult.affectedRows > 0) {
      console.log(`✅ Removidos ${deleteResult.affectedRows} admin(s) antigo(s)`);
    } else {
      console.log('✅ Nenhum admin antigo para remover');
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    CONFIGURAÇÃO COMPLETA                ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\n🔐 Credenciais do Administrador:`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`\n⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!`);
    console.log(`\n🌐 URLs de Acesso:`);
    console.log(`   • https://kzstore.ao/login (quando DNS propagar)`);
    console.log(`   • https://kzstore-rkksacgala-no.a.run.app/login\n`);

    await connection.end();

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdminUser();
