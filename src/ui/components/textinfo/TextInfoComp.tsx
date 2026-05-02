import type { ReactNode } from "react";
import styles from "./style.module.css";

type TextInfoProps = {
  size?: number,
  children: ReactNode
}

export const TextInfoComp = ({ children, size = 18 }: TextInfoProps) => {
  return (
    <p 
      className={styles.text} 
      style={{ fontSize: `${size}px` }} /* Passamos o tamanho dinâmico pelo style inline */
    >
      {children}
    </p>
  )
}