import { PrismaClient } from '@prisma/client';
import { Storage } from '@google-cloud/storage';
import * as https from 'https';
import * as http from 'http';
import { promises as fs } from 'fs';
import * as path from 'path';
import { URL } from 'url';

// Conectar diretamente ao Cloud SQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://kzstore_app:Kzstore2024!@34.175.172.211:3306/kzstore_prod"
    }
  }
});
const storage = new Storage();

const BUCKET_NAME = 'kzstore-images';
const TEMP_DIR = './temp-images';

interface ImageDownload {
  productId: number;
  originalUrl: string;
  filename: string;
  newUrl?: string;
}

async function createBucket() {
  try {
    const [buckets] = await storage.getBuckets();
    const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`✅ Bucket ${BUCKET_NAME} já existe`);
      return storage.bucket(BUCKET_NAME);
    }

    console.log(`📦 Criando bucket ${BUCKET_NAME}...`);
    const [bucket] = await storage.createBucket(BUCKET_NAME, {
      location: 'EUROPE-SOUTHWEST1',
      storageClass: 'STANDARD',
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
        publicAccessPrevention: 'inherited',
      },
    });

    // Adicionar permissão de leitura pública via IAM (não ACL)
    await bucket.iam.setPolicy({
      bindings: [
        {
          role: 'roles/storage.objectViewer',
          members: ['allUsers'],
        },
      ],
    });
    console.log(`✅ Bucket ${BUCKET_NAME} criado e configurado como público`);
    
    return bucket;
  } catch (error: any) {
    console.error('❌ Erro ao criar bucket:', error.message);
    throw error;
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          downloadImage(response.headers.location, filepath).then(resolve);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        console.log(`⚠️  Status ${response.statusCode} para ${url}`);
        resolve(false);
        return;
      }

      const file = require('fs').createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
      
      file.on('error', (err: any) => {
        require('fs').unlink(filepath, () => {});
        console.log(`⚠️  Erro ao salvar ${url}:`, err.message);
        resolve(false);
      });
    });

    request.on('error', (err: any) => {
      console.log(`⚠️  Erro ao baixar ${url}:`, err.message);
      resolve(false);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      console.log(`⚠️  Timeout ao baixar ${url}`);
      resolve(false);
    });
  });
}

async function uploadToBucket(bucket: any, localPath: string, destination: string): Promise<string> {
  await bucket.upload(localPath, {
    destination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;
}

function sanitizeFilename(url: string, productId: number): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = path.basename(pathname);
    const ext = path.extname(filename) || '.jpg';
    const nameWithoutExt = path.basename(filename, ext);
    
    // Remover caracteres especiais e manter apenas alfanuméricos
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50);
    return `product-${productId}-${safeName}${ext}`;
  } catch {
    return `product-${productId}-image-${Date.now()}.jpg`;
  }
}

async function migrateImages() {
  console.log('🚀 Iniciando migração de imagens...\n');

  try {
    // 1. Criar bucket
    const bucket = await createBucket();

    // 2. Criar diretório temporário
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log(`📁 Diretório temporário criado: ${TEMP_DIR}\n`);

    // 3. Buscar produtos com imagens
    console.log('🔍 Buscando produtos com imagens...');
    const products = await prisma.product.findMany({
      where: {
        imagem_url: {
          not: null,
        },
      },
      select: {
        id: true,
        nome: true,
        imagem_url: true,
      },
    });

    console.log(`📊 Encontrados ${products.length} produtos com imagens\n`);

    const downloads: ImageDownload[] = [];
    const externalUrls = products.filter(p => {
      const url = p.imagem_url || '';
      return url.includes('loja.sistec.co.ao') || 
             url.includes('http://') || 
             (url.includes('https://') && !url.includes('storage.googleapis.com'));
    });

    console.log(`🌐 ${externalUrls.length} produtos com imagens externas precisam migração\n`);

    // 4. Download das imagens
    let downloaded = 0;
    let failed = 0;

    for (const product of externalUrls) {
      const filename = sanitizeFilename(product.imagem_url!, product.id);
      const localPath = path.join(TEMP_DIR, filename);

      console.log(`⬇️  [${downloaded + failed + 1}/${externalUrls.length}] ${product.nome}`);
      console.log(`   URL: ${product.imagem_url}`);

      const success = await downloadImage(product.imagem_url!, localPath);
      
      if (success) {
        downloads.push({
          productId: product.id,
          originalUrl: product.imagem_url!,
          filename,
        });
        downloaded++;
        console.log(`   ✅ Download concluído\n`);
      } else {
        failed++;
        console.log(`   ❌ Falhou\n`);
      }
    }

    console.log(`\n📊 Downloads: ${downloaded} sucesso, ${failed} falhas\n`);

    // 5. Upload para Cloud Storage
    console.log('☁️  Fazendo upload para Cloud Storage...\n');
    let uploaded = 0;

    for (const download of downloads) {
      const localPath = path.join(TEMP_DIR, download.filename);
      
      try {
        const publicUrl = await uploadToBucket(bucket, localPath, download.filename);
        download.newUrl = publicUrl;
        uploaded++;
        console.log(`✅ [${uploaded}/${downloads.length}] ${download.filename}`);
      } catch (error: any) {
        console.log(`❌ Erro no upload de ${download.filename}:`, error.message);
      }
    }

    console.log(`\n📊 Uploads: ${uploaded}/${downloads.length}\n`);

    // 6. Atualizar base de dados
    console.log('💾 Atualizando base de dados...\n');
    let updated = 0;

    for (const download of downloads) {
      if (download.newUrl) {
        try {
          await prisma.product.update({
            where: { id: download.productId },
            data: { imagem_url: download.newUrl },
          });
          updated++;
          console.log(`✅ [${updated}/${uploaded}] Produto #${download.productId} atualizado`);
        } catch (error: any) {
          console.log(`❌ Erro ao atualizar produto #${download.productId}:`, error.message);
        }
      }
    }

    // 7. Limpar diretório temporário
    console.log('\n🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });

    console.log('\n✨ MIGRAÇÃO CONCLUÍDA! ✨');
    console.log(`
📊 Resumo:
   - Produtos analisados: ${products.length}
   - Precisavam migração: ${externalUrls.length}
   - Downloads com sucesso: ${downloaded}
   - Uploads com sucesso: ${uploaded}
   - Base de dados atualizada: ${updated} produtos
   - Taxa de sucesso: ${((updated / externalUrls.length) * 100).toFixed(1)}%
`);

  } catch (error: any) {
    console.error('\n❌ ERRO NA MIGRAÇÃO:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
