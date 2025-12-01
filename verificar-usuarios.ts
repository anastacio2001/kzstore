import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'kzstore_app',
      password: 'Kzstore2024!',
      database: 'kzstore_prod'
    });

    console.log('✅ Conectado ao banco\n');

    // Contar usuários
    const [totals] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role='admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role='customer' THEN 1 END) as customers
      FROM customer_profiles`
    );

    console.log('📊 Estatísticas de Usuários:');
    console.log(totals);

    // Listar todos os usuários
    const [users] = await connection.execute(
      `SELECT id, nome, email, role, is_admin, is_active, created_at 
       FROM customer_profiles 
       ORDER BY created_at DESC`
    );

    console.log('\n👥 Lista de Usuários:');
    console.table(users);

    await connection.end();
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

checkUsers();
