import { getAttendanceQrPreview, type ScanResponse } from './scanAttendance';
export type PendingPresence = { requestId: string; accountId: string; reference: string; scannedAt: string; state: string; locationRequired?: boolean; title?: string; eventId?: string; result?: ScanResponse; message?: string; nextAt?: number };
type Control = { accountId: string; expiresAt: number; generation: string };
declare global { var presenceQueue: { list(): Promise<PendingPresence[]>; put(value: PendingPresence): Promise<unknown>; control(): Promise<Control | null>; authorize(value: Control | null): Promise<unknown>; flush(): Promise<void>; request(path: string, body: unknown): Promise<unknown> }; }
export function currentAccount(): string | null {
  try { const token = localStorage.getItem('token'); if (!token) return null; const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return typeof claims.accountId === 'string' && claims.role === 'student' ? claims.accountId : null; } catch { return null; }
}
let sessionStopped = false;
let sessionEpoch = 0;
let preparation: Promise<void> | undefined;
export function prepareOfflineSession(): Promise<void> {
  if (!preparation) preparation = prepareSession().finally(() => { preparation = undefined; });
  return preparation;
}
async function prepareSession() {
  if (sessionStopped) return;
  const epoch = sessionEpoch;
  const accountId = currentAccount();
  if (!accountId) { await presenceQueue.authorize(null); return; }
  const active = await presenceQueue.control();
  if (active && active.accountId !== accountId) await presenceQueue.authorize(null);
  if (!navigator.onLine) return;
  if (active?.accountId === accountId && active.expiresAt > Date.now() + 120000) return;
  const token = localStorage.getItem('token');
  const response = await fetch('/api/attendances/offline/session', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(15000) });
  if (sessionStopped || epoch !== sessionEpoch || localStorage.getItem('token') !== token || currentAccount() !== accountId) return;
  if (!response.ok) { await presenceQueue.authorize(null); if ([401,403].includes(response.status)) for (const item of await presenceQueue.list()) if (item.accountId === accountId && !['confirmed','rejected','choice'].includes(item.state)) await presenceQueue.put({ ...item, state: 'login' }); return; }
  const data = await response.json();
  if (sessionStopped || epoch !== sessionEpoch || localStorage.getItem('token') !== token || currentAccount() !== accountId || data.accountId !== accountId) { await presenceQueue.authorize(null); return; }
  await presenceQueue.authorize({ accountId, expiresAt: Date.parse(data.expiresAt), generation: crypto.randomUUID() });
  navigator.serviceWorker?.controller?.postMessage({ type: 'presence-resume' });
  for (const item of await presenceQueue.list()) if (item.accountId === accountId && item.state === 'login') await presenceQueue.put({ ...item, state: 'waiting' });
}
export async function activateOfflineSession() {
  sessionEpoch++;
  sessionStopped = false;
  await preparation?.catch(() => undefined);
  await prepareOfflineSession();
}
export async function stopOfflineSession() {
  sessionStopped = true;
  sessionEpoch++;
  try { navigator.serviceWorker?.controller?.postMessage({ type: 'presence-stop' }); } catch { /* Storage or worker access can be unavailable in private browsing. */ }
  try { await presenceQueue.authorize(null); } catch {
    // Stop the worker even when this document cannot write IndexedDB.
    try {
      const registrations = await navigator.serviceWorker?.getRegistrations() || [];
      await Promise.allSettled(registrations.map(async registration => { registration.active?.postMessage({ type: 'presence-stop' }); await registration.unregister(); }));
    } catch { /* Authentication cleanup must remain possible when browser storage is denied. */ }
  }
  try { await presenceQueue.request('revoke', {}); } catch { /* Remote cookie expires; local worker authorization remains disabled. */ }
}
export async function captureReference(reference: string, awaitChoice = false): Promise<PendingPresence> {
  const accountId = currentAccount(); if (!accountId) throw new Error('Entre novamente para guardar sua tentativa. No primeiro acesso sem rede, procure a organização.');
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(reference)) throw new Error('Link de presença inválido.');
  const existing = (await presenceQueue.list()).filter(i => i.accountId === accountId && i.reference === reference).sort((a, b) => Date.parse(b.scannedAt) - Date.parse(a.scannedAt))[0];
  if (existing && !(existing.state === 'rejected' && reference.startsWith('ev_'))) {
    if (!awaitChoice && existing.state === 'choice') { const activated = { ...existing, state: 'waiting' }; await presenceQueue.put(activated); return activated; }
    return existing;
  }
  const item: PendingPresence = { requestId: crypto.randomUUID(), accountId, reference, scannedAt: new Date().toISOString(), state: awaitChoice ? 'choice' : 'waiting' };
  await presenceQueue.put(item); return item;
}
export async function resumePresence() {
  if (document.hidden) return;
  await prepareOfflineSession();
  const accountId = currentAccount(); if (!accountId) return;
  // Resolve unknown event policy online; never assume missing metadata means no GPS.
  for (const item of await presenceQueue.list()) {
    if (item.accountId !== accountId || ['confirmed','rejected','choice'].includes(item.state) || item.locationRequired !== undefined) continue;
    try {
      const preview = await getAttendanceQrPreview(item.reference);
      if (preview.available === false) { await presenceQueue.put({ ...item, state: 'rejected', message: 'O registro de presença está fechado. Aguarde a liberação e leia o QR novamente.' }); continue; }
      await presenceQueue.put({ ...item, locationRequired: preview.locationRequired === false ? false : true, title: preview.event.title, eventId: preview.event.id, state: preview.locationRequired === false ? 'waiting' : 'gps' });
    } catch (error) {
      const e = error as { status?: string; message?: string };
      if (Number(e.status) >= 400 && Number(e.status) < 500 && ![408,429].includes(Number(e.status))) await presenceQueue.put({ ...item, state: e.status === '401' ? 'login' : 'rejected', message: e.message });
    }
  }
  await presenceQueue.flush();
  if ('serviceWorker' in navigator && (await presenceQueue.list()).some(i => i.accountId === accountId && i.locationRequired !== true && ['waiting','unknown','checking','submitting'].includes(i.state))) {
    const registration = await navigator.serviceWorker.ready;
    const sync = (registration as ServiceWorkerRegistration & { sync?: { register(tag: string): Promise<void> } }).sync;
    await sync?.register('student-presence').catch(() => undefined);
  }
}
export const presenceMessage = (item: PendingPresence): string => ({ choice: 'Leitura salva. Escolha o perfil de estudante para autorizar o envio.', waiting: 'Sua tentativa foi salva neste aparelho. Aguardando conexão para enviar.', submitting: 'Enviando seu registro de presença…', checking: 'Conferindo se seu registro já foi recebido…', unknown: 'Conexão instável. Sua tentativa continua salva. Conferiremos o recebimento antes de tentar novamente.', gps: 'Volte à tela da presença para concluir sua localização com o aplicativo visível.', login: 'Entre novamente para concluir sua presença.', confirmed: item.result && (item.result.success ? item.result.type === 'CHECK_IN' : item.result.code === 'ALREADY_CHECKED_IN') ? 'Entrada confirmada pelo servidor.' : 'Presença confirmada pelo servidor.', rejected: item.message || 'O registro foi recusado. Procure a organização.' }[item.state] || 'Sua tentativa continua salva.');
