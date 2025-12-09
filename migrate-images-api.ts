import { Storage } from '@google-cloud/storage';
import * as https from 'https';
import * as http from 'http';
import { promises as fs } from 'fs';
import * as path from 'path';
import { URL } from 'url';

const storage = new Storage();
const BUCKET_NAME = 'kzstore-images';
const TEMP_DIR = './temp-images';
const API_BASE = 'https://kzstore-341392738431.europe-southwest1.run.app';

interface Product {
  id: number;
  nome: string;
  imagem_url?: string | null;
}

interface ImageDownload {
  productId: number;
  originalUrl: string;
  filename: string;
  newUrl?: string;
}

async function fetchProducts(): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    https.get(`${API_BASE}/api/products?limit=1000`, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const products = json.data || json.products || [];
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function updateProductImage(productId: string, newUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({ imagem_url: newUrl });
    
    const options = {
      hostname: 'kzstore-341392738431.europe-southwest1.run.app',
      port: 443,
      path: `/api/products/${productId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200 || res.statusCode === 204;
        if (!success) {
          console.log(`   Resposta: ${res.statusCode} - ${responseData.substring(0, 100)}`);
        }
        resolve(success);
      });
    });

    req.on('error', (err) => {
      console.log(`   Erro HTTP: ${err.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
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

    // 3. Buscar produtos via API
    console.log('🔍 Buscando produtos via API...');
    const products = await fetchProducts();
    console.log(`📊 Encontrados ${products.length} produtos\n`);

    const externalUrls = products.filter(p => {
      const url = p.imagem_url || '';
      return url.includes('loja.sistec.co.ao') || 
             url.includes('http://') || 
             (url.includes('https://') && !url.includes('storage.googleapis.com'));
    });

    console.log(`🌐 ${externalUrls.length} produtos com imagens externas precisam migração\n`);

    // 4. Download das imagens
    const downloads: ImageDownload[] = [];
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

    // 6. Atualizar base de dados via API
    console.log('💾 Atualizando base de dados via API...\n');
    let updated = 0;

    for (const download of downloads) {
      if (download.newUrl) {
        try {
          const success = await updateProductImage(download.productId, download.newUrl);
          if (success) {
            updated++;
            console.log(`✅ [${updated}/${uploaded}] Produto #${download.productId} atualizado`);
          } else {
            console.log(`⚠️  Produto #${download.productId} - falha na atualização`);
          }
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
  }
}

migrateImages();
