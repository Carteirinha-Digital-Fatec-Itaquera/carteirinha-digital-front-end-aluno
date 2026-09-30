import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Download, ExternalLink, LoaderCircle } from 'lucide-react';
import { certificateService, useMockCertificates, publicCertificateUrl, certificateFilename, savePdfBlob, releasePdfUrl } from '../../../api/certificate/certificateService';
import type { CertificateDetails } from '../../../domains/Certificate';
import EventsPageLayout from '../events/EventsPageLayout';
import { useEventResource } from '../events/useEventResource';
import { LoadingState, ErrorState } from '../events/ResourceState';
import CertificateDocument from './CertificateDocument';
import { certificateError } from './certificatePresentation';
import eventStyles from '../events/style.module.css';
import styles from './styleView.module.css';

function CertificateActions({ certificate }: { certificate: CertificateDetails }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [pdfUrl, setPdfUrl] = useState<string>();
  const active = useRef(true);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const currentUrl = useRef<string | undefined>(undefined);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; controller.current?.abort(); if (currentUrl.current) releasePdfUrl(currentUrl.current); };
  }, []);

  async function download() {
    if (pending.current || certificate.revokedAt || useMockCertificates) return;
    pending.current = true; setBusy(true); setError(undefined);
    const request = new AbortController(); controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 30000);
    try {
      const blob = await certificateService.pdf(certificate.id, request.signal);
      if (!active.current) return;
      if (request.signal.aborted) throw new Error('Download interrompido');
      const url = savePdfBlob(blob, certificateFilename(certificate.verificationCode));
      if (currentUrl.current) releasePdfUrl(currentUrl.current);
      currentUrl.current = url; setPdfUrl(url);
    } catch (reason) { if (active.current) setError(reason); }
    finally { window.clearTimeout(timeout); pending.current = false; if (active.current) setBusy(false); }
  }
  return <div className={styles.actions}>
    <button type="button" className={styles.downloadBtn} disabled={busy || !!certificate.revokedAt || useMockCertificates} onClick={() => void download()}>
      {busy ? <LoaderCircle size={20} className={eventStyles.loadingIcon} aria-hidden="true" /> : <Download size={20} aria-hidden="true" />}
      {busy ? 'Preparando PDF...' : 'Baixar certificado'}
    </button>
    {error !== undefined && <p className={styles.error} role="alert">{certificateError(error, 'download')}</p>}
    {pdfUrl && <p className={styles.downloadHint} role="status">Download solicitado. Se o navegador não salvou o arquivo, <a href={pdfUrl} target="_blank" rel="noopener noreferrer">abra o PDF</a> e use a opção de salvar ou compartilhar.</p>}
  </div>;
}

function CertificateResource({ id }: { id: string }) {
  const load = useCallback((signal: AbortSignal) => certificateService.details(id, signal), [id]);
  const resource = useEventResource(load);
  if (resource.loading) return <LoadingState text="Carregando certificado..." />;
  if (resource.error || !resource.data) return <><ErrorState text={certificateError(resource.error)} onRetry={resource.retry} /><Link to="/certificados" className={eventStyles.secondaryButton}>Voltar aos certificados</Link></>;
  const certificate = resource.data;
  let verificationUrl: string;
  try { verificationUrl = publicCertificateUrl(certificate.verificationCode, window.location.origin); }
  catch { return <ErrorState text="Não foi possível montar o endereço de verificação. Confira a configuração da URL pública do aplicativo." onRetry={resource.retry} />; }
  return <div className={styles.content}>
    {useMockCertificates && <p className={eventStyles.mockNotice} role="status">Exemplo de demonstração, sem validade. O PDF e a autenticação dependem da API real.</p>}
    {certificate.revokedAt && <p className={styles.error} role="alert">Este certificado foi revogado. O download está indisponível.</p>}
    <CertificateDocument certificate={certificate} verificationUrl={verificationUrl} demonstration={useMockCertificates} />
    <CertificateActions certificate={certificate} />
    <a className={styles.verifyLink} href={verificationUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} aria-hidden="true" />Verificar autenticidade</a>
    <p className={styles.privacyNote}>A verificação pública exibe somente os dados necessários à confirmação do certificado.</p>
  </div>;
}

export default function AlunoCertificadoViewScreen() {
  const { id = '' } = useParams();
  return <EventsPageLayout title="Seu certificado" subtitle="Confira os dados da sua participação e baixe o documento emitido pela instituição."
    backTo="/certificados" backLabel="Voltar aos certificados" icon={<Award size={22} aria-hidden="true" />} className={eventStyles.eventsPage}>
    <CertificateResource key={id} id={id} />
  </EventsPageLayout>;
}
