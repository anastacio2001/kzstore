/**
 * Script para criar posts de blog de exemplo
 * 
 * USO: node criar-blog-posts.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const posts = [
  {
    title: 'Como Escolher a Memória RAM Ideal para seu Servidor',
    slug: 'como-escolher-memoria-ram-servidor',
    excerpt: 'Entenda as diferenças entre DDR3, DDR4 e DDR5, e escolha a memória RAM perfeita para suas necessidades empresariais.',
    content: `
# Como Escolher a Memória RAM Ideal para seu Servidor

Escolher a memória RAM correta para o seu servidor é crucial para garantir performance e confiabilidade. Neste guia, vamos explicar tudo que você precisa saber.

## Diferenças entre DDR3, DDR4 e DDR5

### DDR3
- Velocidade: até 2133MHz
- Consumo: mais alto
- Ideal para: servidores legados

### DDR4
- Velocidade: 2133MHz - 3200MHz
- Consumo: 20% menor que DDR3
- Ideal para: maioria dos servidores atuais

### DDR5
- Velocidade: 4800MHz+
- Consumo: eficiência energética superior
- Ideal para: aplicações de alta performance

## ECC: O que é e por que é importante?

ECC (Error-Correcting Code) detecta e corrige erros automaticamente, essencial para ambientes corporativos que exigem alta confiabilidade.

## Conclusão

Invista em memória RAM de qualidade e compatível com seu hardware para maximizar a performance do seu servidor.
    `,
    cover_image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
    category: 'Hardware',
    tags: ['RAM', 'Servidores', 'Hardware'],
    meta_keywords: ['memória RAM', 'DDR4', 'DDR5', 'servidor', 'ECC'],
    status: 'published',
    is_featured: true,
    published_at: new Date()
  },
  {
    title: 'SSD vs HDD: Qual Escolher para seu Data Center?',
    slug: 'ssd-vs-hdd-datacenter',
    excerpt: 'Conheça as vantagens e desvantagens de SSDs e HDDs e tome a melhor decisão para seu armazenamento empresarial.',
    content: `
# SSD vs HDD: Qual Escolher para seu Data Center?

A escolha entre SSD e HDD é uma das decisões mais importantes ao montar ou expandir seu data center.

## Vantagens do SSD

- **Velocidade**: até 100x mais rápido que HDD
- **Durabilidade**: sem partes móveis
- **Consumo**: menor consumo energético
- **Ruído**: operação silenciosa

## Quando usar HDD?

- **Armazenamento em massa**: dados de arquivo
- **Custo-benefício**: maior capacidade por preço
- **Dados frios**: informações acessadas raramente

## Nossa Recomendação

Use SSDs para bancos de dados e aplicações críticas, e HDDs para backup e arquivo de longo prazo.
    `,
    cover_image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800',
    category: 'Armazenamento',
    tags: ['SSD', 'HDD', 'Storage', 'Data Center'],
    meta_keywords: ['SSD', 'HDD', 'armazenamento', 'data center'],
    status: 'published',
    is_featured: true,
    published_at: new Date()
  },
  {
    title: 'Segurança Residencial: Guia de Câmeras Wi-Fi',
    slug: 'seguranca-residencial-cameras-wifi',
    excerpt: 'Tudo que você precisa saber para escolher e instalar câmeras de segurança Wi-Fi em sua casa.',
    content: `
# Segurança Residencial: Guia de Câmeras Wi-Fi

A segurança da sua casa é prioridade. Veja como escolher as melhores câmeras Wi-Fi.

## Características Importantes

1. **Resolução**: mínimo Full HD (1080p)
2. **Visão Noturna**: essencial para monitoramento 24/7
3. **Detecção de Movimento**: alertas inteligentes
4. **Armazenamento**: nuvem ou local

## Dicas de Instalação

- Posicione em pontos estratégicos
- Garanta boa cobertura Wi-Fi
- Configure alertas no smartphone

## Conclusão

Invista em câmeras de qualidade para proteger o que é mais importante: sua família.
    `,
    cover_image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800',
    category: 'Segurança',
    tags: ['Câmeras', 'Wi-Fi', 'Segurança', 'Smart Home'],
    meta_keywords: ['câmera wifi', 'segurança', 'vigilância'],
    status: 'published',
    is_featured: false,
    published_at: new Date()
  }
];

async function criarPosts() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║      CRIAR POSTS DE BLOG - KZSTORE                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Buscar um admin para ser o autor
    const admin = await prisma.customerProfile.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('❌ Nenhum admin encontrado! Crie um admin primeiro.\n');
      process.exit(1);
    }

    console.log(`✅ Autor: ${admin.nome} (${admin.email})\n`);
    console.log('📝 Criando posts...\n');

    let criados = 0;
    let erros = 0;

    for (const post of posts) {
      try {
        // Verificar se já existe
        const existing = await prisma.blogPost.findUnique({
          where: { slug: post.slug }
        });

        if (existing) {
          console.log(`⚠️  "${post.title}" já existe`);
          continue;
        }

        await prisma.blogPost.create({
          data: {
            ...post,
            author_id: admin.id,
            author_name: admin.nome,
            author_email: admin.email,
            meta_title: post.title,
            meta_description: post.excerpt
          }
        });

        criados++;
        console.log(`✅ ${post.title}`);
      } catch (error) {
        erros++;
        console.log(`❌ Erro ao criar "${post.title}":`, error.message);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              RESUMO                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   ✅ Posts criados: ${criados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📊 Total no blog: ${await prisma.blogPost.count()}\n`);

    if (criados > 0) {
      console.log('🎉 Blog populado com sucesso!\n');
      console.log('Acesse:');
      console.log('- Blog público: http://localhost:3000/blog');
      console.log('- Admin blog: http://localhost:3000/admin/blog\n');
    }

  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

criarPosts();
