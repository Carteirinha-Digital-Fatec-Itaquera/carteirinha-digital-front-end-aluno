import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocationNotice } from '../../hooks/useLocationNotice';
import { captureReference, currentAccount, presenceMessage, resumePresence, type PendingPresence } from '../../../api/attendance/offlinePresence';
import { confirmAttendanceReference, getAttendanceQrPreview } from '../../../api/attendance/scanAttendance';
import { responseFeedback } from '../scanner/scanFeedback';
import ScanResultCard from '../scanner/ScanResultCard';
import EventsPageLayout from '../events/EventsPageLayout';
import styles from './PresencaConfirmacaoScreen.module.css';
export default function PresencaConfirmacaoScreen() {
  const { reference } = useParams<{ reference: string }>();
  const { confirmLocation, locationNotice } = useLocationNotice();
  const [item, setItem] = useState<PendingPresence | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    const refresh = async () => { try { const value = (await presenceQueue.list()).find(i => i.accountId === currentAccount() && i.reference === reference); if (alive && value) setItem(value); } catch { /* Initial capture displays failure. */ } };
    void (async () => { try { if (!reference) throw new Error('Link inválido.'); const value = await captureReference(reference); if (alive) setItem(value); await resumePresence(); await refresh(); } catch (e) { if (alive) setError(e instanceof Error ? e.message : 'Não foi possível salvar neste aparelho. Mantenha a tela aberta e procure a organização.'); } })();
    const timer = setInterval(refresh, 1000); return () => { alive = false; clearInterval(timer); };
  }, [reference]);
  const finishGps = async () => {
    if (!item || busy || document.hidden) return;
    setBusy(true); setError('');
    try {
      const preview = await getAttendanceQrPreview(item.reference);
      const result = await confirmAttendanceReference(item.reference, undefined, preview.locationRequired !== false, confirmLocation);
      await presenceQueue.put({ ...item, state: 'confirmed', result, eventId: preview.event.id });
    } catch (e) {
      const failure = e as { code?: string; message?: string; status?: string };
      if (failure.code === 'LOCATION_CANCELLED') return;
      const rejected = Number(failure.status) >= 400 && !['LOCATION_REQUIRED','PERMISSION_DENIED','LOCATION_UNAVAILABLE','TIMEOUT'].includes(failure.code || '');
      await presenceQueue.put({ ...item, state: rejected ? 'rejected' : 'gps', message: failure.message });
      setError(failure.message || 'Não conseguimos confirmar. Volte com conexão e localização disponíveis.');
    } finally { setBusy(false); }
  };
  const feedback = item?.result ? { ...responseFeedback(item.result), eventId: item.eventId } : null;
  return <EventsPageLayout title="Presença em evento" backTo="/eventos" backLabel="Voltar aos eventos"><div className={styles.container}>
    {feedback ? <ScanResultCard result={feedback} onRetry={() => window.location.assign('/eventos/scanner')} /> : <section className={styles.card}>
      <h2>{item?.title || 'Seu registro de presença'}</h2>
      <p role="status" aria-live="polite">{item ? presenceMessage(item) : error ? 'Tentativa não salva neste aparelho.' : 'Salvando sua tentativa de presença…'}</p>
      {error && <p role="alert">{error}</p>}
      <p>Mantenha o aplicativo aberto até aparecer a confirmação do servidor. Se sair, volte assim que conseguir conexão. O horário da leitura não garante aceitação após o encerramento.</p>
      {item?.state === 'gps' && <button className={styles.confirmButton} disabled={busy} onClick={finishGps}>{busy ? 'Obtendo localização e enviando…' : 'Concluir com localização atual'}</button>}
      {item?.state === 'login' && <Link to="/login" onClick={() => sessionStorage.setItem('returnUrl', `/p/${reference}/aluno`)}>Entrar novamente</Link>}
      <Link to="/eventos" className={styles.secondaryButton}>Voltar aos eventos</Link>
    </section>}
  </div>{locationNotice}</EventsPageLayout>;
}
