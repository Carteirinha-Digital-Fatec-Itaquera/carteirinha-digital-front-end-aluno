import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './style.module.css';

export interface PageLayoutProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  brand?: ReactNode;
  narrow?: boolean;
}

/** Presentation only: route/session decisions belong to the existing screens. */
export default function PageLayout({ title, subtitle, backTo, backLabel = 'Voltar ao menu', icon, children, className = '', brand, narrow = false }: PageLayoutProps) {
  return <main className={styles.page + ' ' + className}>
    <header className={styles.headerArea}>
      <div className={styles.header + (narrow ? ' ' + styles.narrow : '')}>
        {backTo && <Link to={backTo} className={styles.backLink}><ArrowLeft size={18} aria-hidden="true" />{backLabel}</Link>}
        {brand && <div className={styles.brand}>{brand}</div>}
        <div className={styles.identity}>{icon && <span className={styles.icon}>{icon}</span>}<span className={styles.badge}>Carteirinha Digital · Aluno</span></div>
        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
    <div className={styles.content + (narrow ? ' ' + styles.narrow : '')}>{children}</div>
  </main>;
}
