import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Expand, UserRound, X } from 'lucide-react';
import Modal from '../modal/Modal';
import styles from './style.module.css';

function PhotoImage({ src, enlarged = false }: { src: string; enlarged?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={enlarged ? styles.preview : styles.thumbnail}>
      {src && !failed && (
        <img src={src} alt={enlarged ? 'Foto do aluno ampliada' : ''}
          className={loaded ? styles.loaded : styles.loading}
          onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      )}
      {(!src || failed || !loaded) && (
        <div className={styles.placeholder}>
          <UserRound size={enlarged ? 64 : 52} aria-hidden="true" />
          {enlarged && <p role="status">{!src ? 'Nenhuma foto aprovada disponível para ampliar.' : failed ? 'Não foi possível carregar sua foto.' : 'Carregando foto...'}</p>}
        </div>
      )}
    </div>
  );
}

export default function StudentPhoto({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={styles.trigger} aria-label="Ampliar foto"
        aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <PhotoImage key={src} src={src || '/perfil_default.png'} />
        <span className={styles.hint} aria-hidden="true"><Expand size={16} /></span>
      </button>
      {open && (
        <Modal label="Sua foto" onClose={() => setOpen(false)}>
          <div className={styles.header}>
            <h2>Sua foto</h2>
            <button type="button" className={styles.close} aria-label="Fechar visualização da foto" onClick={() => setOpen(false)} autoFocus><X size={22} aria-hidden="true" /></button>
          </div>
          <PhotoImage key={src} src={src} enlarged />
          <Link className={styles.changePhoto} to="/UploadImage"><Camera size={20} aria-hidden="true" />Alterar foto</Link>
        </Modal>
      )}
    </>
  );
}
