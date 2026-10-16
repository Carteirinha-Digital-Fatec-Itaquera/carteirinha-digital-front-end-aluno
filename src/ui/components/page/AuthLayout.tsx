import type { ReactNode } from 'react';
import PageLayout from './PageLayout';
import styles from './auth.module.css';
import logoFatec from '../../../assets/images/fatec_itaquera_logo.png';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  variant?: 'default' | 'classic';
};

export default function AuthLayout({ title, subtitle, children, variant = 'default' }: AuthLayoutProps) {
  // O visual do login fica isolado para não alterar as demais telas de autenticação.
  if (variant === 'classic') {
    return (
      <main className={styles.classicPage}>
        <header className={styles.classicHeader}>
          <img className={styles.classicBrand} src={logoFatec} alt="Fatec Itaquera" />
        </header>
        <section className={styles.classicPanel} aria-label={title}>
          {children}
        </section>
      </main>
    );
  }

  return <PageLayout title={title} subtitle={subtitle} narrow brand={<img src={logoFatec} alt="Fatec Itaquera" />}>
    <section className={styles.panel}>{children}</section>
  </PageLayout>;
}
