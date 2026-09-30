import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ScanFeedback } from './scanFeedback';
import styles from './style.module.css';

function time(value?: string | null) {
  return value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date(value)) : null;
}

export default function ScanResultCard({ result, onRetry }: { result: ScanFeedback; onRetry: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [result.title]);
  const Icon = result.tone === 'success' ? CheckCircle2 : result.tone === 'info' ? Info : XCircle;
  return <section className={`${styles.card} ${styles.result}`} aria-labelledby="scan-result-title">
    <div className={`${styles.resultIcon} ${styles[result.tone]}`}><Icon size={40} aria-hidden="true" /></div>
    <span className={styles.eyebrow}>Registro de presença</span>
    <h2 id="scan-result-title" tabIndex={-1} ref={heading}>{result.title}</h2>
    {result.eventTitle && <p className={styles.eventTitle}>{result.eventTitle}</p>}
    <p role={result.tone === 'error' ? 'alert' : 'status'}>{result.message}</p>
    {(time(result.checkInAt) || time(result.checkOutAt)) && <dl className={styles.times}>
      {time(result.checkInAt) && <div><dt>Entrada</dt><dd>{time(result.checkInAt)}</dd></div>}
      {time(result.checkOutAt) && <div><dt>Saída</dt><dd>{time(result.checkOutAt)}</dd></div>}
    </dl>}
    <div className={styles.actions}>
      <Link className={styles.primary} to={result.login ? '/login' : '/eventos'}>{result.login ? 'Entrar novamente' : 'Voltar aos eventos'}</Link>
      {result.certificates && <Link className={styles.secondary} to="/certificados">Ver certificados</Link>}
      {result.tone === 'error' && !result.login && <Link className={styles.secondary} to="/eventos?aba=participacoes">Minhas participações</Link>}
      {!result.login && <button className={styles.secondary} type="button" onClick={onRetry}>Ler outro QR / Tentar novamente</button>}
    </div>
  </section>;
}
