import styles from './style.module.css';

interface CardProps {
  period: string;   
  admission: string;
  dueDate: string;  
  status: string;
}

export default function CardMatriculaInfo({ period, admission, dueDate, status }: CardProps) {
  const isAtivo = status === 'ATIVO' && new Date(dueDate) > new Date();

  return (
    <div className={styles.containerCard}>
      <h2 className={styles.title}>Dados da matrícula</h2>
      
      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Período</span>
        <span className={styles.textTuplasResult}>{period}</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Semestre de Ingresso</span>
        <span className={styles.textTuplasResult}>{admission}</span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Validade da carteirinha</span>
        <span className={isAtivo ? styles.textTuplasDataAtiva : styles.textTuplasDataInativa}>
          {new Date(dueDate).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div className={styles.containerTuplas}>
        <span className={styles.textTuplas}>Tipo</span>
        <span className={styles.textTuplasResult}>Tecnólogo</span>
      </div>
    </div>
  );
}