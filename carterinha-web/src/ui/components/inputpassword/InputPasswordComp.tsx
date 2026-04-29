import React, { useState } from "react";
import type { Dispatch, SetStateAction } from "react"
import { Eye, EyeOff } from "lucide-react"; 
import styles from "./style.module.css"; // Puxa do novo CSS

type InputPasswordProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
};

export const InputPasswordComp = ({ label, placeholder, value, onChangeText }: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputField}>
        <input
          className={styles.inputText}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
        />
        <button 
          onClick={() => setShowPassword(!showPassword)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
};