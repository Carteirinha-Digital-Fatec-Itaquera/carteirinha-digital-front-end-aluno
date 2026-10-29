import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './PresenceScannerShortcut.module.css';
export default function PresenceScannerShortcut() {
  const navigate = useNavigate();
  return <section className={styles.shortcut} aria-label="Leitor de presença em eventos">
    <button type="button" onClick={() => navigate('/eventos/scanner', { state: { openCamera: true } })}><Camera size={22} aria-hidden="true" />Abrir câmera para registrar presença</button>
    <p>Escaneie aqui o QR Code da palestra. Sem conexão, o registro aguarda confirmação do servidor.</p>
  </section>;
}
