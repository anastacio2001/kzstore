import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
  phone?: string;
  avatar?: string;
  access_token?: string;
  // Campos para checkout
  nome?: string;
  telefone?: string;
  endereco?: string;
};

type SignUpData = {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'customer',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
          phone: session.user.user_metadata?.phone,
          avatar: session.user.user_metadata?.avatar_url,
          access_token: session.access_token,
          // Campos para checkout
          nome: session.user.user_metadata?.name || session.user.user_metadata?.nome,
          telefone: session.user.user_metadata?.phone || session.user.user_metadata?.telefone,
          endereco: session.user.user_metadata?.endereco
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'customer',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
          phone: session.user.user_metadata?.phone,
          avatar: session.user.user_metadata?.avatar_url,
          access_token: session.access_token,
          // Campos para checkout
          nome: session.user.user_metadata?.name || session.user.user_metadata?.nome,
          telefone: session.user.user_metadata?.phone || session.user.user_metadata?.telefone,
          endereco: session.user.user_metadata?.endereco
        };
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback para credenciais demo apenas se o usuário não existir no Supabase
        if (email === 'admin@kzstore.ao' && password === 'kzstore2024') {
          const demoUser: User = {
            id: 'demo-admin',
            email: 'admin@kzstore.ao',
            role: 'admin',
            name: 'Administrador Demo'
          };
          setUser(demoUser);
          setIsAuthenticated(true);
          localStorage.setItem('kzstore_demo_user', JSON.stringify(demoUser));
          return;
        }
        
        throw new Error(error.message);
      }

      // User state will be updated by onAuthStateChange listener
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async ({ email, password, nome, telefone }: SignUpData): Promise<void> => {
    try {
      console.log('🔵 [useAuth] Starting signup...', { email, nome, telefone });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: nome,
            phone: telefone,
            role: 'customer'
          }
        }
      });

      console.log('🔵 [useAuth] Signup response:', { data, error });

      if (error) {
        console.error('❌ [useAuth] Signup error:', error);
        throw new Error(error.message);
      }

      console.log('✅ [useAuth] Signup successful!', data.user?.email);
      
      // User state will be updated by onAuthStateChange listener
    } catch (error: any) {
      console.error('❌ [useAuth] Signup failed:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw new Error(error.message);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithFacebook = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw new Error(error.message);
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('kzstore_demo_user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: { name?: string; phone?: string; endereco?: string }): Promise<void> => {
    try {
      console.log('🔵 [useAuth] Updating user metadata:', userData);
      
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone: userData.phone,
          endereco: userData.endereco,
          // Keep existing role
          role: user?.role || 'customer'
        }
      });

      if (error) {
        console.error('❌ [useAuth] Update error:', error);
        throw new Error(error.message);
      }

      console.log('✅ [useAuth] User updated successfully!');
      
      // Update local user state
      if (data.user) {
        const updatedUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'customer',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
          phone: data.user.user_metadata?.phone,
          avatar: data.user.user_metadata?.avatar_url,
          access_token: user?.access_token,
          nome: data.user.user_metadata?.name || data.user.user_metadata?.nome,
          telefone: data.user.user_metadata?.phone || data.user.user_metadata?.telefone,
          endereco: data.user.user_metadata?.endereco
        };
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('❌ [useAuth] Update failed:', error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      console.log('🔵 [useAuth] Updating password...');
      
      // First verify current password by signing in
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (signInError) {
          throw new Error('Senha atual incorreta');
        }
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ [useAuth] Password update error:', error);
        throw new Error(error.message);
      }

      console.log('✅ [useAuth] Password updated successfully!');
    } catch (error: any) {
      console.error('❌ [useAuth] Password update failed:', error);
      throw error;
    }
  };

  // Legacy methods for backwards compatibility
  const login = signIn;
  const logout = signOut;

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    login, // legacy
    logout, // legacy
    checkSession,
    updateUser,
    updatePassword
  };
}