import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
  phone?: string;
  avatar?: string;
  access_token?: string;
  nome?: string;
  telefone?: string;
  endereco?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // Backwards compatibility aliases
  login?: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; nome: string; telefone?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  logout?: () => Promise<void>;
  checkSession: () => Promise<User | null>;
  updateUser: (data: { name?: string; phone?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // OAuth
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}

type Props = { children: ReactNode };

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(() => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window === 'undefined') return null;
    
    try {
      const savedUser = localStorage.getItem('kzstore_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
      // Limpar localStorage corrompido
      try {
        localStorage.removeItem('kzstore_user');
      } catch (e) {
        // Ignorar erro de limpeza
      }
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('kzstore_user');
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kzstore_user', JSON.stringify(user));
      localStorage.setItem('kzstore_user_id', user.id);
    } else {
      localStorage.removeItem('kzstore_user');
      localStorage.removeItem('kzstore_user_id');
    }
  }, [user]);

  // Listen for global auth changes
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail;
      if (detail) {
        setUser(detail as User);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('kzstore:authChange', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kzstore:authChange', handler as EventListener);
      }
    };
  }, []);

  const checkSession = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);

      // Tentar pegar token do user salvo (mesma chave que signIn usa)
      const savedUser = localStorage.getItem('user');
      let token = null;
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          token = parsed.access_token;
        } catch (e) {
          console.error('❌ [checkSession] Error parsing user from localStorage:', e);
        }
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        // No session
        setUser(null);
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kzstore:authChange', { detail: null }));
        }
        return null;
      }

      const data = await response.json();
      const me = data.user;
      // Backend pode retornar 'role' ou 'userType' - aceitar ambos
      const userRole = me.role || me.userType || 'customer';
      const userData: User = {
        id: me.id,
        email: me.email || '',
        role: userRole,
        name: me.name || me.email?.split('@')[0] || 'Usuário',
        phone: me.phone,
      };

      setUser(userData);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kzstore:authChange', { detail: userData }));
      }
      return userData;
    } catch (error) {
      console.error('❌ [AuthProvider] checkSession error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // NÃO verificar sessão automaticamente no mount
    // O usuário já está no state se fez login
    // Apenas garantir que loading seja false
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.');
      }
      
      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        try {
          const err = await response.json();
          errorMessage = err.error || errorMessage;
        } catch (e) {
          // If response is not JSON (e.g., HTML error page), use status-based message
          if (response.status === 401) {
            errorMessage = 'Email ou senha incorretos';
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      if (data.user && data.token) {
        const me = data.user;
        const token = data.token;
        // Backend pode retornar 'role' ou 'userType' - aceitar ambos
        const userRole = me.role || me.userType || 'customer';
        const userData: User = { 
          id: me.id, 
          email: me.email, 
          role: userRole, 
          name: me.name || me.nome, 
          phone: me.phone || me.telefone, 
          access_token: token
        };
        
        // Salvar token separadamente E dentro do user
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kzstore:authChange', { detail: userData }));
        }
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async ({ email, password, nome, telefone }: { email: string; password: string; nome: string; telefone?: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name: nome, phone: telefone }),
      });
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.');
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Erro ao processar resposta do servidor');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }
      
      if (data.user && data.token) {
        const me = data.user;
        const token = data.token;
        // Backend pode retornar 'role' ou 'userType' - aceitar ambos
        const userRole = me.role || me.userType || 'customer';
        const userData: User = { 
          id: me.id, 
          email: me.email, 
          role: userRole, 
          name: me.name || me.nome, 
          phone: me.phone || me.telefone, 
          access_token: token // ✅ SALVAR TOKEN
        };
        
        // Salvar no localStorage com token
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kzstore:authChange', { detail: userData }));
        }
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kzstore:authChange', { detail: null }));
      }
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (userData: { name?: string; phone?: string }) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name, phone: userData.phone }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao atualizar usuário');
      }
      const data = await response.json();
      if (data.user) {
        setUser((old) => ({ ...old, name: data.user.name, phone: data.user.phone } as User));
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      if (user?.email) {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: user.email, password: currentPassword }),
        });
        if (!resp.ok) throw new Error('Senha atual incorreta');
      }
      const updateResp = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });
      if (!updateResp.ok) {
        const err = await updateResp.json();
        throw new Error(err.error || 'Erro ao atualizar senha');
      }
    } catch (err) {
      throw err;
    }
  }, [user?.email]);

  const resetPassword = useCallback(async (email: string) => {
    console.log('🔐 [resetPassword] Iniciando requisição de recuperação de senha para:', email);
    
    const resp = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    console.log('🔐 [resetPassword] Resposta recebida:', resp.status, resp.statusText);
    
    if (!resp.ok) {
      const err = await resp.json();
      console.error('❌ [resetPassword] Erro na resposta:', err);
      throw new Error(err.error || 'Erro ao requisitar redefinição de senha');
    }
    
    const data = await resp.json();
    console.log('✅ [resetPassword] Sucesso:', data);
  }, []);

  // OAuth - Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      // Redirecionar para endpoint OAuth do Google
      window.location.href = '/api/auth/google';
    } catch (error: any) {
      console.error('❌ Erro no login com Google:', error);
      throw new Error(error.message || 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // OAuth - Facebook
  const signInWithFacebook = useCallback(async () => {
    try {
      setIsLoading(true);
      // Redirecionar para endpoint OAuth do Facebook
      window.location.href = '/api/auth/facebook';
    } catch (error: any) {
      console.error('❌ Erro no login com Facebook:', error);
      throw new Error(error.message || 'Erro ao fazer login com Facebook');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAdmin = useCallback(() => {
    if (!user) {
      console.log('🔍 [isAdmin] No user found');
      return false;
    }
    console.log('🔍 [isAdmin] Checking user:', { email: user.email, role: user.role });
    if (user.role === 'admin') {
      console.log('✅ [isAdmin] User is admin by role');
      return true;
    }
    const adminEmails = ['admin@kzstore.ao', 'admin@kzstore.com', 'geral@kzstore.com', 'geral@kzstore.ao'];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      console.log('✅ [isAdmin] User is admin by email');
      return true;
    }
    console.log('❌ [isAdmin] User is NOT admin');
    return false;
  }, [user]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    // Backwards compatibility
    login: signIn,
    logout: signOut,
    checkSession,
    updateUser,
    updatePassword,
    resetPassword,
    // OAuth
    signInWithGoogle,
    signInWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
