import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuotes() {
  try {
    const quotes = await prisma.quote.findMany({
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`\n✅ Tabela Quotes existe e está acessível!`);
    console.log(`✅ Total de orçamentos: ${quotes.length}\n`);
    
    if (quotes.length > 0) {
      console.log('Últimos orçamentos:');
      quotes.forEach(q => console.log(`  - ${q.quote_number}: ${q.user_name} (${q.status})`));
    } else {
      console.log('Tabela vazia (esperado após migração).');
    }
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuotes();
