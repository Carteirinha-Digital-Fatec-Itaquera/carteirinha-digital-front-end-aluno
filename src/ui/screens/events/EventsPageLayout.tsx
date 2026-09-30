import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './style.module.css';

interface PageLayoutProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function EventsPageLayout({
  title,
  backTo = "/MainMenu",
  backLabel = "Voltar ao menu",
  subtitle,
  icon,
  children,
  className = '',
}: PageLayoutProps) {
  return (
    <main className={`${styles.page} ${className}`}>
      <div className={styles.container}>

        <div className={styles.headerArea}>
          <header className={styles.header}>

            <Link
              to={backTo}
              className={styles.backLink}
            >
              <ArrowLeft size={17} strokeWidth={2} />
              {backLabel}
            </Link>

            <div className={styles.headerIdentity}>
              {icon && (
                <div className={styles.headerIcon}>
                  {icon}
                </div>
              )}

              <span className={styles.badge}>
                Carteirinha Digital
              </span>
            </div>

            <h1>{title}</h1>

            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}

          </header>
        </div>

        <section className={styles.content}>
          {children}
        </section>

      </div>
    </main>
  );
}
