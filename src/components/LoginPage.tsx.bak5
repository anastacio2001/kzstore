import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { SocialLogin } from './SocialLogin';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onForgotPassword?: () => void;
  onSocialLogin?: (token: string, user: any) => void;
};

export function LoginPage({ onLogin, onBack, onForgotPassword, onSocialLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialError, setSocialError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full my-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white hover:text-red-400 transition-colors group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-2xl overflow-hidden animate-scale-in max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-primary text-white p-6 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-white/20 backdrop-blur-sm mb-3">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-xl font-bold mb-1">Painel Administrativo</h1>
            <p className="text-sm text-white/90">Entre com suas credenciais</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all text-sm"
                    placeholder="admin@kzstore.ao"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  {onForgotPassword && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Social Login */}
            {onSocialLogin && (
              <div className="mt-6">
                <SocialLogin
                  onSuccess={(token, user) => {
                    setSocialError('');
                    onSocialLogin(token, user);
                  }}
                  onError={(error) => setSocialError(error)}
                />
                
                {socialError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-700 font-medium">{socialError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-white/80">
            🔒 Conexão segura e criptografada
          </p>
        </div>
      </div>
    </div>
  );
}
