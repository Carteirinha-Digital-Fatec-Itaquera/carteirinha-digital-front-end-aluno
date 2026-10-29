import { useEffect, useState } from 'react';
import { currentAccount, presenceMessage, resumePresence, type PendingPresence } from '../../../api/attendance/offlinePresence';
import styles from './OfflinePresencePanel.module.css';
export default function OfflinePresencePanel() {
  const [items, setItems] = useState<PendingPresence[]>([]);
  useEffect(() => {
    let alive = true; let running = false;
    const refresh = async () => { try { const rows = await presenceQueue.list(); if (alive) setItems(rows.filter(i => i.accountId === currentAccount())); } catch { /* Capture screen reports storage failures. */ } };
    const resume = async () => { if (running || document.hidden) return; running = true; try { await resumePresence(); } catch { /* Retain queue on connection failure. */ } finally { running = false; await refresh(); } };
    void resume(); const timer = window.setInterval(() => { void resume(); }, 15000); const poll = window.setInterval(() => { void refresh(); }, 1000);
    window.addEventListener('online', resume); document.addEventListener('visibilitychange', resume); window.addEventListener('storage', resume);
    return () => { alive = false; clearInterval(timer); clearInterval(poll); window.removeEventListener('online', resume); document.removeEventListener('visibilitychange', resume); window.removeEventListener('storage', resume); };
  }, []);
  if (!items.length) return null;
  return <aside className={styles.panel} aria-label="Tentativas de presença salvas"><details><summary>Registros de presença neste aparelho ({items.length})</summary><p>Uma tentativa salva ainda precisa de confirmação do servidor. Mantenha ou volte ao aplicativo até confirmar.</p><ul>{items.map(item => <li key={item.requestId}><a href={`/p/${item.reference}/aluno`}>{item.title || 'Presença lida no evento'}</a><p>{presenceMessage(item)}</p></li>)}</ul><p>Sem GPS, o envio em segundo plano será tentado quando o navegador permitir. Fechar o aplicativo não garante o envio.</p></details></aside>;
}
