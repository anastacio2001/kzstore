/**
 * Script de teste para conexão com Google Cloud SQL
 * Execute: npx tsx backend/test-cloud-db.ts
 */

import { PrismaClient } from '@prisma/client';

async function testCloudDatabase() {
  console.log('🧪 [TEST] Testando conexão com Google Cloud SQL...\n');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Teste 1: Conexão básica
    console.log('📡 [TEST 1] Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Teste 2: Query simples
    console.log('📡 [TEST 2] Executando query de teste...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada com sucesso:', result);
    console.log();

    // Teste 3: Listar bancos de dados
    console.log('📡 [TEST 3] Listando bancos de dados...');
    const databases: any = await prisma.$queryRaw`SHOW DATABASES`;
    console.log('✅ Bancos de dados disponíveis:');
    databases.forEach((db: any) => {
      console.log(`   - ${db.Database}`);
    });
    console.log();

    // Teste 4: Verificar se kzstore_prod existe
    console.log('📡 [TEST 4] Verificando banco kzstore_prod...');
    const hasKzstore = databases.some((db: any) => db.Database === 'kzstore_prod');
    
    if (hasKzstore) {
      console.log('✅ Banco kzstore_prod já existe!');
    } else {
      console.log('⚠️  Banco kzstore_prod não existe.');
      console.log('📝 Criando banco kzstore_prod...');
      await prisma.$executeRawUnsafe(`CREATE DATABASE kzstore_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('✅ Banco kzstore_prod criado com sucesso!');
    }

  } catch (error) {
    console.error('❌ [ERROR] Erro ao conectar:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Dica: O servidor não está acessível. Verifique:');
        console.log('   1. IP público está ativado no Google Cloud SQL');
        console.log('   2. Seu IP está nas redes autorizadas');
        console.log('   3. Firewall não está bloqueando a porta 3306');
      } else if (error.message.includes('Access denied')) {
        console.log('\n💡 Dica: Credenciais incorretas. Verifique:');
        console.log('   1. Senha do usuário root');
        console.log('   2. Usuário tem permissões');
      }
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão encerrada.');
  }
}

testCloudDatabase().catch((error) => {
  console.error('❌ [FATAL] Erro fatal:', error);
  process.exit(1);
});
