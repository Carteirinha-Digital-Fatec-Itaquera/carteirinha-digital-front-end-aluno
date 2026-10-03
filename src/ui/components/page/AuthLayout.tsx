import type { ReactNode } from 'react';
import PageLayout from './PageLayout';
import styles from './auth.module.css';
import logoFatec from '../../../assets/images/fatec_itaquera_logo.png';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <PageLayout title={title} subtitle={subtitle} narrow brand={<img src={logoFatec} alt="Fatec Itaquera" />}>
    <section className={styles.panel}>{children}</section>
  </PageLayout>;
}
