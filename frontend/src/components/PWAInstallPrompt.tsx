import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Listener para o prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Só mostra se não foi dismissado e não está instalado
      if (!localStorage.getItem('pwa-dismissed') && !window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallPrompt(true);
      }
    };

    // Listener para mudanças de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listener para app instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado!');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker - Verificar atualizações
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Resultado da instalação:', outcome);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Status de Conectividade */}
      {!isOnline && (
        <div className="fixed top-16 left-4 right-4 z-50 animate-slide-down">
          <Card className="bg-orange-600/95 backdrop-blur-sm border-orange-500/50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3 text-white">
                <WifiOff className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Modo Offline</p>
                  <p className="text-sm opacity-90">Você está navegando sem conexão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt de Instalação PWA */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500/50 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">Instalar DeepSurf</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Adicione à sua tela inicial para acesso rápido e notificações de condições!
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleInstallClick}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Instalar
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="text-white border-white/30 hover:bg-white/10"
                      size="sm"
                    >
                      Agora não
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt de Atualização */}
      {showUpdatePrompt && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <Card className="bg-green-600/95 backdrop-blur-sm border-green-500/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Nova versão disponível!</p>
                  <p className="text-sm text-green-100">Atualize para acessar as últimas funcionalidades</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdate}
                    className="bg-white text-green-600 hover:bg-green-50"
                    size="sm"
                  >
                    Atualizar
                  </Button>
                  <Button
                    onClick={() => setShowUpdatePrompt(false)}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicador de Status Online */}
      {isOnline && (
        <div className="fixed top-4 right-4 z-40">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
