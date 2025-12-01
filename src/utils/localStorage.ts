/**
 * Local Storage Service - Substituição do Supabase Storage
 * Upload de imagens para servidor local
 */

const API_BASE = '/api';

/**
 * Upload de imagem para servidor local
 */
export async function uploadImage(file: File): Promise<string | null> {
  try {
    console.log('[LocalStorage] Uploading image:', file.name);

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    console.log('[LocalStorage] Upload successful:', data.url);
    
    return data.url;
  } catch (error) {
    console.error('[LocalStorage] Upload failed:', error);
    return null;
  }
}

/**
 * Deletar imagem do servidor local
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extrair filename da URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return false;

    const response = await fetch(`${API_BASE}/upload/${filename}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('[LocalStorage] Delete failed:', error);
    return false;
  }
}

/**
 * Verificar se uma URL é local
 */
export function isLocalImage(url: string): boolean {
  return url.includes('/uploads/') || url.startsWith('http://localhost');
}
