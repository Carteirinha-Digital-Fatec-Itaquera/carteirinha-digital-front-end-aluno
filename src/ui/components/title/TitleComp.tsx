import React from "react";
import { ArrowLeft } from "lucide-react"; // Substitui o AntDesign
import { SpacerComp } from "../spacer/SpacerComp";
import styles from "./style.module.css";

type TitleProps = {
  text: string,
  size?: number,
  showButton?: boolean,
  actionButton?: () => void
}

export const TitleComp = ({ text, size = 14, showButton = false, actionButton = () => { } }: TitleProps) => {
  return (
    <div className={styles.container}>
      {showButton && (
        <button className={styles.button} onClick={actionButton}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
      )}
      
      <div className={styles.titleContainer}>
        {/* Usamos o CSS Module, mas sobrescrevemos o tamanho da fonte dinamicamente */}
        <span className={styles.title} style={{ fontSize: `${size}px` }}>
          {text}
        </span>
        <div className={styles.divider} />
      </div>

      {showButton && (
        <SpacerComp horizontal={22} vertical={22} />
      )}
    </div>
  )
}