const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      published_at: true,
      created_at: true
    },
    orderBy: { created_at: 'desc' }
  });

  console.log('\n📝 POSTS DO BLOG:');
  console.log('==================\n');
  
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Published: ${post.published_at || 'N/A'}`);
    console.log(`   ID: ${post.id.substring(0, 8)}...`);
    console.log('');
  });
  
  console.log(`\n✅ Total: ${posts.length} posts\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
