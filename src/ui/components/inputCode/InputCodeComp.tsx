import { useState, useRef, } from 'react';
import type {Dispatch, SetStateAction, ChangeEvent, KeyboardEvent } from 'react'
import styles from './style.module.css';

type InputCodeProps = {
  label: string,
  onChangeText: Dispatch<SetStateAction<string>>
}

export const InputCodeComp = ({ label, onChangeText }: InputCodeProps) => {
  const [codeParts, setCodeParts] = useState(['', '', '', '', '', '']);
  // O tipo muda de TextInput para HTMLInputElement na Web
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const text = e.target.value;
    // Garante que apenas o último caractere seja pego caso o navegador tente preencher
    const char = text.slice(-1); 

    const newCodeParts = [...codeParts];
    newCodeParts[index] = char;
    setCodeParts(newCodeParts);
    onChangeText(newCodeParts.join(''));

    // Pula para o próximo campo se um caractere foi digitado
    if (char !== '' && index < codeParts.length - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Volta para o campo anterior ao pressionar Backspace em um campo vazio
    if (e.key === 'Backspace' && codeParts[index] === '' && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.subcontainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric" // Abre o teclado numérico no celular
            pattern="[0-9]*"
            ref={(el) => { codeInputRefs.current[index] = el; }}
            className={styles.inputField}
            maxLength={1}
            value={codeParts[index]}
            onChange={(e) => handleCodeChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()} // Seleciona o texto ao focar (selectTextOnFocus)
          />
        ))}
      </div>
    </div>
  );
};