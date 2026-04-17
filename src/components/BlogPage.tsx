import { useState, useEffect, useRef } from 'react';
import {
  Calendar, User, ArrowRight, Tag, Clock, ArrowLeft,
  Zap, ShoppingCart, Search, X, BookOpen, Sparkles, Mail, Send,
  TrendingUp, Cpu, Smartphone, Monitor, HardDrive, Wifi, Star,
  ChevronRight, Rss
} from 'lucide-react';
import { Button } from './ui/button';
import { getBlogPosts, BlogPost } from '../services/blogService';
import { AdBanner } from './AdBanner';
import { BlogInteractions } from './BlogInteractions';
import { toast } from 'sonner';

type FlashSale = {
  id: string; product_id: string; product_name: string; product_image: string;
  original_price: number; sale_price: number; discount_percentage: number;
  stock_limit: number; stock_sold: number; start_date: string; end_date: string;
  title: string; description: string; is_active: boolean;
};

type BlogPageProps = {
  onBack?: () => void;
  onViewProduct?: (productId: string) => void;
  onNavigateToProduct?: (product: any) => void;
};

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, any> = {
  'Hardware': Cpu,
  'Smartphones': Smartphone,
  'Computadores': Monitor,
  'Armazenamento': HardDrive,
  'Redes': Wifi,
  'Software': Sparkles,
  'default': BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Hardware': '#3b82f6',
  'Smartphones': '#8b5cf6',
  'Computadores': '#06b6d4',
  'Armazenamento': '#f59e0b',
  'Redes': '#10b981',
  'Software': '#ec4899',
  'default': '#E31E24',
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse ${featured ? 'h-72' : ''}`}>
      <div className={`bg-gray-200 ${featured ? 'h-full' : 'aspect-video'}`} />
      {!featured && (
        <div className="p-5 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="flex justify-between pt-2">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── YouTube embed ─────────────────────────────────────────────────────────────
const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <div className="relative w-full overflow-hidden rounded-xl my-8 bg-black shadow-xl" style={{ paddingBottom: '56.25%' }}>
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

// ── Inline Newsletter Banner ──────────────────────────────────────────────────
function InlineNewsletterBanner() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error('Email inválido'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-inline' }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch { toast.error('Erro ao inscrever. Tente novamente.'); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="col-span-full rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="font-bold text-xl text-white">Subscrito com sucesso!</h3>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Receberás as próximas novidades no teu email.</p>
      </div>
    );
  }

  return (
    <div className="col-span-full overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #111827 100%)' }}>
      <div className="flex flex-col md:flex-row items-center gap-6 p-8">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <Rss className="size-5" style={{ color: '#E31E24' }} />
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.125rem' }}>Newsletter KZSTORE</span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Receba artigos, ofertas e novidades de tecnologia directamente no seu email — sem spam.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com" required
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '0.75rem', padding: '0.625rem 1rem', fontSize: '0.875rem', outline: 'none' }}
            className="flex-1 min-w-0 md:w-52 placeholder-gray-400"
          />
          <button type="submit" disabled={loading}
            style={{ background: 'linear-gradient(to right, #E31E24, #f97316)', color: 'white', borderRadius: '0.75rem', padding: '0.625rem 1rem', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {loading
              ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.5)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <Send className="size-4" />}
            Inscrever
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar Newsletter ────────────────────────────────────────────────────────
function SidebarNewsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error('Email inválido'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-sidebar' }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch { toast.error('Erro ao inscrever.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0d1a, #111827)' }}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="size-5" style={{ color: '#E31E24' }} />
          <span style={{ color: '#ffffff', fontWeight: 700 }}>Newsletter</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '1rem' }}>
          Os melhores artigos semanalmente no teu email
        </p>
        {done ? (
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
            <span style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600 }}>✓ Subscrito com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              className="placeholder-gray-500"
            />
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(to right, #E31E24, #f97316)', color: 'white', borderRadius: '0.625rem', padding: '0.5rem', fontWeight: 600, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
              {loading
                ? <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <><Send className="size-3.5" /> Subscrever</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Empty State (convincente) ─────────────────────────────────────────────────
function EmptyState({ onNavigateNewsletter }: { onNavigateNewsletter?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8">
        {/* Fake placeholder cards behind */}
        <div className="absolute -top-2 -left-8 w-32 h-24 bg-gray-100 rounded-xl shadow-sm rotate-[-6deg] opacity-60" />
        <div className="absolute -top-2 -right-8 w-32 h-24 bg-gray-100 rounded-xl shadow-sm rotate-[6deg] opacity-60" />
        <div className="relative bg-white rounded-2xl shadow-md p-6 w-48 border border-gray-100">
          <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3" />
          <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-2 bg-gray-100 rounded w-full mb-1" />
          <div className="h-2 bg-gray-100 rounded w-2/3" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-semibold"
        style={{ background: 'rgba(227,30,36,0.08)', color: '#E31E24', border: '1px solid rgba(227,30,36,0.2)' }}>
        <Rss className="size-4" /> Em breve
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.75rem' }}>
        Os primeiros artigos estão a caminho!
      </h3>
      <p style={{ color: '#6b7280', maxWidth: '28rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        A equipa KZSTORE está a preparar guias, análises e dicas de tecnologia exclusivas para si.
        Subscreva a newsletter para ser o primeiro a saber quando publicarmos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNavigateNewsletter}
          style={{ background: 'linear-gradient(to right, #E31E24, #f97316)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail className="size-4" /> Subscrever Newsletter
        </button>
        <a href="https://wa.me/244931054015" target="_blank" rel="noopener noreferrer"
          style={{ background: '#25d366', color: 'white', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💬</span> Contacte-nos no WhatsApp
        </a>
      </div>
    </div>
  );
}

// ── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({ post, onClick, featured = false }: { post: BlogPost; onClick: () => void; featured?: boolean }) {
  const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['default'];
  const isNew = (() => {
    const d = new Date(post.published_at || post.created_at);
    const ago = new Date(); ago.setHours(ago.getHours() - 72);
    return d > ago;
  })();

  if (featured) {
    return (
      <div onClick={onClick}
        className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
        style={{ background: '#111827', minHeight: '360px' }}>
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ opacity: 0.55 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }} />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse"
            style={{ background: 'rgba(227,30,36,0.9)', backdropFilter: 'blur(8px)' }}>
            <Star className="size-3 fill-white" /> ✨ Destaque
          </span>
          {isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)' }}>
              Novo
            </span>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white mb-3"
            style={{ background: catColor }}>
            {post.category}
          </span>
          <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1rem' }}
              className="line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: catColor }}>
                {(post.author_name || 'K').charAt(0)}
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: 600 }}>{post.author_name || 'Equipe KZSTORE'}</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem' }}>
                  {new Date(post.published_at || post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '0.625rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              className="transition-all group-hover:bg-white/25">
              Ler artigo <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl"
      style={{ border: '1px solid #f1f5f9' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = catColor)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#f1f5f9')}>
      
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)', opacity: 0 }}
          ref={el => {
            if (el) {
              el.parentElement?.parentElement?.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
              el.parentElement?.parentElement?.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
            }
          }}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: catColor, boxShadow: `0 2px 8px ${catColor}50` }}>
            {post.category}
          </span>
          {isNew && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: '#10b981' }}>
              Novo
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="line-clamp-2 group-hover:text-[#E31E24] transition-colors"
          style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.4, marginBottom: '0.5rem' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2" style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            {post.excerpt}
          </p>
        )}

        {/* Reading time bar */}
        {post.reading_time && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Tempo de leitura</span>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>{post.reading_time} min</span>
            </div>
            <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((post.reading_time / 15) * 100, 100)}%`, background: catColor, borderRadius: '9999px' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${catColor}, #f97316)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>
              {(post.author_name || 'K').charAt(0)}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>{post.author_name || 'KZSTORE'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#9ca3af' }}>
            <Calendar className="size-3" />
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Main Blog Page ────────────────────────────────────────────────────────────
export function BlogPage({ onBack, onViewProduct, onNavigateToProduct }: BlogPageProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadBlogPosts(); loadFlashSales(); }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await getBlogPosts({ status: 'published' });
      const posts = response.posts || [];
      setBlogPosts(posts);
      const uniqueCategories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
      setCategories(['all', ...uniqueCategories]);
    } catch { setBlogPosts([]); }
    finally { setLoading(false); }
  };

  const loadFlashSales = async () => {
    try {
      const r = await fetch('/api/flash-sales');
      if (r.ok) { const d = await r.json(); setFlashSales(d.flashSales || []); }
    } catch {}
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = content;
    const decoded = textarea.value;
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&][^\s<]*)?/gi;
    const parts: JSX.Element[] = [];
    let lastIndex = 0; let match; let key = 0;
    while ((match = ytRegex.exec(decoded)) !== null) {
      if (match.index > lastIndex) {
        const t = decoded.substring(lastIndex, match.index).trim();
        if (t) parts.push(<div key={`t-${key++}`} className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: t }} />);
      }
      parts.push(<YouTubeEmbed key={`v-${key++}`} videoId={match[1]} />);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < decoded.length) {
      const t = decoded.substring(lastIndex).trim();
      if (t) parts.push(<div key={`t-${key++}`} className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: t }} />);
    }
    return parts.length ? <>{parts}</> : <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: decoded }} />;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });

  const filteredPosts = blogPosts
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    });

  // ── Single Post View ───────────────────────────────────────────────────────
  if (selectedPost) {
    const catColor = CATEGORY_COLORS[selectedPost.category] || CATEGORY_COLORS['default'];
    return (
      <div className="min-h-screen bg-gray-50">
        {selectedPost.cover_image && (
          <div className="relative overflow-hidden" style={{ height: 'clamp(240px, 40vw, 480px)' }}>
            <img src={selectedPost.cover_image} alt={selectedPost.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                style={{ background: catColor }}>
                {selectedPost.category}
              </span>
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1.2 }}>
                {selectedPost.title}
              </h1>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-6 hover:bg-gray-100">
            <ArrowLeft className="size-4 mr-2" /> Voltar aos artigos
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2">
              {!selectedPost.cover_image && (
                <h1 style={{ fontWeight: 900, fontSize: '2rem', color: '#111827', marginBottom: '1.5rem' }}>{selectedPost.title}</h1>
              )}

              <div className="flex items-center gap-4 flex-wrap mb-8 pb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: catColor }}>
                    {(selectedPost.author_name || 'K').charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{selectedPost.author_name || 'Equipe KZSTORE'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(selectedPost.published_at || selectedPost.created_at)}</p>
                  </div>
                </div>
                {selectedPost.reading_time && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: `${catColor}15`, color: catColor, fontSize: '0.75rem', fontWeight: 600 }}>
                    <Clock className="size-3.5" /> {selectedPost.reading_time} min de leitura
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">
                {renderContent(selectedPost.content)}
              </div>

              <div className="mt-8">
                <BlogInteractions
                  postId={selectedPost.id}
                  postTitle={selectedPost.title}
                  postUrl={`${window.location.origin}/blog/${selectedPost.slug || selectedPost.id}`}
                />
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mt-6 flex items-center gap-2 flex-wrap">
                  <Tag className="size-4" style={{ color: '#9ca3af' }} />
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} style={{ background: '#f3f4f6', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <div className="space-y-6">
              <AdBanner position="blog-sidebar" onNavigateToProduct={onNavigateToProduct} />
              <SidebarNewsletter />

              {flashSales.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="size-4 fill-white text-white" />
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>⚡ Flash Sales</span>
                  </div>
                  <div className="space-y-3">
                    {flashSales.slice(0, 3).map(sale => (
                      <div key={sale.id} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                        {sale.product_image && <img src={sale.product_image} alt={sale.product_name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                        <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }} className="line-clamp-2">{sale.product_name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', textDecoration: 'line-through' }}>{sale.original_price.toLocaleString()} Kz</span>
                          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>{sale.sale_price.toLocaleString()} Kz</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ background: 'rgba(255,255,255,0.95)', color: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>-{sale.discount_percentage}%</span>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Restam {sale.stock_limit - sale.stock_sold}</span>
                        </div>
                        <button onClick={() => onViewProduct?.(sale.product_id)}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.95)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', padding: '0.4rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <ShoppingCart className="size-3.5" /> Ver Oferta
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <BookOpen className="size-4" style={{ color: '#E31E24' }} /> Artigos Relacionados
                </h3>
                <div className="space-y-3">
                  {blogPosts.filter(p => p.id !== selectedPost.id && p.category === selectedPost.category).slice(0, 4).map(post => (
                    <div key={post.id} onClick={() => setSelectedPost(post)}
                      className="flex gap-3 cursor-pointer group p-2 rounded-xl transition-colors hover:bg-gray-50">
                      <img src={post.cover_image || 'https://via.placeholder.com/64'} alt={post.title}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="line-clamp-2 group-hover:text-[#E31E24] transition-colors"
                          style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111827' }}>
                          {post.title}
                        </h4>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
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

  // ── Blog List View ─────────────────────────────────────────────────────────
  const featuredPost = filteredPosts.find(p => p.is_featured) || (filteredPosts.length > 0 ? filteredPosts[0] : null);
  const featuredId = featuredPost?.id;
  const regularPosts = filteredPosts.filter(p => p.id !== featuredId);

  const postsWithBanner = regularPosts.reduce<Array<BlogPost | 'newsletter-banner'>>((acc, post, i) => {
    acc.push(post);
    if (i === 3) acc.push('newsletter-banner');
    return acc;
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #111827 60%, #0a1628 100%)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'rgba(227,30,36,0.08)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: 'rgba(59,130,246,0.08)', filter: 'blur(60px)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
          {/* Top row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              {onBack && (
                <button onClick={onBack} className="flex items-center gap-1.5 mb-4 transition-colors"
                  style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                  <ArrowLeft className="size-4" /> Voltar
                </button>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4" style={{ color: '#E31E24' }} />
                <span style={{ color: '#ff8080', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Blog KZSTORE</span>
              </div>
              <h1 style={{ color: '#ffffff', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.1 }}>
                Tecnologia &{' '}
                <span style={{ background: 'linear-gradient(to right, #E31E24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Inovação
                </span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.75rem', maxWidth: '30rem' }}>
                Guias, análises e dicas de tecnologia para a sua empresa em Angola
              </p>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem' }}>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem' }}>{blogPosts.length}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Artigos</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem' }}>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem' }}>{categories.length - 1}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tópicos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar — always visible */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5" style={{ color: '#6b7280' }} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar artigos, guias, dicas..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '0.875rem', padding: '0.875rem 1rem 0.875rem 3rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              className="placeholder-gray-500"
              onFocus={e => (e.target.style.borderColor = 'rgba(227,30,36,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Categories — inside hero */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => {
              const count = cat === 'all' ? blogPosts.length : blogPosts.filter(p => p.category === cat).length;
              const CatIcon = cat === 'all' ? BookOpen : (CATEGORY_ICONS[cat] || CATEGORY_ICONS['default']);
              const catColor = cat === 'all' ? '#E31E24' : (CATEGORY_COLORS[cat] || CATEGORY_COLORS['default']);
              const isActive = cat === selectedCategory;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600,
                    whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                    background: isActive ? catColor : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    boxShadow: isActive ? `0 4px 12px ${catColor}40` : 'none',
                  }}>
                  <CatIcon className="size-3.5" />
                  {cat === 'all' ? 'Todos' : cat}
                  <span style={{
                    padding: '0.05rem 0.4rem', borderRadius: '9999px', fontSize: '0.65rem',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#ffffff' : '#6b7280',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search results indicator */}
          {search && (
            <div className="pb-3" style={{ color: '#fbbf24', fontSize: '0.8rem' }}>
              <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'resultado' : 'resultados'} para "{search}"
            </div>
          )}
        </div>
      </div>

      {/* ── Animated Separator ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: '3px' }}>
        <style>{`@keyframes sepSlide { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } } @keyframes sepPulse { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }`}</style>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d0d1a, #1e1b4b, #0d0d1a)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 0%, #E31E24 40%, #f97316 60%, transparent 100%)', animation: 'sepSlide 2.5s ease-in-out infinite', opacity: 0.8 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(227,30,36,0.4), transparent)', animation: 'sepPulse 2s ease-in-out infinite' }} />
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Loading */}
        {loading && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <SkeletonCard featured />
              <div className="grid sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPosts.length === 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {search || selectedCategory !== 'all' ? (
                <div className="text-center py-16">
                  <Search className="size-12 mx-auto mb-4" style={{ color: '#d1d5db' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>
                    Nenhum artigo encontrado
                  </h3>
                  <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                    {search ? `Sem resultados para "${search}"` : `Sem artigos em "${selectedCategory}"`}
                  </p>
                  <button onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                    style={{ background: '#E31E24', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.625rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    Ver todos os artigos
                  </button>
                </div>
              ) : (
                <EmptyState onNavigateNewsletter={() => window.location.hash = 'newsletter-page'} />
              )}
            </div>
            <div className="space-y-6">
              <SidebarNewsletter />
              {/* Sidebar Search */}
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search className="size-4" style={{ color: '#E31E24' }} /> Pesquisar
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#9ca3af' }} />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar artigos..."
                    style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.625rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = '#E31E24')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {flashSales.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <p style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>⚡ Flash Sales</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{flashSales.length} ofertas disponíveis</p>
                </div>
              )}
              <AdBanner position="blog-sidebar" onNavigateToProduct={onNavigateToProduct} />
            </div>
          </div>
        )}

        {/* Posts */}
        {!loading && filteredPosts.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured */}
              {featuredPost && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="size-4" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Artigo em Destaque
                    </span>
                  </div>
                  <ArticleCard post={featuredPost} onClick={() => setSelectedPost(featuredPost)} featured />
                </div>
              )}

              {/* Grid */}
              {regularPosts.length > 0 && (
                <div>
                  {featuredPost && (
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="size-4" style={{ color: '#E31E24' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Últimos Artigos
                      </span>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-5">
                    {postsWithBanner.map((item, i) => {
                      if (item === 'newsletter-banner') {
                        return <InlineNewsletterBanner key="nl-banner" />;
                      }
                      const post = item as BlogPost;
                      return <ArticleCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SidebarNewsletter />

              {/* Sidebar Search */}
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search className="size-4" style={{ color: '#E31E24' }} /> Pesquisar
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: '#9ca3af' }} />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar artigos..."
                    style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.625rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target.style.borderColor = '#E31E24')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {flashSales.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="size-4 fill-white text-white" />
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>⚡ Flash Sales</span>
                  </div>
                  <div className="space-y-3">
                    {flashSales.slice(0, 2).map(sale => {
                      const rem = sale.stock_limit - sale.stock_sold;
                      return (
                        <div key={sale.id} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                          {sale.product_image && <img src={sale.product_image} alt={sale.product_name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                          <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }} className="line-clamp-2">{sale.product_name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', textDecoration: 'line-through' }}>{sale.original_price.toLocaleString()} Kz</span>
                            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>{sale.sale_price.toLocaleString()} Kz</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ background: 'rgba(255,255,255,0.95)', color: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>-{sale.discount_percentage}%</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Restam {rem}</span>
                          </div>
                          <button onClick={() => onViewProduct?.(sale.product_id)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.95)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', padding: '0.4rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            <ShoppingCart className="size-3.5" /> Ver Oferta
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular */}
              {blogPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <TrendingUp className="size-4" style={{ color: '#E31E24' }} /> Populares
                  </h3>
                  <div className="space-y-3">
                    {blogPosts.slice(0, 5).map((post, i) => {
                      const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['default'];
                      return (
                        <div key={post.id} onClick={() => setSelectedPost(post)}
                          className="flex gap-3 cursor-pointer group p-2 rounded-xl transition-colors hover:bg-gray-50">
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f3f4f6', lineHeight: 1, flexShrink: 0, width: '1.5rem', textAlign: 'center', paddingTop: '0.125rem' }}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="line-clamp-2" style={{ fontWeight: 600, fontSize: '0.8rem', color: '#111827', lineHeight: 1.4 }}
                              onMouseEnter={e => (e.currentTarget.style.color = catColor)}
                              onMouseLeave={e => (e.currentTarget.style.color = '#111827')}>
                              {post.title}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                              <Clock className="size-3" />
                              <span>{post.reading_time || '?'} min</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <AdBanner position="blog-sidebar" onNavigateToProduct={onNavigateToProduct} />

              {/* Categories list */}
              {categories.length > 1 && (
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', fontSize: '0.9rem' }}>📂 Categorias</h3>
                  <div className="space-y-1">
                    {categories.filter(c => c !== 'all').map(cat => {
                      const count = blogPosts.filter(p => p.category === cat).length;
                      const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS['default'];
                      const CatIcon = CATEGORY_ICONS[cat] || CATEGORY_ICONS['default'];
                      return (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: selectedCategory === cat ? `${catColor}12` : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (selectedCategory !== cat) e.currentTarget.style.background = '#f9fafb'; }}
                          onMouseLeave={e => { if (selectedCategory !== cat) e.currentTarget.style.background = 'transparent'; }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CatIcon className="size-3.5" style={{ color: catColor }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>{cat}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: catColor, background: `${catColor}15`, padding: '0.1rem 0.5rem', borderRadius: '9999px' }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
