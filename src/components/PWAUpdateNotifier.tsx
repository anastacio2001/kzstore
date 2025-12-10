import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function PWAUpdateNotifier() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      console.log('[PWA] New service worker activated, reloading...');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) return;

        // Check for updates immediately
        registration.update();

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (!newWorker) return;

          console.log('[PWA] New service worker found, installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker installed, waiting to activate');
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
              
              toast.info('Nova versão disponível!', {
                description: 'Atualize para obter os recursos mais recentes',
                duration: Infinity,
                action: {
                  label: 'Atualizar',
                  onClick: () => handleUpdate()
                }
              });
            }
          });
        });

        // Check periodically (every 1 hour)
        const interval = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('[PWA] Error checking for updates:', error);
      }
    };

    checkForUpdates();

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    // Tell the waiting service worker to skip waiting and activate
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    setShowUpdatePrompt(false);
    
    toast.success('Atualizando...', {
      description: 'A página será recarregada em instantes'
    });
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    toast.dismiss();
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              Nova Versão Disponível
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Atualize agora para obter melhorias e novos recursos
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Atualizar Agora
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-600"
              >
                Depois
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
