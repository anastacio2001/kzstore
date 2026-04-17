import { useState, useEffect } from 'react';
import {
  Mail, Send, CheckCircle, Users, ArrowRight, Shield,
  Zap, Bell, Star, Gift, TrendingUp, Share2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { buildAPIURL } from '../utils/api';

type NewsletterPageProps = {
  onBack?: () => void;
};

const benefits = [
  { icon: Zap, title: 'Ofertas Exclusivas', desc: 'Receba promoções antes de mais ninguém', color: 'from-yellow-400 to-orange-400' },
  { icon: Bell, title: 'Novidades em Primeira Mão', desc: 'Fique a par dos novos produtos assim que chegam', color: 'from-blue-400 to-cyan-400' },
  { icon: Gift, title: 'Cupões Especiais', desc: 'Descontos exclusivos para subscritos', color: 'from-green-400 to-emerald-400' },
  { icon: TrendingUp, title: 'Guias & Dicas', desc: 'Artigos de tecnologia e hardware úteis', color: 'from-purple-400 to-pink-400' },
];

const testimonials = [
  { name: 'Armando M.', text: 'Já poupei mais de 15.000 Kz com as promoções do newsletter!', avatar: 'A' },
  { name: 'Cláudia F.', text: 'Recebo exatamente o que quero saber sobre tecnologia.', avatar: 'C' },
  { name: 'Inácio R.', text: 'O melhor newsletter de tecnologia em Angola!', avatar: 'I' },
];

export function NewsletterPage({ onBack }: NewsletterPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetch(buildAPIURL('/newsletter/count'))
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.count) setCount(d.count); })
      .catch(() => {});

    const interval = setInterval(() => {
      setActiveTestimonial(t => (t + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(buildAPIURL('/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'newsletter-page' })
      });
      if (!response.ok) throw new Error('Erro ao inscrever');
      setSubscribed(true);
      if (count !== null) setCount(c => (c || 0) + 1);
    } catch {
      toast.error('Erro ao inscrever. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}/#newsletter-page`;

  const pageStyle: React.CSSProperties = {
    minHeight: '100%',
    background: 'linear-gradient(135deg, #0d0d1a 0%, #111827 50%, #0a1628 100%)',
  };

  if (subscribed) {
    return (
      <div style={pageStyle} className="flex items-center justify-center p-8 min-h-screen">
        <div className="text-center max-w-lg mx-auto">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-full shadow-2xl">
              <CheckCircle className="size-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Bem-vindo(a) à família! 🎉</h1>
          <p className="text-gray-200 text-lg mb-2">
            <strong className="text-white">{name || email}</strong>, a tua inscrição foi confirmada!
          </p>
          <p className="text-gray-300 mb-10">
            Vais receber as melhores ofertas e novidades da KZSTORE diretamente no teu email.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }} className="rounded-2xl p-6 mb-8">
            <p className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
              <Share2 className="size-4" /> Partilha com os teus amigos!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href={`https://wa.me/?text=Subscreve%20o%20newsletter%20da%20KZSTORE!%20${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              >
                Facebook
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copiado!'); }}
                className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              >
                Copiar Link
              </button>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowRight className="size-4 rotate-180" /> Voltar à loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="relative overflow-hidden min-h-screen">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full animate-pulse" style={{ background: 'rgba(227,30,36,0.12)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full animate-pulse" style={{ background: 'rgba(59,130,246,0.12)', filter: 'blur(80px)', animationDelay: '2s' }} />
        {/* Dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-10 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowRight className="size-4 rotate-180" />
            Voltar à loja
          </button>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ── LEFT SIDE ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: 'rgba(227,30,36,0.2)', border: '1px solid rgba(227,30,36,0.4)', color: '#ff8080' }}>
              <Sparkles className="size-4" />
              Newsletter Exclusiva KZSTORE
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
              Fique sempre
              <span className="block" style={{ background: 'linear-gradient(to right, #E31E24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                à frente!
              </span>
            </h1>

            <p style={{ color: '#e2e8f0', fontSize: '1.125rem', lineHeight: '1.75rem', marginBottom: '2.5rem' }}>
              Subscreva a newsletter da KZSTORE e receba as melhores ofertas de tecnologia,
              guias exclusivos e novidades antes de todos!
            </p>

            {/* Subscriber count */}
            {count !== null && count > 0 && (
              <div className="flex items-center gap-3 mb-10">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ borderColor: '#0d0d1a', background: 'linear-gradient(135deg, #E31E24, #f97316)' }}>
                      {l}
                    </div>
                  ))}
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <strong style={{ color: '#ffffff' }}>{count.toLocaleString('pt-AO')}+</strong> pessoas já subscreveram
                </p>
              </div>
            )}

            {/* Benefits grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-5 transition-all duration-300 hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${b.color} mb-3 shadow-lg`}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.25rem' }}>{b.title}</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.5rem' }}>{b.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p style={{ color: '#f8fafc', fontStyle: 'italic', fontSize: '1rem', marginBottom: '1rem' }}>"{testimonials[activeTestimonial].text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #E31E24, #f97316)' }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{testimonials[activeTestimonial].name}</span>
              </div>
              <div className="flex gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === activeTestimonial ? '24px' : '6px',
                      background: i === activeTestimonial ? '#E31E24' : 'rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE — Form ── */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}
            >
              {/* Form header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl shadow-lg mb-4"
                  style={{ background: 'linear-gradient(135deg, #E31E24, #f97316)' }}>
                  <Mail className="size-8 text-white" />
                </div>
                <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Subscreva Grátis</h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Sem spam. Cancele quando quiser.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Nome (opcional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="O seu nome"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
                    className="w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Email <span style={{ color: '#E31E24' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
                    className="w-full px-4 py-3 rounded-xl placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 text-white"
                  style={{ background: 'linear-gradient(to right, #E31E24, #f97316)', boxShadow: '0 4px 20px rgba(227,30,36,0.4)' }}
                >
                  {loading ? (
                    <>
                      <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      A inscrever...
                    </>
                  ) : (
                    <>
                      <Send className="size-5" />
                      Subscrever Agora — É Grátis!
                    </>
                  )}
                </button>
              </form>

              {/* Trust badges */}
              <div className="mt-6 pt-6 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                {[
                  { icon: Shield, text: 'Os seus dados estão 100% seguros' },
                  { icon: Users, text: 'Sem spam, prometemos!' },
                  { icon: CheckCircle, text: 'Cancele a qualquer momento' },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
                      <Icon className="size-4 flex-shrink-0" style={{ color: '#4ade80' }} />
                      {b.text}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.375rem 0.75rem', borderRadius: '9999px' }}>
                  📅 Frequência: 1–2 emails por semana
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
