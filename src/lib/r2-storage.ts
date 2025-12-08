import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cliente S3 configurado para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Fazer upload de arquivo para Cloudflare R2
 * @param file - Arquivo a ser enviado
 * @param key - Caminho/nome do arquivo no bucket (ex: "products/123.jpg")
 * @returns URL pública do arquivo
 */
export async function uploadToR2(file: File, key: string): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    }));

    // URL pública do arquivo
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload para R2:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

/**
 * Fazer upload de múltiplos arquivos
 * @param files - Array de arquivos
 * @param prefix - Prefixo para os caminhos (ex: "products/")
 * @returns Array de URLs públicas
 */
export async function uploadMultipleToR2(
  files: File[],
  prefix: string = ''
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now();
    const key = `${prefix}${timestamp}-${index}-${file.name}`;
    return uploadToR2(file, key);
  });

  return Promise.all(uploadPromises);
}

/**
 * Deletar arquivo do R2
 * @param key - Caminho do arquivo no bucket
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
  } catch (error) {
    console.error('Erro ao deletar do R2:', error);
    throw new Error('Falha ao deletar imagem');
  }
}

/**
 * Extrair a key (caminho) de uma URL completa do R2
 * @param url - URL completa (ex: "https://images.kzstore.ao/products/123.jpg")
 * @returns Key do arquivo (ex: "products/123.jpg")
 */
export function extractR2Key(url: string): string {
  const baseUrl = process.env.R2_PUBLIC_URL || '';
  return url.replace(`${baseUrl}/`, '');
}

/**
 * Gerar nome de arquivo único
 * @param originalName - Nome original do arquivo
 * @param prefix - Prefixo opcional (ex: "products/")
 * @returns Nome único com timestamp
 */
export function generateUniqueFileName(
  originalName: string,
  prefix: string = ''
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}-${randomSuffix}.${extension}`;
}
