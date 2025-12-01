import { useState, useEffect } from 'react';
import { Save, ArrowLeft, Upload, X, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BlogPost } from '../../types';
import { createBlogPost, updateBlogPost, uploadBlogImage } from '../../services/blogService';
import { toast } from 'sonner';

interface BlogPostFormProps {
  post?: BlogPost;
  onBack: () => void;
  onSave: () => void;
}

export function BlogPostForm({ post, onBack, onSave }: BlogPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    category: '',
    tags: [],
    status: 'draft',
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    ...post,
  });
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange('tags', formData.tags?.filter(t => t !== tag) || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploading(true);
      const { url } = await uploadBlogImage(file);
      handleChange('cover_image', url);
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrl = () => {
    if (!imageUrlInput.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    // Validação básica de URL
    try {
      new URL(imageUrlInput);
      handleChange('cover_image', imageUrlInput.trim());
      setImageUrlInput('');
      setShowUrlInput(false);
      toast.success('URL da imagem adicionada!');
    } catch {
      toast.error('URL inválida. Use um formato como: https://exemplo.com/imagem.jpg');
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    // Validações
    if (!formData.title?.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (!formData.content?.trim()) {
      toast.error('O conteúdo é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        status,
        // Gerar excerpt automático se não fornecido
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
      };

      if (post?.id) {
        // Updating blog post
        await updateBlogPost(post.id, dataToSave);
        toast.success('Post atualizado com sucesso!');
      } else {
        await createBlogPost(dataToSave);
        toast.success('Post criado com sucesso!');
      }
      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      toast.error(error.message || 'Erro ao salvar post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {post ? 'Editar Post' : 'Novo Post'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Editar' : 'Visualizar'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            Salvar Rascunho
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      {showPreview ? (
        /* Preview */
        <Card>
          <CardContent className="p-8">
            {formData.cover_image && (
              <img
                src={formData.cover_image}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{formData.title || 'Título do Post'}</h1>
            {formData.category && (
              <p className="text-blue-600 mb-4">📁 {formData.category}</p>
            )}
            {formData.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{formData.excerpt}</p>
            )}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content || 'Conteúdo do post...' }}
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex gap-2 mt-6">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Formulário */
        <div className="grid gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o título do post..."
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resumo
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve resumo do post..."
                />
              </div>

              {/* Categoria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Tecnologia, Dicas, Tutoriais"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Destaque
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Marcar como destaque</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagem de Capa */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Capa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.cover_image ? (
                  <div className="relative">
                    <img
                      src={formData.cover_image}
                      alt="Capa"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Imagem+Indisponível';
                        toast.error('Erro ao carregar imagem');
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('cover_image', '')}
                      className="absolute top-2 right-2 bg-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Upload de arquivo */}
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-600">
                        {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG até 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>

                    {/* Separador */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>

                    {/* Input de URL */}
                    {showUrlInput ? (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleImageUrl()}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button onClick={handleImageUrl} size="sm">
                          Adicionar
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowUrlInput(false);
                            setImageUrlInput('');
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowUrlInput(true)}
                        className="w-full"
                      >
                        Usar URL da Imagem
                      </Button>
                    )}
                  </div>
                )}
                {uploading && (
                  <p className="text-sm text-blue-600 text-center">
                    Fazendo upload...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Atalhos para inserir mídia */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Cole a URL da imagem:');
                      if (url) {
                        const imgTag = `<img src="${url}" alt="Imagem" class="w-full rounded-lg my-4" />`;
                        handleChange('content', formData.content + '\n' + imgTag);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >
                    📷 Inserir Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Cole a URL do YouTube (ex: https://www.youtube.com/watch?v=ID):');
                      if (url) {
                        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                        if (videoId) {
                          const embedTag = `<div class="aspect-video my-4"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
                          handleChange('content', formData.content + '\n' + embedTag);
                        } else {
                          alert('URL do YouTube inválida');
                        }
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >
                    🎥 YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Cole a URL do Vimeo (ex: https://vimeo.com/ID):');
                      if (url) {
                        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                        if (videoId) {
                          const embedTag = `<div class="aspect-video my-4"><iframe width="100%" height="100%" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
                          handleChange('content', formData.content + '\n' + embedTag);
                        } else {
                          alert('URL do Vimeo inválida');
                        }
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >
                    🎬 Vimeo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Cole o link:');
                      const text = prompt('Texto do link:');
                      if (url && text) {
                        const linkTag = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">${text}</a>`;
                        handleChange('content', formData.content + linkTag);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50"
                  >
                    🔗 Inserir Link
                  </button>
                </div>
                
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={15}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Digite o conteúdo do post... (HTML aceito)"
                />
                <p className="text-xs text-gray-500">
                  Dica: Use os botões acima para inserir mídia ou escreva HTML diretamente
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite uma tag e pressione Enter"
                  />
                  <Button onClick={handleAddTag} type="button">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>Otimização SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Título
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  maxLength={60}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título para SEO (max 60 caracteres)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_title?.length || 0}/60 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Descrição
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição para SEO (max 160 caracteres)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_description?.length || 0}/160 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Palavras-chave
                </label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="palavra1, palavra2, palavra3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
