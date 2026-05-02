import React from 'react';
import styles from './style.module.css';

type Props = {
  icon: React.ReactNode; 
  label: string;
  size?: "large" | "small";
  onPress?: () => void;
};

type ButtonGridProps = {
  items?: Props[];
};

export const ButtonGrid = ({ items = [] }: ButtonGridProps) => {
  return (
    <div className={styles.container}>
      {items.map((item, i) => (
        <button
          key={i}
          className={`${styles.button} ${item.size === "large" ? styles.large : styles.small}`}
          onClick={item.onPress}
        >
          <div className={styles.iconWrapper}>
            {item.icon}
          </div>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};