import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  const connection = await mysql.createConnection({
    host: '34.45.141.226',
    user: 'kzstore_app',
    password: 'Kzstore2024!',
    database: 'kzstore_prod',
    multipleStatements: true
  });

  try {
    console.log('🔄 Conectado ao banco de dados...');
    
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'migration_build_131.sql'),
      'utf-8'
    );

    console.log('📄 Executando migration_build_131.sql...');
    await connection.query(sqlFile);

    console.log('✅ Migração Build 131 aplicada com sucesso!');
    console.log('📊 Verificando tabelas criadas...');

    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'kzstore_prod' 
      AND TABLE_NAME IN (
        'ShippingZone', 
        'NewsletterSubscriber', 
        'EmailCampaign', 
        'Cart', 
        'PushSubscription', 
        'WebhookEvent'
      )
    `);

    console.log('✅ Tabelas encontradas:', tables);

    const [zones] = await connection.query('SELECT COUNT(*) as count FROM ShippingZone');
    console.log(`✅ Zonas de envio: ${(zones as any)[0].count}`);

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

applyMigration();
