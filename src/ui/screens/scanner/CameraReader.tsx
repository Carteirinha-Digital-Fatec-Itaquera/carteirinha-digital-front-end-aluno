import { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { cameraErrorMessage } from './scanFeedback';
import styles from './style.module.css';

interface Props { onRead: (token: string) => void; }

export default function CameraReader({ onRead }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Solicitando acesso à câmera...');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let detected = false;
    const element = document.createElement('div');
    element.id = 'presence-camera-' + crypto.randomUUID();
    host.current?.append(element);
    let scanner: import('html5-qrcode').Html5Qrcode | undefined;
    const task = (async () => {
      try {
        if (!window.isSecureContext) throw new Error('HTTPS_REQUIRED');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('NotFoundError');
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
        if (cancelled) return;
        scanner = new Html5Qrcode(element.id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
        await scanner.start({ facingMode: 'environment' }, { fps: 15, disableFlip: true }, token => {
          if (cancelled || detected) return;
          detected = true;
          // Fechamento ocorre no cleanup; bloqueio impede o próximo frame de reenviar.
          onRead(token);
        }, () => { /* Frames sem QR são esperados. */ });
        if (!cancelled) { setReady(true); setStatus('Câmera ativa · posicione o QR na mira'); }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error && error.message === 'HTTPS_REQUIRED'
          ? 'Abra o aplicativo por HTTPS para permitir o uso da câmera.' : cameraErrorMessage(error));
      }
    })();
    return () => {
      cancelled = true;
      // Aguarda até uma permissão tardia: não deixa câmera aberta após navegação/StrictMode.
      void task.finally(async () => {
        try { if (scanner?.isScanning) await scanner.stop(); }
        catch { /* Garante liberação mesmo se o elemento já saiu do DOM. */ }
        finally {
          element.querySelectorAll('video').forEach(video => {
            const stream = video.srcObject;
            if (stream instanceof MediaStream) stream.getTracks().forEach(track => track.stop());
          });
          element.remove();
        }
      });
    };
  }, [onRead]);
  return <>
    <div className={styles.viewport}>
      <div className={styles.camera} ref={host} />
      {!ready && <div className={styles.cameraPlaceholder}><Camera size={40} aria-hidden="true" /></div>}
      <div className={styles.target} aria-hidden="true"><i /><i /><i /><i />{ready && <span className={styles.scanLine} />}</div>
    </div>
    <p className={styles.cameraStatus} role="status">{!ready && status.startsWith('Solicitando') && <LoaderCircle className={styles.spin} size={16} aria-hidden="true" />}{status}</p>
  </>;
}
