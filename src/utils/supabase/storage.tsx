/**
 * Utilitário para Upload de Imagens
 * Agora usa servidor local em vez de Supabase Storage
 */

import { uploadImage as uploadToLocal, deleteImage as deleteFromLocal } from '../localStorage';

/**
 * Upload de imagem - Agora usa servidor local
 */
export async function uploadImage(file: File): Promise<string | null> {
  return uploadToLocal(file);
}

/**
 * Deletar imagem
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  return deleteFromLocal(imageUrl);
}

/**
 * Upload múltiplo de imagens
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    const url = await uploadImage(file);
    if (url) {
      urls.push(url);
    }
  }
  
  return urls;
}

/**
 * List images (mock - retorna array vazio)
 */
export async function listImages(folder: string = 'products'): Promise<string[]> {
  return [];
}

/**
 * Instruções de uso do storage
 */
export function getStorageInstructions(): string {
  return `
🔧 UPLOAD LOCAL DE IMAGENS:

O sistema agora suporta upload de imagens direto para o servidor local!

✅ COMO USAR:
1. Selecione uma imagem no formulário de produtos
2. A imagem será enviada para o servidor
3. URL será gerada automaticamente

💡 ALTERNATIVA: Você também pode usar URLs externas de:
   - imgbb.com (upload gratuito de imagens)
   - unsplash.com (fotos de stock profissionais)
   - URLs diretas de produtos dos fornecedores
  `.trim();
}
