import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { pwaManager } from '../utils/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(pwaManager.isInstalled());

    // Listen for install availability
    const handleInstallable = (e: Event) => {
      const customEvent = e as CustomEvent;
      setDeferredPrompt(customEvent.detail);
      
      // Show prompt after 30 seconds if not installed
      if (!pwaManager.isInstalled()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Listen for successful installation
    const handleInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    const accepted = await pwaManager.promptInstall(deferredPrompt);
    if (accepted) {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed in this session
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <>
      {/* Bottom Banner on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-2xl z-50 md:hidden animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur">
            <Smartphone className="size-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Instale o App KZSTORE</p>
            <p className="text-xs text-white/90">Acesso rápido e notificações</p>
          </div>
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
          >
            <Download className="size-4 mr-1" />
            Instalar
          </Button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Modal on Desktop */}
      <div className="hidden md:block">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-6" />
            </button>

            <div className="text-center mb-6">
              <div className="size-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Download className="size-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Instale o App KZSTORE
              </h3>
              <p className="text-gray-600">
                Tenha acesso rápido à nossa loja direto da sua tela inicial
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Acesso rápido sem abrir navegador</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Notificações de ofertas e promoções</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="size-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span>Funciona offline para visualizar produtos</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Agora Não
              </Button>
              <Button
                onClick={handleInstall}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Download className="size-4 mr-2" />
                Instalar App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
