import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { buildAPIURL } from '../utils/api';

type NewsletterFormProps = {
  source?: string;
  className?: string;
};

export function NewsletterForm({ source = 'footer', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

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
        body: JSON.stringify({ email, name, source })
      });

      if (!response.ok) {
        throw new Error('Erro ao inscrever na newsletter');
      }

      toast.success('Inscrito com sucesso! Verifique seu email.');
      setSubscribed(true);
      setEmail('');
      setName('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao inscrever na newsletter');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="size-5" />
        <span className="text-sm font-medium">Inscrito com sucesso!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome (opcional)"
        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none transition-colors"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none transition-colors"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-red-600 hover:bg-gray-100"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="size-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            Inscrevendo...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="size-4" />
            Inscrever
          </span>
        )}
      </Button>
    </form>
  );
}
