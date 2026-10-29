import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import styles from './style.module.css';

export default function QrReadingFeedback() {
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTakingLonger(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  return <div className={styles.readingFeedback} role="status" aria-live="polite" aria-atomic="true">
    <LoaderCircle size={32} className={styles.spin} aria-hidden="true" />
    <strong>Lendo QR Code...</strong>
    <p>QR Code detectado. Aguarde enquanto consultamos o evento e processamos sua leitura.</p>
    {takingLonger && <p>A conexão pode estar lenta. Mantenha esta tela aberta e aguarde o resultado antes de ler novamente.</p>}
  </div>;
}
