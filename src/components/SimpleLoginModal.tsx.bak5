/**
 * Modal de Login Simples
 *
 * Sistema temporário de login sem Supabase
 * Para clientes fazerem pedidos e visualizar seus pedidos
 */

import { useState } from 'react';
import { X, Mail, User, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { toast } from 'sonner';

type SimpleLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
};

export function SimpleLoginModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Identifique-se",
  description = "Precisamos do seu email para continuar"
}: SimpleLoginModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail } = useLocalAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Por favor, preencha o email');
      return;
    }

    if (!name.trim()) {
      toast.error('Por favor, preencha o nome');
      return;
    }

    // Validar email
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email inválido');
      return;
    }

    setLoading(true);
    try {
      console.log('🔵 [SimpleLoginModal] Submitting login:', email);

      const user = await loginWithEmail(email, name);

      // Atualizar telefone se fornecido
      if (phone && user) {
        const savedUsers = JSON.parse(localStorage.getItem('kzstore_local_user') || '{}');
        savedUsers[email] = { ...user, phone };
        localStorage.setItem('kzstore_local_user', JSON.stringify(savedUsers));
      }

      console.log('✅ [SimpleLoginModal] Login successful');
      toast.success(`Bem-vindo, ${name}!`);

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('❌ [SimpleLoginModal] Login failed:', error);
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Telefone (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+244 900 000 000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              ℹ️ Seus dados são usados apenas para gerenciar seus pedidos. Você poderá visualizar todos os pedidos feitos com este email.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Continuar'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-4">
          Ao continuar, você concorda com nossos{' '}
          <a href="#terms" className="text-red-600 hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="#privacy" className="text-red-600 hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
