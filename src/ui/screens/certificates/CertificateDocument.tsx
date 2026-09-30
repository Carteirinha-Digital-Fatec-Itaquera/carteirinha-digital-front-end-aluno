import { QRCodeSVG } from 'qrcode.react';
import type { CertificateDetails } from '../../../domains/Certificate';
import { formatCertificateDate } from './certificatePresentation';
import styles from './styleView.module.css';

export default function CertificateDocument({ certificate, verificationUrl, demonstration = false }: {
  certificate: CertificateDetails; verificationUrl: string; demonstration?: boolean;
}) {
  const snapshot = certificate.payloadSnapshot;
  return <article className={styles.certificate} aria-label="Certificado de participação">
    <div className={styles.certBorder}>
      {(demonstration || certificate.revokedAt) && <p className={styles.watermark}>{demonstration ? 'DEMONSTRAÇÃO · SEM VALIDADE' : 'CERTIFICADO REVOGADO'}</p>}
      <header className={styles.certHeader}><p className={styles.institution}>FACULDADE DE TECNOLOGIA DE ITAQUERA</p><p className={styles.cps}>Centro Paula Souza</p></header>
      <h2 className={styles.certTitle}>CERTIFICADO</h2>
      <div className={styles.certBody}><p className={styles.certText}>Certificamos que <strong>{snapshot.studentName}</strong> participou da palestra <strong>“{snapshot.eventTitle}”</strong>, realizada pela Faculdade de Tecnologia de Itaquera, em {formatCertificateDate(snapshot.eventDate)}, com carga horária total de <strong>{snapshot.workload}</strong>.</p></div>
      <footer className={styles.certFooter}>
        <div className={styles.certQr}><QRCodeSVG data-testid="certificate-qr" value={verificationUrl} size={144} level="M" marginSize={4} title="QR Code de verificação pública do certificado" /><p className={styles.certCode}>Código: <span>{certificate.verificationCode}</span></p></div>
        <div className={styles.certSignature}><div className={styles.signatureLine} /><p>Coordenação de Eventos</p><p>FATEC Itaquera</p></div>
      </footer>
    </div>
  </article>;
}
