import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { certificateService } from '../../../api/certificate/certificateService';
import EventsPageLayout from '../events/EventsPageLayout';
import { LoadingState, ErrorState } from '../events/ResourceState';
import { useEventResource } from '../events/useEventResource';
import { certificateError, formatCertificateDate } from './certificatePresentation';
import eventStyles from '../events/style.module.css';
import styles from './styleView.module.css';

function VerificationResource({ code }: { code: string }) {
  const load = useCallback((signal: AbortSignal) => certificateService.verify(code, signal), [code]);
  const resource = useEventResource(load);
  if (resource.loading) return <LoadingState text="Consultando autenticidade..." />;
  if (resource.error || !resource.data) return <ErrorState text={certificateError(resource.error, 'verify')} onRetry={resource.retry} />;
  const result = resource.data;
  if (!result.valid) return <section className={styles.verification} role="status"><ShieldX className={styles.invalidIcon} size={48} aria-hidden="true" /><h2>Certificado revogado</h2><p>Este certificado não possui validade. Para esclarecimentos, entre em contato com a instituição.</p><code>{code}</code></section>;
  return <section className={styles.verification} aria-labelledby="verification-title"><ShieldCheck className={styles.validIcon} size={48} aria-hidden="true" /><h2 id="verification-title">Certificado válido</h2><p role="status">Autenticidade confirmada pelo registro da instituição.</p>
    <dl><div><dt>Titular</dt><dd>{result.studentName}</dd></div><div><dt>Evento</dt><dd>{result.eventTitle}</dd></div><div><dt>Data</dt><dd>{formatCertificateDate(result.eventDate)}</dd></div><div><dt>Carga horária</dt><dd>{result.workload}</dd></div><div><dt>Instituição</dt><dd>{result.institution}</dd></div><div><dt>Código verificador</dt><dd><code>{result.code}</code></dd></div></dl>
    <button type="button" className={eventStyles.secondaryButton} onClick={resource.retry}>Consultar novamente</button>
  </section>;
}

export default function CertificadoVerificarScreen() {
  const { code = '' } = useParams();
  return <EventsPageLayout title="Verificar autenticidade" subtitle="Consulta pública de certificados da FATEC Itaquera. Não é necessário entrar na sua conta."
    backTo="/login" backLabel="Acessar Carteirinha Digital" icon={<ShieldCheck size={22} aria-hidden="true" />} className={eventStyles.eventsPage}>
    <VerificationResource key={code} code={code} />
  </EventsPageLayout>;
}
