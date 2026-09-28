import { LoaderCircle, TriangleAlert } from 'lucide-react';
import styles from './style.module.css';

export function LoadingState({ text }: { text: string }) {
  return <div className={styles.message} role="status">
    <LoaderCircle aria-hidden="true" size={20} className={styles.loadingIcon} />{text}
  </div>;
}

export function ErrorState({ text, onRetry }: { text: string; onRetry: () => void }) {
  return <div className={styles.resourceError} role="alert">
    <TriangleAlert aria-hidden="true" size={20} />
    <p>{text}</p>
    <button type="button" onClick={onRetry}>Tentar novamente</button>
  </div>;
}
