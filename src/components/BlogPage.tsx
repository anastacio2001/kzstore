import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Tag, Clock, ArrowLeft, Zap, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { getBlogPosts, BlogPost } from '../services/blogService';
import { AdBanner } from './AdBanner';

type FlashSale = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  stock_limit: number;
  stock_sold: number;
  start_date: string;
  end_date: string;
  title: string;
  description: string;
  is_active: boolean;
};

type BlogPageProps = {
  onBack?: () => void;
  onViewProduct?: (productId: string) => void;
};

export function BlogPage({ onBack, onViewProduct }: BlogPageProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);

  useEffect(() => {
    loadBlogPosts();
    loadFlashSales();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await getBlogPosts({ status: 'published' });
      const posts = response.posts || [];
      
      console.log('🔍 [BlogPage] Posts recebidos:', posts.length);
      console.log('🔍 [BlogPage] Primeiro post content length:', posts[0]?.content?.length || 0);
      
      setBlogPosts(posts);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
      setCategories(['all', ...uniqueCategories]);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Componente para renderizar YouTube embed
  const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
    <div className="relative w-full overflow-hidden rounded-lg my-8 bg-black" style={{ paddingBottom: '56.25%' }}>
      <iframe 
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
        className="absolute top-0 left-0 w-full h-full"
        style={{ border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title={`YouTube video ${videoId}`}
      />
    </div>
  );

  // Process content to render YouTube videos and text separately
  const renderContent = (content: string) => {
    if (!content) return null;
    
    // Decodificar HTML entities primeiro
    const textarea = document.createElement('textarea');
    textarea.innerHTML = content;
    const decodedContent = textarea.value;
    
    // Regex mais abrangente para detectar URLs do YouTube em vários formatos
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&][^\s<]*)?/gi;
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    
    // Find all YouTube URLs
    while ((match = youtubeRegex.exec(decodedContent)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        const textBefore = decodedContent.substring(lastIndex, match.index).trim();
        if (textBefore) {
          parts.push(
            <div 
              key={`text-${key++}`}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBefore }}
            />
          );
        }
      }
      
      // Add YouTube embed
      const videoId = match[1];
      parts.push(<YouTubeEmbed key={`video-${key++}`} videoId={videoId} />);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last URL
    if (lastIndex < decodedContent.length) {
      const textAfter = decodedContent.substring(lastIndex).trim();
      if (textAfter) {
        parts.push(
          <div 
            key={`text-${key++}`}
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: textAfter }}
          />
        );
      }
    }
    
    // If no YouTube links found, render as normal HTML
    if (parts.length === 0) {
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: decodedContent }}
        />
      );
    }
    
    return <>{parts}</>;
  };

  const loadFlashSales = async () => {
    try {
      const response = await fetch('/api/flash-sales');
      if (response.ok) {
        const data = await response.json();
        setFlashSales(data.flashSales || []);
      }
    } catch (error) {
      console.error('Error loading flash sales:', error);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // View Single Post
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Voltar aos artigos
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article Content */}
            <article className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              {selectedPost.cover_image && (
                <div className="relative h-96 w-full">
                  <img
                    src={selectedPost.cover_image}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {selectedPost.category}
                  </span>
                  {selectedPost.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{selectedPost.reading_time} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    <span>{formatDate(selectedPost.published_at || selectedPost.created_at)}</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">
                  {selectedPost.title}
                </h1>

                <div className="flex items-center gap-3 text-gray-600 mb-8 pb-8 border-b">
                  <User className="size-5" />
                  <span className="font-medium">{selectedPost.author_name || 'Equipe KZSTORE'}</span>
                </div>

                {renderContent(selectedPost.content)}

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="size-4 text-gray-500" />
                      {selectedPost.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Sidebar for Single Post */}
            <div className="space-y-6">
              {/* Ads */}
              <AdBanner position="blog-sidebar" />

              {/* Flash Sales Widget */}
              {flashSales.length > 0 && (
                <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="size-5 fill-white" />
                    <h3 className="text-lg font-bold">⚡ Promoções Relâmpago</h3>
                  </div>
                  <div className="space-y-4">
                    {flashSales.slice(0, 3).map((sale) => {
                      const stockRemaining = sale.stock_limit - sale.stock_sold;
                      return (
                        <div key={sale.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all">
                          {sale.product_image && (
                            <img
                              src={sale.product_image}
                              alt={sale.product_name}
                              className="w-full h-32 object-cover rounded-lg mb-3 bg-white"
                            />
                          )}
                          <h4 className="font-bold text-sm mb-2 line-clamp-2">
                            {sale.product_name}
                          </h4>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-xs line-through opacity-75">
                              {sale.original_price.toLocaleString()} Kz
                            </span>
                            <span className="text-xl font-bold">
                              {sale.sale_price.toLocaleString()} Kz
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-white text-red-600 text-xs px-2 py-1 rounded-full font-bold">
                              -{sale.discount_percentage}%
                            </span>
                            <span className="text-xs opacity-90">
                              Restam {stockRemaining}!
                            </span>
                          </div>
                          <Button
                            className="w-full bg-white text-red-600 hover:bg-white/90 font-bold gap-2"
                            onClick={() => onViewProduct?.(sale.product_id)}
                          >
                            <ShoppingCart className="size-4" />
                            Ver Oferta
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">
                  📚 Artigos Relacionados
                </h3>
                <div className="space-y-3">
                  {blogPosts
                    .filter(p => p.id !== selectedPost.id && p.category === selectedPost.category)
                    .slice(0, 3)
                    .map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <img
                          src={post.cover_image || 'https://via.placeholder.com/80'}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#1a1a2e] line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(post.published_at || post.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  const featuredPost = filteredPosts.find(p => p.is_featured);

  // Blog List View
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Button>
          )}
          <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Blog KZSTORE</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Artigos, guias e dicas sobre tecnologia, hardware e soluções para sua empresa
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                cat === selectedCategory
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        {/* No Posts */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum artigo encontrado.</p>
          </div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-12 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setSelectedPost(featuredPost)}>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src={featuredPost.cover_image || 'https://images.unsplash.com/photo-1591238372338-85e3c7f3f870?w=800'}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Em Destaque
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Tag className="size-4" />
                  <span>{featuredPost.category}</span>
                  {featuredPost.reading_time && (
                    <>
                      <span>•</span>
                      <Clock className="size-4" />
                      <span>{featuredPost.reading_time} min</span>
                    </>
                  )}
                </div>
                
                <h2 className="text-[#1a1a2e] mb-3 text-2xl font-bold">
                  {featuredPost.title}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{featuredPost.author_name || 'Equipe KZSTORE'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>{formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                    </div>
                  </div>
                  
                  <Button className="bg-[#E31E24] hover:bg-[#c01920] text-white">
                    Ler mais <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Blog Grid */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.filter(p => !p.is_featured).map((post) => (
                <article 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1591238372338-85e3c7f3f870?w=800'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-[#1a1a2e] px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-[#1a1a2e] font-bold text-lg mb-2 line-clamp-2">
                      {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="size-3" />
                    <span>{post.author_name || 'Equipe KZSTORE'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                </div>
                
                {post.reading_time && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="size-3" />
                    <span>{post.reading_time} min de leitura</span>
                  </div>
                )}
              </div>
            </article>
          ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ads */}
            <AdBanner position="blog-sidebar" />

            {/* Flash Sales Widget */}
            {flashSales.length > 0 && (
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="size-5 fill-white" />
                  <h3 className="text-lg font-bold">⚡ Promoções Relâmpago</h3>
                </div>
                <div className="space-y-4">
                  {flashSales.slice(0, 3).map((sale) => {
                    const stockRemaining = sale.stock_limit - sale.stock_sold;
                    return (
                      <div key={sale.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all">
                        {sale.product_image && (
                          <img
                            src={sale.product_image}
                            alt={sale.product_name}
                            className="w-full h-32 object-cover rounded-lg mb-3 bg-white"
                          />
                        )}
                        <h4 className="font-bold text-sm mb-2 line-clamp-2">
                          {sale.product_name}
                        </h4>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-xs line-through opacity-75">
                            {sale.original_price.toLocaleString()} Kz
                          </span>
                          <span className="text-xl font-bold">
                            {sale.sale_price.toLocaleString()} Kz
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-white text-red-600 text-xs px-2 py-1 rounded-full font-bold">
                            -{sale.discount_percentage}%
                          </span>
                          <span className="text-xs opacity-90">
                            Restam {stockRemaining}!
                          </span>
                        </div>
                        <Button
                          className="w-full bg-white text-red-600 hover:bg-white/90 font-bold gap-2"
                          onClick={() => onViewProduct?.(sale.product_id)}
                        >
                          <ShoppingCart className="size-4" />
                          Ver Oferta
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Posts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#1a1a2e] mb-4">
                📖 Artigos Populares
              </h3>
              <div className="space-y-3">
                {blogPosts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <img
                      src={post.cover_image || 'https://via.placeholder.com/80'}
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[#1a1a2e] line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(post.published_at || post.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Sidebar */}
            <div className="bg-gradient-to-br from-[#E31E24] to-[#c01920] rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">📧 Newsletter</h3>
              <p className="text-sm mb-4 opacity-90">
                Receba artigos e dicas no seu email
              </p>
              <input
                type="email"
                placeholder="Seu email"
                className="w-full px-3 py-2 rounded text-gray-900 text-sm mb-2"
              />
              <Button className="w-full bg-white text-[#E31E24] hover:bg-gray-100 text-sm">
                Subscrever
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
