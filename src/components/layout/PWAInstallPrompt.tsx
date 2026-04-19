import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);

    // If it's iOS and not in standalone mode, show instructions after a short delay
    if (isIOSDevice && !isStandalone) {
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="bg-bento-panel border border-bento-accent/30 shadow-2xl rounded-2xl p-4 backdrop-blur-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-bento-dim hover:text-bento-text"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-bento-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-bento-accent/20">
            <Download className="text-bento-bg w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-bento-text">Instalar MusicFlow</h3>
            <p className="text-[11px] text-bento-dim leading-tight">
              {isIOS ? 'Añade la app a tu pantalla de inicio para una mejor experiencia.' : 'Descarga nuestra aplicación móvil para escuchar sin limites.'}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-bento-bg/50 rounded-lg p-3 border border-bento-border">
            <p className="text-[10px] text-bento-text flex items-center flex-wrap gap-1">
              Toca el botón <Share className="w-3 h-3 text-blue-500" /> en tu navegador y luego selecciona <span className="font-bold">"Añadir a pantalla de inicio"</span>.
            </p>
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            <button 
              onClick={handleInstallClick}
              className="flex-1 bg-bento-accent text-bento-bg font-bold py-2 rounded-lg text-xs hover:scale-[1.02] transition-transform"
            >
              Instalar Ahora
            </button>
            <button 
              onClick={dismissPrompt}
              className="flex-1 bg-bento-hover text-bento-text font-semibold py-2 rounded-lg text-xs border border-bento-border transition-colors"
            >
              Más tarde
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
