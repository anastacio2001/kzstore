import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
};

type AuthMode = 'login' | 'signup' | 'otp-verify' | 'forgot-password';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    telefone: '',
    otp: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'signup') {
      if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
      if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({}); // Limpar erros anteriores
    
    try {
      if (mode === 'login') {
        await signIn(formData.email, formData.password);
        console.log('✅ Login successful');
        showSuccessMessage('Login realizado com sucesso!');
        onClose();
      } else {
        console.log('📝 Creating account...', {
          email: formData.email,
          nome: formData.nome,
          telefone: formData.telefone
        });
        
        await signUp({
          email: formData.email,
          password: formData.password,
          nome: formData.nome,
          telefone: formData.telefone
        });
        
        console.log('✅ Account created successfully');
        showSuccessMessage('Conta criada com sucesso!');
        
        // Fechar modal após 1 segundo
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      // Mensagens de erro mais claras
      let errorMessage = 'Erro ao autenticar. Tente novamente.';
      
      if (error.message?.includes('Email already')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('Invalid')) {
        errorMessage = 'Email ou senha inválidos.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao autenticar com Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      await signInWithFacebook();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao autenticar com Facebook' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!formData.telefone.trim()) {
      setErrors({ telefone: 'Telefone é obrigatório' });
      return;
    }
    
    setLoading(true);
    try {
      // Enviar OTP via Twilio
      const response = await fetch('/api/twilio/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.telefone })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setMode('otp-verify');
      } else {
        setErrors({ submit: data.error || 'Erro ao enviar código' });
      }
    } catch (error: any) {
      setErrors({ submit: 'Erro ao enviar código de verificação' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: 'Código é obrigatório' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/twilio/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.telefone,
          code: formData.otp 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Criar conta ou fazer login
        onClose();
      } else {
        setErrors({ otp: 'Código inválido' });
      }
    } catch (error: any) {
      setErrors({ submit: 'Erro ao verificar código' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Email inválido' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        toast.error('Erro ao enviar email de recuperação');
        setErrors({ submit: error.message });
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao processar solicitação');
      setErrors({ submit: 'Erro ao enviar email de recuperação' });
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    // Você pode usar um toast aqui se tiver
    console.log('✅ Success:', message);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : mode === 'forgot-password' ? 'Recuperar Senha' : 'Verificar Telefone'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'login'
                ? 'Acesse sua conta KZSTORE'
                : mode === 'signup'
                ? 'Crie sua conta e comece a comprar'
                : mode === 'forgot-password'
                ? 'Digite seu email para receber o link de recuperação'
                : 'Digite o código enviado para seu telefone'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'forgot-password' ? (
            /* Forgot Password Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    } focus:border-red-600 focus:outline-none transition-all`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <Button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>

              <button
                onClick={() => setMode('login')}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Voltar para login
              </button>
            </div>
          ) : mode === 'otp-verify' ? (
            /* OTP Verification */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.otp ? 'border-red-300' : 'border-gray-200'
                  } focus:border-red-600 focus:outline-none transition-all text-center text-2xl tracking-widest`}
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                )}
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Código enviado para {formData.telefone}
                </p>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  'Verificar Código'
                )}
              </Button>

              <button
                onClick={handlePhoneAuth}
                disabled={loading}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Reenviar código
              </button>

              <button
                onClick={() => {
                  setMode('login');
                  setOtpSent(false);
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Voltar
              </button>
            </div>
          ) : (
            /* Login/Signup Form */
            <>
              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </button>

                <button
                  onClick={handleFacebookSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  <svg className="size-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar com Facebook
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                            errors.nome ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="João Silva"
                        />
                      </div>
                      {errors.nome && (
                        <p className="mt-2 text-sm text-red-600">{errors.nome}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                            errors.telefone ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="+244 900 000 000"
                        />
                      </div>
                      {errors.telefone && (
                        <p className="mt-2 text-sm text-red-600">{errors.telefone}</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      } focus:border-red-600 focus:outline-none transition-all`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      } focus:border-red-600 focus:outline-none transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                  {mode === 'login' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                        } focus:border-red-600 focus:outline-none transition-all`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : mode === 'login' ? (
                    'Entrar'
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>

              {/* Phone Auth Option */}
              {mode === 'signup' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou verifique por telefone</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePhoneAuth}
                    disabled={loading || !formData.telefone}
                    variant="outline"
                    className="w-full py-3 rounded-xl border-2"
                  >
                    <Phone className="size-5 mr-2" />
                    Verificar por WhatsApp/SMS
                  </Button>
                </>
              )}

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  {mode === 'login' ? (
                    <>Não tem conta? <span className="font-semibold">Criar conta</span></>
                  ) : (
                    <>Já tem conta? <span className="font-semibold">Entrar</span></>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}