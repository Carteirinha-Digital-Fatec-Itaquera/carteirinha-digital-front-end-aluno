import { Link } from 'react-router-dom';
import { Award, CalendarDays, Clock3, ChevronRight, RefreshCw } from 'lucide-react';
import { certificateService, useMockCertificates } from '../../../api/certificate/certificateService';
import EventsPageLayout from '../events/EventsPageLayout';
import { useEventResource } from '../events/useEventResource';
import { LoadingState, ErrorState } from '../events/ResourceState';
import { certificateError, formatCertificateDate } from './certificatePresentation';
import eventStyles from '../events/style.module.css';
import styles from './styleCertificados.module.css';

export default function AlunoCertificadosScreen() {
  const resource = useEventResource(certificateService.list);
  const certificates = [...(resource.data ?? [])].sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
  return <EventsPageLayout title="Meus Certificados" subtitle="Suas participações se transformam em conquistas. Consulte e baixe seus certificados acadêmicos."
    icon={<Award size={22} aria-hidden="true" />} className={eventStyles.eventsPage}>
    {useMockCertificates && <p className={eventStyles.mockNotice} role="status">Demonstração · exemplos sem validade. O download requer a API real.</p>}
    <div className={styles.sectionHeader}><div><span className={eventStyles.sectionEyebrow}>Histórico acadêmico</span><h2>Seus certificados</h2></div>
      <button type="button" className={eventStyles.refreshButton} onClick={resource.retry} disabled={resource.loading} aria-label="Atualizar certificados"><RefreshCw size={18} aria-hidden="true" /></button>
    </div>
    {resource.loading ? <LoadingState text="Carregando certificados..." /> : resource.error ? <>
      <ErrorState text={certificateError(resource.error)} onRetry={resource.retry} />
      {String((resource.error as { status?: string }).status) === '401' && <Link className={eventStyles.secondaryButton} to="/login">Entrar novamente</Link>}
    </> : certificates.length === 0 ? <section className={eventStyles.emptyState}><Award size={40} aria-hidden="true" /><h2>Nenhum certificado disponível</h2><p>Seus certificados aparecerão aqui quando forem emitidos após a confirmação de presença nos eventos.</p><Link to="/eventos" className={eventStyles.secondaryButton}>Explorar eventos</Link></section> :
      <div className={styles.list}>{certificates.map(certificate => <Link key={certificate.id} to={'/certificado/' + encodeURIComponent(certificate.id)} className={styles.card}>
        <div className={styles.icon}><Award size={25} aria-hidden="true" /></div>
        <div className={styles.cardContent}><span className={certificate.revokedAt ? styles.revoked : styles.label}>{certificate.revokedAt ? 'Revogado' : 'Certificado de participação'}</span>
          <h3>{certificate.eventTitle}</h3>
          <div className={styles.meta}><span><CalendarDays size={15} aria-hidden="true" />{formatCertificateDate(certificate.eventDate)}</span><span><Clock3 size={15} aria-hidden="true" />{certificate.workload}</span></div>
          <p className={styles.code}>Código: {certificate.verificationCode}</p><span className={styles.open}>Visualizar certificado</span>
        </div><ChevronRight className={styles.chevron} size={21} aria-hidden="true" />
      </Link>)}</div>}
  </EventsPageLayout>;
}
