import type { ReactNode } from 'react';
import styles from './style.module.css';

export type BadgeTone = 'neutral' | 'success' | 'info' | 'warning';
export default function BadgeComp({ children, tone = 'neutral' }: {
  children: ReactNode; tone?: BadgeTone;
}) {
  return <span className={styles.badge + ' ' + styles[tone]}>{children}</span>;
}
