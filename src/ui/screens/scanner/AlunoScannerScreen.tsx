import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, ScanLine, ShieldCheck } from 'lucide-react';
import { scanAttendance, getScanAttendance, presenceEventId } from '../../../api/attendance/scanAttendance';
import EventsPageLayout from '../events/EventsPageLayout';
import eventStyles from '../events/style.module.css';
import CameraReader from './CameraReader';
import ScanResultCard from './ScanResultCard';
import { errorFeedback, responseFeedback } from './scanFeedback';
import type { ScanFeedback } from './scanFeedback';
import styles from './style.module.css';

export default function AlunoScannerScreen() {
  const [camera, setCamera] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [result, setResult] = useState<ScanFeedback | null>(null);
  const [desktop, setDesktop] = useState(false);
  const locked = useRef(false);
  const request = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener('change', update);
    const hide = () => { if (document.hidden) setCamera(false); };
    document.addEventListener('visibilitychange', hide);
    return () => {
      alive.current = false;
      request.current?.abort();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);

  const read = useCallback((raw: string) => {
    if (locked.current || !alive.current) return;
    locked.current = true;
    setCamera(false); setBusy(true); setToken('');
    try { navigator.vibrate?.(80); } catch { /* Haptics opcionais. */ }
    const qrToken = raw.trim();
    const controller = new AbortController();
    request.current = controller;
    const isCurrent = () => alive.current && request.current === controller;
    const timer = window.setTimeout(() => controller.abort(), 12000);
    void (async () => {
      try {
        const data = await scanAttendance(qrToken, controller.signal);
        if (!isCurrent()) return;
        if (controller.signal.aborted) throw new Error("Timeout");
        const feedback = responseFeedback(data);
        setResult(feedback); setBusy(false);
        const eventId = presenceEventId(qrToken);
        if (eventId && (feedback.certificates || !data.success)) {
          try {
            const attendance = await getScanAttendance(eventId, controller.signal);
            if (attendance && isCurrent() && !controller.signal.aborted) setResult({ ...feedback,
              checkInAt: attendance.checkInAt, checkOutAt: attendance.checkOutAt });
          } catch { /* Sucesso do scan permanece válido se detalhes falharem. */ }
        }
      } catch (error) {
        if (isCurrent()) setResult(errorFeedback(error));
      } finally {
        window.clearTimeout(timer);
        if (isCurrent()) setBusy(false);
      }
    })();
  }, []);

  function retry() {
    request.current?.abort();
    request.current = null;
    locked.current = false; setResult(null); setBusy(false); setCamera(false); setToken('');
  }

  return <EventsPageLayout title="Registrar presença" backTo="/eventos" backLabel="Voltar aos eventos"
    subtitle="Aponte a câmera para o QR Code exibido na palestra e registre sua participação."
    icon={<ScanLine size={22} aria-hidden="true" />} className={eventStyles.eventsPage}>
    {result ? <ScanResultCard result={result} onRetry={retry} /> : <section className={styles.card} aria-busy={busy}>
      <div className={styles.cardHeading}><div><span className={styles.eyebrow}>Eventos & Palestras</span><h2>Escanear presença</h2></div><ScanLine size={24} aria-hidden="true" /></div>
      {busy ? <div className={styles.processing} role="status"><LoaderCircle size={40} className={styles.spin} aria-hidden="true" /><h3>Registrando presença...</h3><p>Aguarde a confirmação do servidor.</p></div> : <>
        {camera ? <CameraReader key={attempt} onRead={read} /> : <div className={styles.intro}><div className={styles.introIcon}><Camera size={36} aria-hidden="true" /></div><h3>Pronto para participar?</h3><p>Permita o acesso à câmera e enquadre o QR Code de presença da palestra.</p></div>}
        <button type="button" className={styles.primary} onClick={() => { setAttempt(value => value + 1); setCamera(true); }}><Camera size={18} aria-hidden="true" />{camera ? 'Reiniciar câmera' : 'Abrir câmera'}</button>
        {camera && <button type="button" className={styles.secondary} onClick={() => setCamera(false)}>Desligar câmera</button>}
        {(import.meta.env.DEV || desktop) && <details className={styles.manual} onToggle={event => { if (event.currentTarget.open) setCamera(false); }}>
          <summary>Usar token de teste</summary>
          <form onSubmit={event => { event.preventDefault(); read(token); }}>
            <label htmlFor="qr-token">Token de presença</label>
            <textarea id="qr-token" value={token} onChange={event => setToken(event.target.value)} maxLength={8192} autoComplete="off" spellCheck={false} rows={3} required />
            <p>O token será enviado à API real. Cole um token recém-gerado pela Secretaria.</p>
            <button type="submit" className={styles.secondary} disabled={!token.trim()}>Enviar token</button>
          </form>
        </details>}
      </>}
      <div className={styles.hint}><ShieldCheck size={20} aria-hidden="true" /><p>Use o QR de presença exibido no evento. Registre a entrada e lembre-se de registrar a saída ao final.</p></div>
    </section>}
  </EventsPageLayout>;
}
