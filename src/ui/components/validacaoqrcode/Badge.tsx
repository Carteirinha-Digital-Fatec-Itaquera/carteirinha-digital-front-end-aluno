import styles from './style.module.css';

export interface Props {
  status: string;
  validade: Date;
}

export default function Badge({ status, validade }: Props) {
  const isAtiva = status === 'Em curso' && validade > new Date();

  return (
    <div className={isAtiva ? styles.containerBadgeAtiva : styles.containerBadgeInativa}>
      <div className={isAtiva ? styles.pontoAtiva : styles.pontoInativa} />
      <span className={isAtiva ? styles.textAtiva : styles.textInativa}>
        {/* Matrícula {isAtiva ? 'Ativa' : 'Inativa'} */}
        Matrícula {isAtiva ? 'Em curso' : 'Desistente'}
      </span>
    </div>
  );
}