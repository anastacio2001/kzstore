import React, { useState } from 'react';
import { Upload, X, File, Image as ImageIcon, Paperclip } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function FileUpload({ onFilesUploaded, maxFiles = 5, acceptedTypes = 'image/*,.pdf,.doc,.docx' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Validar tamanho (máx 5MB por arquivo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = selectedFiles.filter(f => f.size > maxSize);
    
    if (invalidFiles.length > 0) {
      alert(`Alguns arquivos excedem 5MB: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const urls: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      for (const file of files) {
        // Nome único: timestamp-filename (sem pasta de usuário para evitar RLS)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName; // Upload direto na raiz do bucket

        console.log('📤 Uploading file:', filePath);

        // Upload para Supabase Storage com upsert
        const { data, error } = await supabase.storage
          .from('ticket-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Permite sobrescrever se necessário
            contentType: file.type
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        // Gerar URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(filePath);

        console.log('✅ File uploaded:', publicUrl);
        urls.push(publicUrl);
      }

      setUploadedUrls(urls);
      onFilesUploaded(urls);
      setFiles([]); // Limpar lista
      
      alert('Arquivos enviados com sucesso!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Erro ao enviar arquivos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
          <Paperclip className="w-4 h-4" />
          Anexar Arquivo
          <input
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || files.length >= maxFiles}
          />
        </label>
        
        <span className="text-xs text-gray-500">
          Máx {maxFiles} arquivos • 5MB cada
        </span>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded"
                disabled={uploading}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar {files.length} arquivo(s)
              </>
            )}
          </button>
        </div>
      )}

      {/* Uploaded Files (Read-only) */}
      {uploadedUrls.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-green-600 font-medium mb-2">
            ✓ {uploadedUrls.length} arquivo(s) anexado(s)
          </p>
        </div>
      )}
    </div>
  );
}
