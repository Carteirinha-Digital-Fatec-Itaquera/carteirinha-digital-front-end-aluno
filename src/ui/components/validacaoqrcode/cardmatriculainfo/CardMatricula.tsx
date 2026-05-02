import styles from './style.module.css';

export interface Props {
  status: string;
  validade: Date;
}

export default function CardMatriculaInfo({ status, validade }: Props) {
  const isAtivo = status === 'Ativo' && validade > new Date();

  return (
    <div className={styles.containerCard}>
      <h2 className={styles.title}>Dados da matrícula</h2>
      
      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Período</span>
        <span className={styles.textTuplasResult}>Tarde</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Semestres</span>
        <span className={styles.textTuplasResult}>1º/2026</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Validade da carteirinha</span>
        <span className={isAtivo ? styles.textTuplasDataAtiva : styles.textTuplasDataInativa}>
          03/09/2026
        </span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Tipo</span>
        <span className={styles.textTuplasResult}>Tecnólogo</span>
      </div>
    </div>
  );
}