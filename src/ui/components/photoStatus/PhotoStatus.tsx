import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheckBig, Clock, CircleX, Info, X } from 'lucide-react';
import type { PhotoStatusType } from '../../../domains/Student';
import styles from './style.module.css';

export type PhotoStatusAvailability = 'loading' | 'ready' | 'unavailable';
const statuses = {
  PENDING: { title: 'Foto em análise', message: 'Sua fotografia foi enviada e está aguardando análise da Secretaria.', Icon: Clock, tone: 'pending' },
  APPROVED: { title: 'Foto aprovada', message: 'Sua fotografia foi aprovada pela Secretaria.', Icon: CircleCheckBig, tone: 'approved' },
  REJECTED: { title: 'Foto reprovada', message: 'Sua fotografia não foi aprovada. Envie uma nova foto para análise.', Icon: CircleX, tone: 'rejected' },
} as const;

export default function PhotoStatus({ status, availability, studentKey }: { status?: PhotoStatusType; availability: PhotoStatusAvailability; studentKey?: string }) {
  const storageKey = studentKey ? `@Carteirinha:approvedPhotoNotice:${encodeURIComponent(studentKey)}` : undefined;
  const [dismissedKey, setDismissedKey] = useState<string | undefined | null>(null);

  // Uma nova foto em análise ou reprovada confirma um novo ciclo: a próxima
  // aprovação deve voltar a aparecer, mesmo que o aviso anterior tenha sido fechado.
  useEffect(() => {
    if (availability !== 'ready' || !storageKey || (status !== 'PENDING' && status !== 'REJECTED')) return;
    try { localStorage.removeItem(storageKey); } catch { /* Armazenamento indisponível. */ }
  }, [availability, status, storageKey]);

  let savedDismissal = false;
  if (storageKey) {
    try { savedDismissal = localStorage.getItem(storageKey) === '1'; } catch { /* Armazenamento indisponível: fechamento apenas nesta montagem. */ }
  }
  const dismissApproval = () => {
    setDismissedKey(storageKey);
    if (storageKey) {
      try { localStorage.setItem(storageKey, '1'); } catch { /* Não impede o fechamento visual. */ }
    }
  };
  // Cache e sucesso do upload não confirmam o estado atual da análise.
  if (availability === 'loading') return null;
  const current = availability === 'ready' && (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') ? statuses[status] : null;
  if (availability === 'ready' && !current) return null;
  if (current && status === 'APPROVED' && (savedDismissal || dismissedKey === storageKey)) return null;
  const Icon = current?.Icon ?? Info;
  return (
    <section className={`${styles.card} ${current ? styles[current.tone] : styles.neutral} ${current && status === 'APPROVED' ? styles.dismissible : ''}`} aria-label="Situação da fotografia">
      <Icon size={22} aria-hidden="true" className={styles.icon} />
      <div>
        <div role="status" aria-live="polite">
          <h2>{current?.title ?? 'Status da foto indisponível'}</h2>
          <p>{current?.message ?? 'Não foi possível confirmar a situação atual. Verifique sua conexão e acesse esta tela novamente.'}</p>
        </div>
        {current && status === 'REJECTED' && <Link to="/UploadImage" className={styles.action}>Enviar nova foto</Link>}
      </div>
      {current && status === 'APPROVED' && (
        <button type="button" className={styles.dismiss} aria-label="Fechar aviso de foto aprovada" onClick={dismissApproval}>
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
