import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react'; 

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); 

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); 
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt || !isVisible) return null; 

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999, 
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#FFFFFF',
      padding: '10px 20px',
      borderRadius: '30px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
      border: '2px solid #BA1A1A'
    }}>
      <button 
        onClick={handleInstallClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          color: '#BA1A1A',
          border: 'none',
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        <Download size={20} />
        <span>Instalar App</span>
      </button>

      {/* Linha divisória */}
      <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }} />

      {/* Botão de fechar (caso o usuário não queira instalar agora) */}
      <button 
        onClick={() => setIsVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
      >
        <X size={20} />
      </button>
    </div>
  );
};