import { useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { cameraErrorMessage } from './scanFeedback';
import styles from './style.module.css';

interface Props { onRead: (token: string) => void; }

interface ZoomCapabilities {
  min: number;
  max: number;
  step: number;
}

export default function CameraReader({ onRead }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Solicitando acesso à câmera...');
  const [ready, setReady] = useState(false);
  const [zoomCaps, setZoomCaps] = useState<ZoomCapabilities | null>(null);
  const [zoomValue, setZoomValue] = useState<number>(1);
  const runningTrackRef = useRef<MediaStreamTrack | null>(null);

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
        if (!cancelled) {
          setReady(true);
          setStatus('Câmera ativa · posicione o QR na mira');

          try {
            const video = element.querySelector('video');
            const stream = video?.srcObject as MediaStream | null;
            const track =
              stream?.getVideoTracks?.()[0] ??
              (typeof (scanner as any).getRunningTrack === 'function'
                ? (scanner as any).getRunningTrack()
                : null);

            if (track && typeof track.getCapabilities === 'function') {
              const caps = track.getCapabilities() as { zoom?: { min: number; max: number; step: number } };
              if (caps && caps.zoom && typeof caps.zoom.min === 'number' && typeof caps.zoom.max === 'number') {
                runningTrackRef.current = track;
                setZoomCaps({
                  min: caps.zoom.min,
                  max: caps.zoom.max,
                  step: caps.zoom.step || 0.1,
                });
                const settings = (typeof track.getSettings === 'function' ? track.getSettings() : null) as { zoom?: number } | null;
                setZoomValue(settings?.zoom ?? caps.zoom.min);
              }
            }
          } catch {
            // Zoom não suportado
          }
        }
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error && error.message === 'HTTPS_REQUIRED'
          ? 'Abra o aplicativo por HTTPS para permitir o uso da câmera.' : cameraErrorMessage(error));
      }
    })();
    return () => {
      cancelled = true;
      runningTrackRef.current = null;
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

  const applyZoom = async (val: number) => {
    if (!runningTrackRef.current || !zoomCaps) return;
    const clamped = Math.min(zoomCaps.max, Math.max(zoomCaps.min, val));
    try {
      await (runningTrackRef.current as any).applyConstraints({
        advanced: [{ zoom: clamped }],
      });
      setZoomValue(clamped);
    } catch {
      // Ignora erro se rejeitado pelo SO
    }
  };

  return <>
    <div className={styles.viewport}>
      <div className={styles.camera} ref={host} />
      {!ready && <div className={styles.cameraPlaceholder}><Camera size={40} aria-hidden="true" /></div>}
      <div className={styles.target} aria-hidden="true"><i /><i /><i /><i />{ready && <span className={styles.scanLine} />}</div>
    </div>
    {zoomCaps && ready && (
      <div className={styles.zoomControls} role="group" aria-label="Controle de zoom da câmera">
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => applyZoom(zoomValue - (zoomCaps.step * 5 || 0.5))}
          disabled={zoomValue <= zoomCaps.min}
          aria-label="Diminuir zoom"
        >
          −
        </button>
        <div className={styles.zoomSliderContainer}>
          <input
            type="range"
            min={zoomCaps.min}
            max={zoomCaps.max}
            step={zoomCaps.step}
            value={zoomValue}
            onChange={(e) => applyZoom(parseFloat(e.target.value))}
            aria-label="Ajustar zoom"
          />
          <span className={styles.zoomLabel}>{zoomValue.toFixed(1)}x</span>
        </div>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={() => applyZoom(zoomValue + (zoomCaps.step * 5 || 0.5))}
          disabled={zoomValue >= zoomCaps.max}
          aria-label="Aumentar zoom"
        >
          +
        </button>
        <div className={styles.zoomPresets}>
          {[1, 2, 3].filter(z => z >= zoomCaps.min && z <= zoomCaps.max).map(z => (
            <button
              key={z}
              type="button"
              className={`${styles.zoomPresetButton} ${Math.abs(zoomValue - z) < 0.2 ? styles.zoomPresetActive : ''}`}
              onClick={() => applyZoom(z)}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>
    )}
    <p className={styles.cameraStatus} role="status">{!ready && status.startsWith('Solicitando') && <LoaderCircle className={styles.spin} size={16} aria-hidden="true" />}{status}</p>
  </>;
}
