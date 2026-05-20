import styles from './style.module.css';

export interface Props {
  status: string;
  validade: Date|string;

}

export default function Badge({ status, validade }: Props) {
  const statusLower = status?.toLowerCase() || "";
  
  const parseValidade = (val: Date | string) => {
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'string' && val.includes('/')) {
      const [day, month, year] = val.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    }
    return new Date(val).getTime();
  };

  const validadeTime = parseValidade(validade);
  const agoraTime = new Date().getTime();

  const isAtiva = (statusLower.includes("curso") || statusLower.includes("ativo")) && validadeTime > agoraTime;

  return (
    <div className={isAtiva ? styles.containerBadgeAtiva : styles.containerBadgeInativa}>
      <div className={isAtiva ? styles.pontoAtiva : styles.pontoInativa} />
      <span className={isAtiva ? styles.textAtiva : styles.textInativa}>
        Matrícula: {isAtiva ? 'Em curso' : 'Inativa'}
      </span>
    </div>
  );
}

// export default function Badge({ status, validade }: Props) {
//   const validadeTime = new Date(validade).getTime();
//   const agoraTime = new Date().getTime();

//   const isAtiva = status === 'Em curso' && validadeTime > agoraTime;

//   return (
//     <div className={isAtiva ? styles.containerBadgeAtiva : styles.containerBadgeInativa}>
//       <div className={isAtiva ? styles.pontoAtiva : styles.pontoInativa} />
//       <span className={isAtiva ? styles.textAtiva : styles.textInativa}>
//         Matrícula: {isAtiva ? 'Em curso' : 'Desistente'}
//       </span>
//     </div>
//   );
// }
