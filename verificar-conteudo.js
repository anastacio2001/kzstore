const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { id: 'd248d124-df24-4a1a-9264-69716db94a7a' },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      status: true,
      updated_at: true
    }
  });

  console.log('\n📄 POST COMPLETO:');
  console.log('==================\n');
  console.log('Título:', post.title);
  console.log('Status:', post.status);
  console.log('Última atualização:', post.updated_at);
  console.log('\nExcerpt:', post.excerpt?.substring(0, 100) + '...');
  console.log('\nContent length:', post.content?.length || 0);
  console.log('Content preview:', post.content?.substring(0, 200) + '...\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
