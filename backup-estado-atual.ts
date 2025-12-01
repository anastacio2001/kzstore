import { getPrismaClient } from './src/utils/prisma/client.js';
import fs from 'fs';

const prisma = getPrismaClient();

async function backupCurrentState() {
  console.log('💾 Salvando estado atual do banco...\n');
  
  const backup: any = {
    timestamp: new Date().toISOString(),
    description: 'Backup manual antes de restaurar 30/11',
    data: {
      customers: [],
      users: [],
      quotes: [],
      tables: []
    }
  };
  
  try {
    // Salvar CustomerProfiles
    const customers = await prisma.customerProfile.findMany();
    backup.data.customers = customers.map((c: any) => ({
      ...c,
      created_at: c.created_at?.toISOString(),
      updated_at: c.updated_at?.toISOString()
    }));
    console.log('✅ CustomerProfiles:', customers.length);
    
    // Salvar Users
    const users = await prisma.user.findMany();
    backup.data.users = users.map((u: any) => ({
      ...u,
      created_at: u.created_at?.toISOString(),
      updated_at: u.updated_at?.toISOString(),
      last_login: u.last_login?.toISOString()
    }));
    console.log('✅ Users:', users.length);
    
    // Salvar Quotes (se existir)
    try {
      const quotes = await prisma.quote.findMany();
      backup.data.quotes = quotes.map((q: any) => ({
        ...q,
        created_at: q.created_at?.toISOString(),
        updated_at: q.updated_at?.toISOString(),
        responded_at: q.responded_at?.toISOString(),
        accepted_at: q.accepted_at?.toISOString(),
        rejected_at: q.rejected_at?.toISOString(),
        budget: q.budget?.toString(),
        total_amount: q.total_amount?.toString()
      }));
      console.log('✅ Quotes:', quotes.length);
    } catch (e) {
      console.log('⚠️  Quotes: tabela não existe ainda');
    }
    
    // Listar tabelas
    const tables: any = await prisma.$queryRaw`SHOW TABLES`;
    backup.data.tables = tables;
    console.log('✅ Tabelas no banco:', tables.length);
    
    // Salvar em arquivo
    const dir = 'backups/manual_01_12_2025';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filename = `${dir}/backup_estado_atual.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    console.log('\n📁 Backup salvo em:', filename);
    console.log('✅ BACKUP CONCLUÍDO!');
    console.log('\n📊 Resumo:');
    console.log(`   - ${backup.data.customers.length} clientes`);
    console.log(`   - ${backup.data.users.length} usuários admin`);
    console.log(`   - ${backup.data.quotes.length} orçamentos`);
    console.log(`   - ${backup.data.tables.length} tabelas`);
    
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupCurrentState();
