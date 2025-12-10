import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuração do R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '2764525461cdfe63446ef25726431505';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'ee20e13a7711c87dd705eac5bd48fbca';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '4c783363c33317fe65e0ad212cdf8dcbea0e2eee6a80dd23a81400a7cf84b65b';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kzstore-images';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-2764525461cdfe63446ef25726431505.r2.dev';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listR2Images(): Promise<string[]> {
  console.log('📦 Listando imagens no Cloudflare R2...\n');
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    const files = response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
    
    console.log(`✅ Encontradas ${files.length} imagens no R2\n`);
    
    // Mostrar exemplos
    console.log('📋 Exemplos de imagens no R2:');
    files.slice(0, 5).forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('');
    
    return files;
  } catch (error) {
    console.error('❌ Erro ao listar imagens do R2:', error);
    throw error;
  }
}

async function matchAndUpdateProducts(r2Files: string[]) {
  console.log('🔍 Buscando produtos com URLs quebradas...\n');

  try {
    // Buscar produtos com URLs do Google Storage ou placeholder
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { imagem_url: { contains: 'storage.googleapis.com' } },
          { imagem_url: { contains: 'placeholder.com' } },
        ]
      },
      select: {
        id: true,
        nome: true,
        imagem_url: true,
      }
    });

    console.log(`📦 Produtos a corrigir: ${products.length}\n`);

    if (products.length === 0) {
      console.log('✅ Nenhum produto precisa de correção!');
      return;
    }

    let updated = 0;
    let notFound = 0;

    console.log('🔧 Tentando fazer match automático...\n');

    for (const product of products) {
      const oldUrl = product.imagem_url || '';
      
      // Extrair o nome do arquivo da URL antiga
      let filename = '';
      
      if (oldUrl.includes('storage.googleapis.com')) {
        // URL: https://storage.googleapis.com/kzstore-images/product-xxx-yyy.jpg
        const parts = oldUrl.split('/');
        filename = parts[parts.length - 1];
      } else if (oldUrl.includes('placeholder.com')) {
        // Produto com placeholder - tentar encontrar por similaridade de nome
        const sanitizedName = product.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50);
        
        // Procurar arquivo que contenha parte do nome
        const match = r2Files.find(file => 
          file.toLowerCase().includes(sanitizedName) ||
          sanitizedName.split('-').some(part => part.length > 3 && file.toLowerCase().includes(part))
        );
        
        if (match) {
          filename = match;
        }
      }

      if (!filename) {
        notFound++;
        console.log(`⚠️  Não encontrado: ${product.nome}`);
        continue;
      }

      // Verificar se o arquivo existe no R2
      const fileExists = r2Files.includes(filename);

      if (fileExists) {
        const newUrl = `${R2_PUBLIC_URL}/${filename}`;
        
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { imagem_url: newUrl }
          });
          
          updated++;
          console.log(`✅ [${updated}] ${product.nome}`);
          console.log(`   Antes: ${oldUrl.substring(0, 60)}...`);
          console.log(`   Depois: ${newUrl}\n`);
          
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${product.nome}:`, error);
        }
      } else {
        notFound++;
        console.log(`⚠️  Arquivo não existe no R2: ${filename} (${product.nome})`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTADO DA MIGRAÇÃO AUTOMÁTICA');
    console.log('='.repeat(70));
    console.log(`✅ Produtos atualizados: ${updated}`);
    console.log(`⚠️  Produtos não encontrados: ${notFound}`);
    console.log(`📦 Total processado: ${products.length}`);
    console.log('='.repeat(70));

    if (notFound > 0) {
      console.log('\n📝 Produtos não encontrados precisam de re-upload manual');
      console.log('   Acesse: https://kzstore.ao/admin');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 MIGRAÇÃO AUTOMÁTICA DE IMAGENS - GOOGLE STORAGE → CLOUDFLARE R2\n');
  console.log('='.repeat(70));
  console.log('');

  try {
    // 1. Listar imagens no R2
    const r2Files = await listR2Images();

    if (r2Files.length === 0) {
      console.log('❌ Nenhuma imagem encontrada no R2. Verifique as credenciais.');
      return;
    }

    // 2. Fazer match e atualizar produtos
    await matchAndUpdateProducts(r2Files);

    console.log('\n✅ Migração automática concluída!\n');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
