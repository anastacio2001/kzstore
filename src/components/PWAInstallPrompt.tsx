import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      const dismissedTime = parseInt(localStorage.getItem('pwa-install-dismissed-time') || '0');
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds of browsing
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-install-dismissed-time');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  // Don't show if installed or dismissed or no prompt available
  if (isInstalled || dismissed || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-2xl">
          <div className="px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1">
                  Instalar KZSTORE
                </h3>
                <p className="text-sm text-red-50 mb-3 leading-tight">
                  Adicione ao seu telefone para acesso rápido e experiência melhorada
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    className="flex-1 bg-white text-red-600 hover:bg-red-50 font-semibold shadow-lg"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar Agora
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-red-600/50 px-3"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Modal */}
      <div className="hidden md:block fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Instalar KZSTORE
              </h2>
              
              <p className="text-gray-600 leading-relaxed">
                Adicione ao seu computador para acesso mais rápido e uma experiência de compra melhorada
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Acesso rápido com um clique</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Funciona offline para navegação básica</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Notificações de promoções e pedidos</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Sem ocupar espaço no disco</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar Agora
              </Button>
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="px-6"
              >
                Agora Não
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Você pode desinstalar a qualquer momento
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
