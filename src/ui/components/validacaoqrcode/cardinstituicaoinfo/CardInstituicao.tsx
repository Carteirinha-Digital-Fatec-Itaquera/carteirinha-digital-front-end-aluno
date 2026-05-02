// import styles from './style.module.css';

import styles from './style.module.css'

export default function CardInfoInstituicao() {
  return (
    <div className={styles.containerCardInstituicao}>
      <h2 className={styles.titleInstituicao}>Instituição</h2>
      
      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Faculdade</span>
        <span className={styles.textTuplasResult}>Fatec Itaquera Prof. Miguel Reale</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Diretor</span>
        <span className={styles.textTuplasResult}>Luis Carlos Barbosa de Oliveira</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Endereço</span>
        <div className={styles.containerEndereco}>
          <span className={styles.textTuplasResult}>
            Av. Miguel Ignácio Curi, 360 - Vila Carmosina - Itaquera
          </span>
        </div>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Telefone</span>
        <span className={styles.textTuplasResult}>(11) 2056-4347 / 2056-4245</span>
      </div>
    </div>
  );
}