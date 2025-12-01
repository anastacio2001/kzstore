import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

async function importData() {
  console.log('📦 Importando dados para produção...\n');
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'kzstore_app',
    password: 'Kzstore2024!',
    database: 'kzstore_prod',
    multipleStatements: true
  });

  try {
    const sql = readFileSync('data_only.sql', 'utf-8');
    
    // Remove problematic statements
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.startsWith('SET'))
      .filter(line => !line.startsWith('/*'))
      .filter(line => !line.startsWith('--'))
      .filter(line => line.trim().length > 0)
      .join('\n');
    
    console.log('🔄 Executando import...');
    await connection.query(cleanSql);
    
    console.log('✅ Dados importados com sucesso!\n');
    
    // Verificar dados importados
    const [users] = await connection.query('SELECT COUNT(*) as count FROM User');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM Product');
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM Category');
    
    console.log('📊 Dados em produção:');
    console.log(`   - Usuários: ${(users as any)[0].count}`);
    console.log(`   - Produtos: ${(products as any)[0].count}`);
    console.log(`   - Categorias: ${(categories as any)[0].count}`);
    
  } catch (error: any) {
    console.error('❌ Erro ao importar:', error.message);
  } finally {
    await connection.end();
  }
}

importData();
