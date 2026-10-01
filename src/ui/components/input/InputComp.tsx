import { useId } from 'react';
import type { Dispatch, SetStateAction } from "react";
import styles from "./style.module.css"; 

type InputProps = {
  label: string,
  placeholder: string,
  type?: string,
  value: string,
  onChangeText: Dispatch<SetStateAction<string>>,
}

export const InputComp = ({ label, placeholder, type = "text", value, onChangeText }: InputProps) => {
  const id = useId();
  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input id={id}
        className={styles.inputField}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
      />
    </div>
  )
}