import React from "react"
import style from "./style.module.css"
type ButtonProps = {
  text: string,
  color?: string,
  action: () => void,
}

export const ButtonComp = ({ text, color, action }: ButtonProps) => {
  return (
    <button 
      className={style.button} 
      style={color ? {backgroundColor: color} : undefined}
      onClick={action}>
      <span className={style.text}>{text}</span>
    </button>
  )
}