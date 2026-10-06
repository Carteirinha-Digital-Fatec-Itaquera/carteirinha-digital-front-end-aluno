import { QRCodeSVG } from 'qrcode.react';
import type { CertificateDetails } from '../../../domains/Certificate';
import { formatCertificateDate } from './certificatePresentation';
import styles from './styleView.module.css';

type CertificateDocumentProps = {
  certificate: CertificateDetails;
  verificationUrl: string;
  demonstration?: boolean;
};

export default function CertificateDocument({
  certificate,
  verificationUrl,
  demonstration = false,
}: CertificateDocumentProps) {
  const snapshot = certificate.payloadSnapshot;

  const statusMessage = demonstration
    ? 'DEMONSTRAÇÃO · SEM VALIDADE'
    : certificate.revokedAt
      ? 'CERTIFICADO REVOGADO'
      : null;

  return (
    <article
      className={styles.certificate}
      aria-label="Certificado de participação"
    >
      <div className={styles.certBorder}>
        {statusMessage && (
          <p className={styles.watermark}>
            {statusMessage}
          </p>
        )}

        <header className={styles.certHeader}>
          <div className={styles.logoArea}>
            <img
              src="/fatec_itaquera_logo.png"
              alt="FATEC Itaquera"
              className={styles.fatecLogo}
            />
          </div>

          <div className={styles.institutionArea}>
            <p className={styles.institution}>
              FACULDADE DE TECNOLOGIA DE ITAQUERA
            </p>

            <p className={styles.cpsInstitution}>
              Centro Estadual de Educação Tecnológica Paula Souza
            </p>
          </div>

          <div className={`${styles.logoArea} ${styles.logoAreaRight}`}>
            <img
              src="/cps_logo_cor.png"
              alt="Centro Paula Souza"
              className={styles.cpsLogo}
            />
          </div>
        </header>

        <div className={styles.headerDivider} />

        <section className={styles.certMain}>
          <h2 className={styles.certTitle}>
            CERTIFICADO
          </h2>

          <p className={styles.certSubtitle}>
            DE PARTICIPAÇÃO
          </p>

          <p className={styles.introText}>
            Certificamos que
          </p>

          <p className={styles.studentName}>
            {snapshot.studentName}
          </p>

          <div className={styles.studentDivider} />

          <p className={styles.studentDetails}>
            <span>RA {snapshot.studentRa}</span>

            <span
              className={styles.detailSeparator}
              aria-hidden="true"
            >
              •
            </span>

            <span>{snapshot.course}</span>
          </p>

          <p className={styles.eventIntro}>
            participou do evento
          </p>

          <p className={styles.eventTitle}>
            {snapshot.eventTitle}
          </p>

          {snapshot.speaker && (
            <p className={styles.speaker}>
              Ministrado por {snapshot.speaker}
            </p>
          )}

          <div className={styles.certMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>
                DATA DO EVENTO
              </span>

              <strong className={styles.metaValue}>
                {formatCertificateDate(snapshot.eventDate)}
              </strong>
            </div>

            <div
              className={styles.metaDivider}
              aria-hidden="true"
            />

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>
                CARGA HORÁRIA
              </span>

              <strong className={styles.metaValue}>
                {snapshot.workload}
              </strong>
            </div>
          </div>
        </section>

        <footer className={styles.certFooter}>
          <div className={styles.certQr}>
            <QRCodeSVG
              data-testid="certificate-qr"
              value={verificationUrl}
              size={76}
              level="M"
              marginSize={2}
              title="QR Code de verificação pública do certificado"
            />
          </div>

          <div className={styles.verificationInfo}>
            <p className={styles.verificationTitle}>
              VERIFICAÇÃO DE AUTENTICIDADE
            </p>

            <p className={styles.verificationRow}>
              <span>Código:</span>

              <strong className={styles.verificationCode}>
                {certificate.verificationCode}
              </strong>
            </p>

            <p className={styles.verificationRow}>
              <span>Validação pública:</span>

              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.verificationUrl}
              >
                {verificationUrl}
              </a>
            </p>

            <p className={styles.verificationRow}>
              <span>Emitido em:</span>

              <strong>
                {formatCertificateDate(
                  certificate.issuedAt.split('T')[0],
                )}
              </strong>
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}