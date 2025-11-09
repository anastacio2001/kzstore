import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_urls: string[];
  position: string;
  status: string;
}

interface StorageFile {
  name: string;
  metadata?: { size?: number };
  updated_at: string;
}

export function TestAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    testAds();
  }, []);

  const testAds = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Testando anúncios...');

      // Buscar anúncios
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('position', 'checkout-banner')
        .eq('status', 'active');

      if (adsError) {
        throw adsError;
      }

      console.log('📊 Anúncios encontrados:', adsData?.length || 0);
      setAds(adsData || []);

      // Testar bucket storage
      console.log('\n🗂️ Testando bucket ad-images...');
      const { data: files, error: storageError } = await supabase.storage
        .from('ad-images')
        .list('', { limit: 10 });

      if (storageError) {
        console.error('❌ Erro no bucket:', storageError);
        setError(`Erro no storage: ${storageError.message}`);
      } else {
        console.log('📁 Arquivos no bucket:', files?.length || 0);
        setStorageFiles(files || []);
      }

    } catch (err) {
      console.error('❌ Erro geral:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Anúncios</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Anúncios */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Anúncios do Checkout</h2>
        {ads.length === 0 ? (
          <p className="text-gray-500">Nenhum anúncio ativo encontrado para checkout-banner</p>
        ) : (
          <div className="space-y-4">
            {ads.map((ad, index) => (
              <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium">{ad.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                <p className="text-sm text-gray-500">Status: {ad.status}</p>
                <p className="text-sm text-gray-500">Imagens: {ad.image_urls?.length || 0}</p>

                {ad.image_urls && ad.image_urls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {ad.image_urls.map((url: string, imgIndex: number) => (
                      <div key={imgIndex} className="border border-gray-200 rounded">
                        <img
                          src={url}
                          alt={`Imagem ${imgIndex + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            console.error(`Erro ao carregar imagem ${imgIndex + 1}:`, url);
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Erro+ao+Carregar';
                          }}
                        />
                        <p className="text-xs text-gray-500 p-2 break-all">{url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arquivos no Storage */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Arquivos no Bucket ad-images</h2>
        {storageFiles.length === 0 ? (
          <p className="text-gray-500">Nenhum arquivo encontrado no bucket</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  Tamanho: {file.metadata?.size ? `${(file.metadata.size / 1024).toFixed(1)} KB` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  Modificado: {new Date(file.updated_at).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={testAds}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Recarregar Teste
      </button>
    </div>
  );
}