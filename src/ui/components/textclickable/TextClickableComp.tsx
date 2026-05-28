import styles from "./style.module.css";

type TextClickableProps = {
  text: string,
  fontColor?: string,
  action: () => void,
  alignSelf?: string 
}

export const TextClickableComp = ({ text, fontColor = "#333333", action, alignSelf = "center" }: TextClickableProps) => {
  return (
    <button 
      className={styles.container}
      onClick={action}
      style={{ alignSelf: alignSelf }} 
    >
      <span 
        className={styles.text} 
        style={{ color: fontColor }} 
      >
        {text}
      </span>
    </button>
  )
}