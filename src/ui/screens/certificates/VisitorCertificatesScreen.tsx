import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { visitorRequest, VisitorApiError, validVisitorCpf, type Visitor, type VisitorCertificate } from '../../../api/events/visitor';
import { certificateFilename, savePdfBlob, releasePdfUrl } from '../../../api/certificate/certificateService';
import styles from '../events/EventFeedbackScreen.module.css';

export default function VisitorCertificatesScreen() {
  const [certificates, setCertificates] = useState<VisitorCertificate[] | null>(null);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [cpf, setCpf] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const load = useCallback(async (signal?: AbortSignal) => {
    const rows = await visitorRequest<VisitorCertificate[]>('visitor/certificates', undefined, signal);
    setCertificates(rows);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void visitorRequest<VisitorCertificate[]>('visitor/certificates', undefined, controller.signal).then(rows => {
      if (!controller.signal.aborted) setCertificates(rows);
    }).catch(err => {
      if (!controller.signal.aborted && !(err instanceof VisitorApiError && err.status === 401))
        setError('Não foi possível carregar seus certificados. Tente novamente.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    void visitorRequest<Visitor>('visitor/session', undefined, controller.signal).then(setVisitor).catch(() => {});
    return () => controller.abort();
  }, []);

  async function act(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try { await action(); }
    catch (err) {
      if (err instanceof VisitorApiError && err.status === 401) setCertificates(null);
      setError(err instanceof Error ? err.message : 'Não foi possível concluir. Tente novamente.');
    } finally { setBusy(false); }
  }

  async function identify() {
    if (!validVisitorCpf(cpf)) throw new Error('Informe um CPF válido.');
    if (visitor && !visitor.hasCpf) {
      await visitorRequest('visitor/cpf', { cpf });
      setVisitor({ ...visitor, hasCpf: true });
    }
    await visitorRequest('visitor/certificates/access', { cpf });
    setCpf('');
    await load();
    setMessage('Acesso aos certificados recuperado.');
  }

  async function download(certificate: VisitorCertificate) {
    const response = await fetch(`/api/visitor/certificates/${encodeURIComponent(certificate.id)}/pdf`, { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new VisitorApiError(typeof data.message === 'string' ? data.message : 'PDF indisponível. Atualize em instantes.', response.status);
    }
    releasePdfUrl(savePdfBlob(await response.blob(), certificateFilename(certificate.verificationCode)));
  }

  return <div className={styles.pageWrapper}>
    <header className={styles.topBar}>
      <Link to="/visitantes" className={styles.topBadge}>Voltar aos eventos</Link>
      <h1 className={styles.title}>Certificados do visitante</h1>
      <p className={styles.eventSubtitle}>Consulte e baixe seus certificados sem conta de aluno.</p>
    </header>
    <main className={styles.container}>
      <section className={styles.card} aria-busy={busy || loading}>
        {loading && <p role="status">Carregando certificados...</p>}
        {error && <p className={styles.errorBanner} role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!loading && <form onSubmit={event => { event.preventDefault(); void act(identify); }} className={styles.formGroup}>
          <h2 className={styles.successTitle}>{visitor && !visitor.hasCpf ? 'Vincule seu CPF' : 'Acessar por CPF'}</h2>
          {visitor && !visitor.hasCpf && <p>Cadastro atual: <strong>{visitor.name}</strong>. Vincule somente o CPF desta pessoa.</p>}
          <p>Disponível por 30 dias após o encerramento do evento. Cadastros antigos sem CPF podem vinculá-lo nesta sessão ou solicitar ajuda à Secretaria.</p>
          <label htmlFor="certificate-cpf">CPF</label>
          <input id="certificate-cpf" className={styles.textarea} value={cpf} onChange={event => setCpf(event.target.value)} required inputMode="numeric" minLength={11} maxLength={14} autoComplete="off" placeholder="Somente números" />
          <button className={styles.submitBtn} disabled={busy}>{busy ? 'Aguarde...' : visitor && !visitor.hasCpf ? 'Vincular CPF e acessar' : 'Acessar certificados'}</button>
        </form>}
        {certificates && <>
          <h2 className={styles.successTitle}>Seus certificados</h2>
          <button type="button" className={styles.skipBtn} disabled={busy} onClick={() => void act(load)}>Atualizar certificados</button>
          {certificates.length === 0 && <p>Seus certificados aparecerão após a confirmação de saída da atividade.</p>}
          {certificates.map(certificate => <article className={styles.formGroup} key={certificate.id}>
            <h3>{certificate.event.title}</h3>
            <p>{certificate.revokedAt ? 'Certificado revogado' : certificate.artifact?.state === 'READY' ? 'Disponível para download' : 'Em processamento. Atualize em instantes.'}</p>
            <button type="button" className={styles.submitBtn} disabled={busy || Boolean(certificate.revokedAt) || certificate.artifact?.state !== 'READY'} onClick={() => void act(() => download(certificate))}>Baixar PDF</button>
            <Link className={styles.textLink} to={`/certificado/verificar/${encodeURIComponent(certificate.verificationCode)}`}>Verificar certificado</Link>
          </article>)}
          <button type="button" className={styles.skipBtn} disabled={busy} onClick={() => void act(async () => {
            await visitorRequest('visitor/logout', {});
            setCertificates(null);
            setVisitor(null);
            setCpf('');
          })}>Sair deste acesso</button>
        </>}
      </section>
    </main>
  </div>;
}
