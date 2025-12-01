import mysql from 'mysql2/promise';

async function createDatabase() {
  console.log('🔧 Criando banco de dados kzstore_prod...\n');
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'kzstore_app',
    password: 'Kzstore2024!',
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS kzstore_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Banco de dados kzstore_prod criado com sucesso!\n');
    
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('📋 Bancos de dados disponíveis:');
    console.log(databases);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await connection.end();
  }
}

createDatabase();
