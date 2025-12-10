import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = '2764525461cdfe63446ef25726431505';
const R2_ACCESS_KEY_ID = 'ee20e13a7711c87dd705eac5bd48fbca';
const R2_SECRET_ACCESS_KEY = '4c783363c33317fe65e0ad212cdf8dcbea0e2eee6a80dd23a81400a7cf84b65b';
const R2_BUCKET_NAME = 'kzstore-images';
const R2_PUBLIC_URL = 'https://pub-8de55063e1d94b86ad80544850260539.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listAllR2Files(): Promise<string[]> {
  const command = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, MaxKeys: 1000 });
  const response = await s3Client.send(command);
  return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
}

async function autoMatchBySKU() {
  console.log('🎯 MATCHING AUTOMÁTICO POR SKU/ID\n');
  console.log('='.repeat(70));

  const r2Files = await listAllR2Files();
  const productsWithPlaceholder = await prisma.product.findMany({
    where: { imagem_url: { contains: 'placeholder' } },
    select: { id: true, nome: true, sku: true }
  });

  console.log(`\n📦 Arquivos no R2: ${r2Files.length}`);
  console.log(`🔍 Produtos sem imagem: ${productsWithPlaceholder.length}\n`);

  let matched = 0;
  let notMatched = 0;

  for (const product of productsWithPlaceholder) {
    // Extrair ID do SKU (últimos 6 caracteres)
    const skuId = product.sku?.split('-').pop()?.toLowerCase() || '';
    
    // Procurar arquivo que contenha esse ID
    const matchedFile = r2Files.find(file => file.toLowerCase().includes(skuId));

    if (matchedFile) {
      const newUrl = `${R2_PUBLIC_URL}/${matchedFile}`;
      
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: { imagem_url: newUrl }
        });
        
        matched++;
        console.log(`✅ [${matched}] ${product.nome}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Arquivo: ${matchedFile}`);
        console.log(`   URL: ${newUrl}\n`);
        
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${product.nome}:`, error);
      }
    } else {
      notMatched++;
      console.log(`⚠️  [${notMatched}] NÃO ENCONTRADO: ${product.nome}`);
      console.log(`   SKU: ${product.sku} (ID: ${skuId})\n`);
    }
  }

  console.log('='.repeat(70));
  console.log('📊 RESULTADO:');
  console.log(`   ✅ Matched: ${matched}`);
  console.log(`   ⚠️  Não encontrados: ${notMatched}`);
  console.log('='.repeat(70));

  await prisma.$disconnect();
}

autoMatchBySKU();
