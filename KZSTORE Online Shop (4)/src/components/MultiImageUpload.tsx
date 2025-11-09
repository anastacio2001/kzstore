import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  bucket?: string;
  folder?: string;
}

export function MultiImageUpload({
  onImagesUploaded,
  initialImages = [],
  maxImages = 5,
  bucket = 'ad-images',
  folder = 'ads'
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Verificar limite
    if (images.length + files.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    // Validar arquivos
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      
      if (!isImage) {
        setError(`${file.name} não é uma imagem`);
        return false;
      }
      if (!isUnder5MB) {
        setError(`${file.name} é muito grande (máx 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload para Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      
      setImages(newImages);
      onImagesUploaded(newImages);
      
      console.log('✅ Images uploaded:', uploadedUrls);
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const handleAddUrl = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        setError(`Máximo de ${maxImages} imagens permitidas`);
        return;
      }
      const newImages = [...images, url.trim()];
      setImages(newImages);
      onImagesUploaded(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-red-500 transition-colors bg-gray-50 hover:bg-red-50">
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader className="size-8 text-red-600 animate-spin" />
                  <p className="text-sm text-gray-600">Enviando imagens...</p>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Clique para selecionar imagens
                  </p>
                  <p className="text-xs text-gray-500">
                    ou arraste e solte aqui
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG até 5MB ({images.length}/{maxImages})
                  </p>
                </>
              )}
            </div>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={handleAddUrl}
          disabled={images.length >= maxImages}
          className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adicionar URL"
        >
          <ImageIcon className="size-6 text-gray-600" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-500 transition-all"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Erro+ao+Carregar';
                }}
              />
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 size-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 flex items-center justify-center shadow-lg"
                title="Remover imagem"
              >
                <X className="size-5" />
              </button>

              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
          <p>Adicione até {maxImages} imagens para o anúncio</p>
          <p className="text-xs mt-1">
            Você pode fazer upload de arquivos ou adicionar URLs de imagens
          </p>
        </div>
      )}
    </div>
  );
}
