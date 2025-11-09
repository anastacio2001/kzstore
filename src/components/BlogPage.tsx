import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Button } from './ui/button';

type BlogPageProps = {
  onBack?: () => void;
};

export function BlogPage({ onBack }: BlogPageProps) {
  const blogPosts = [
    {
      id: '1',
      title: 'Como Escolher a Memória RAM Ideal para seu Servidor',
      excerpt: 'Descubra os principais fatores a considerar na hora de escolher memória RAM para servidores empresariais...',
      image: 'https://images.unsplash.com/photo-1591238372338-85e3c7f3f870?w=800',
      category: 'Hardware',
      author: 'Equipe KZSTORE',
      date: '2024-11-05',
      readTime: '5 min'
    },
    {
      id: '2',
      title: 'SSD vs HDD: Qual a Melhor Opção para sua Empresa?',
      excerpt: 'Entenda as diferenças entre SSDs e HDDs e saiba qual é a melhor escolha para o seu negócio...',
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
      category: 'Armazenamento',
      author: 'Equipe KZSTORE',
      date: '2024-11-01',
      readTime: '7 min'
    },
    {
      id: '3',
      title: 'Mini PCs: A Solução Compacta para Escritórios Modernos',
      excerpt: 'Conheça as vantagens dos Mini PCs e por que eles são a escolha ideal para ambientes corporativos...',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
      category: 'Computadores',
      author: 'Equipe KZSTORE',
      date: '2024-10-28',
      readTime: '6 min'
    },
    {
      id: '4',
      title: 'Segurança Residencial: Guia de Câmeras Wi-Fi',
      excerpt: 'Tudo o que você precisa saber para escolher e instalar câmeras de segurança Wi-Fi em sua casa...',
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800',
      category: 'Segurança',
      author: 'Equipe KZSTORE',
      date: '2024-10-25',
      readTime: '8 min'
    },
    {
      id: '5',
      title: 'Manutenção Preventiva de Servidores: Dicas Essenciais',
      excerpt: 'Aprenda as melhores práticas para manter seus servidores funcionando com máxima eficiência...',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      category: 'Manutenção',
      author: 'Equipe KZSTORE',
      date: '2024-10-20',
      readTime: '10 min'
    },
    {
      id: '6',
      title: 'Telemóveis para Empresas: Como Escolher o Ideal',
      excerpt: 'Fatores importantes a considerar ao escolher smartphones para uso corporativo...',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      category: 'Mobilidade',
      author: 'Equipe KZSTORE',
      date: '2024-10-15',
      readTime: '5 min'
    }
  ];

  const categories = ['Todos', 'Hardware', 'Armazenamento', 'Computadores', 'Segurança', 'Manutenção', 'Mobilidade'];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[#1a1a2e] mb-4">Blog KZSTORE</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Artigos, guias e dicas sobre tecnologia, hardware e soluções para sua empresa
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                cat === 'Todos'
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
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
                <span>{blogPosts[0].category}</span>
                <span>•</span>
                <span>{blogPosts[0].readTime} de leitura</span>
              </div>
              
              <h2 className="text-[#1a1a2e] mb-3">{blogPosts[0].title}</h2>
              
              <p className="text-gray-600 mb-6">
                {blogPosts[0].excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{formatDate(blogPosts[0].date)}</span>
                  </div>
                </div>
                
                <Button className="bg-[#E31E24] hover:bg-[#c41a1f] text-white">
                  Ler Mais
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-[#1a1a2e] px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="size-3" />
                  <span>{formatDate(post.date)}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-[#1a1a2e] text-lg mb-2 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="size-3" />
                    <span>{post.author}</span>
                  </div>
                  
                  <button className="text-[#E31E24] hover:text-[#c41a1f] text-sm font-medium flex items-center gap-1">
                    Ler mais
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-[#E31E24] to-[#c41a1f] rounded-lg p-8 text-center text-white">
          <h2 className="text-white mb-3">📬 Assine Nossa Newsletter</h2>
          <p className="mb-6 text-white/90">
            Receba artigos, dicas e promoções exclusivas diretamente no seu email
          </p>
          
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white px-6">
              Assinar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
