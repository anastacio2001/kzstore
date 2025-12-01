import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface SocialLoginProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

export function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const [loadingFb, setLoadingFb] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleFacebookLogin = () => {
    setLoadingFb(true);
    
    // Inicializar Facebook SDK
    if (!(window as any).FB) {
      // Carregar SDK do Facebook
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId: '1126992036171396',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Carregar script do Facebook
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        loginWithFacebook();
      };
    } else {
      loginWithFacebook();
    }
  };

  const loginWithFacebook = () => {
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Enviar token para backend
        fetch('/api/auth/oauth/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            onSuccess(data.token, data.user);
          } else {
            onError(data.error || 'Erro ao fazer login com Facebook');
          }
        })
        .catch(() => {
          onError('Erro ao processar login com Facebook');
        })
        .finally(() => {
          setLoadingFb(false);
        });
      } else {
        setLoadingFb(false);
        onError('Login com Facebook cancelado');
      }
    }, { scope: 'public_profile,email' });
  };

  const handleGoogleLogin = () => {
    setLoadingGoogle(true);

    // Inicializar Google SDK
    if (!(window as any).google) {
      // Carregar SDK do Google
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        initGoogleLogin();
      };
    } else {
      initGoogleLogin();
    }
  };

  const initGoogleLogin = () => {
    // IMPORTANTE: Configure o Google Client ID no Google Cloud Console
    // https://console.cloud.google.com/apis/credentials
    // Por enquanto, mostrar mensagem ao usuário
    const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
    
    if (!GOOGLE_CLIENT_ID) {
      setLoadingGoogle(false);
      onError('Google Login não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env');
      return;
    }
    
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse
    });

    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setLoadingGoogle(false);
        onError('Login com Google cancelado');
      }
    });
  };

  const handleGoogleResponse = (response: any) => {
    const idToken = response.credential;

    fetch('/api/auth/oauth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        onSuccess(data.token, data.user);
      } else {
        onError(data.error || 'Erro ao fazer login com Google');
      }
    })
    .catch(() => {
      onError('Erro ao processar login com Google');
    })
    .finally(() => {
      setLoadingGoogle(false);
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continue com</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleFacebookLogin}
        disabled={loadingFb || loadingGoogle}
      >
        {loadingFb ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        Facebook
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loadingFb || loadingGoogle}
      >
        {loadingGoogle ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Google
      </Button>
    </div>
  );
}
