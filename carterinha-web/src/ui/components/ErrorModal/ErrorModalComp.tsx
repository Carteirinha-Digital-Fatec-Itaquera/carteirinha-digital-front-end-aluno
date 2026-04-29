import React from 'react';
import { AlertCircle } from 'lucide-react'; // Substitui o MaterialIcons
import styles from './style.module.css';

type Props = {
  visible: boolean;
  error: string;
  fields?: string[];
  buttonText?: string;
  onClose: () => void;
};

export const ErrorModalComp = ({ visible, error, buttonText = "Fechar", fields = [], onClose }: Props) => {
  // Na web, o comportamento do "visible" é simplesmente não renderizar o HTML se for falso.
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <AlertCircle size={30} color="#B00020" />
        <span className={styles.errorText}>{error}</span>
        
        {fields.map((field) => (
          <span key={field} className={styles.fieldText}>• {field}</span>
        ))}
        
        <button className={styles.closeButton} onClick={onClose}>
          <span className={styles.closeButtonText}>{buttonText}</span>
        </button>
      </div>
    </div>
  );
};