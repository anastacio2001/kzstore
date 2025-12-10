import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '2764525461cdfe63446ef25726431505';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'ee20e13a7711c87dd705eac5bd48fbca';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '4c783363c33317fe65e0ad212cdf8dcbea0e2eee6a80dd23a81400a7cf84b65b';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kzstore-images';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8de55063e1d94b86ad80544850260539.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listAllR2Files(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    MaxKeys: 1000,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
}

async function smartMatch() {
  console.log('🔍 MATCHING INTELIGENTE DE IMAGENS\n');
  console.log('='.repeat(70));

  // 1. Listar arquivos do R2
  console.log('\n📦 Listando arquivos no R2...');
  const r2Files = await listAllR2Files();
  console.log(`✅ Encontrados ${r2Files.length} arquivos\n`);

  // 2. Buscar produtos com placeholder
  const productsWithPlaceholder = await prisma.product.findMany({
    where: {
      imagem_url: { contains: 'placeholder' }
    },
    select: {
      id: true,
      nome: true,
      imagem_url: true,
      marca: true,
      modelo: true,
      sku: true,
    }
  });

  console.log(`🔍 Produtos com placeholder: ${productsWithPlaceholder.length}\n`);

  // 3. Listar arquivos não usados
  const productsWithR2 = await prisma.product.findMany({
    where: {
      imagem_url: { contains: R2_PUBLIC_URL }
    },
    select: { imagem_url: true }
  });

  const usedFiles = productsWithR2.map(p => {
    const url = p.imagem_url || '';
    return url.replace(`${R2_PUBLIC_URL}/`, '');
  });

  const unusedFiles = r2Files.filter(file => !usedFiles.includes(file));

  console.log('📋 ARQUIVOS NÃO UTILIZADOS NO R2:\n');
  console.log(`Total: ${unusedFiles.length} arquivos\n`);
  
  unusedFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 PRODUTOS SEM IMAGEM:\n');
  
  productsWithPlaceholder.forEach((product, i) => {
    console.log(`${i + 1}. ${product.nome}`);
    if (product.marca) console.log(`   Marca: ${product.marca}`);
    if (product.modelo) console.log(`   Modelo: ${product.modelo}`);
    if (product.sku) console.log(`   SKU: ${product.sku}`);
    console.log('');
  });

  console.log('='.repeat(70));
  console.log('\n💡 ANÁLISE:');
  console.log(`   Arquivos no R2: ${r2Files.length}`);
  console.log(`   Arquivos usados: ${usedFiles.length}`);
  console.log(`   Arquivos não usados: ${unusedFiles.length}`);
  console.log(`   Produtos sem imagem: ${productsWithPlaceholder.length}`);
  console.log('\n❓ Diferença: ${unusedFiles.length} arquivos disponíveis vs ${productsWithPlaceholder.length} produtos sem imagem');

  await prisma.$disconnect();
}

smartMatch();
