import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LoaderCircle,
  MapPin,
  QrCode,
  User,
} from 'lucide-react';
import {
  getAttendanceQrPreview,
  confirmAttendanceReference,
  type QrPreviewResponse,
} from '../../../api/attendance/scanAttendance';
import { responseFeedback, errorFeedback, type ScanFeedback } from '../scanner/scanFeedback';
import ScanResultCard from '../scanner/ScanResultCard';
import EventsPageLayout from '../events/EventsPageLayout';
import styles from './PresencaConfirmacaoScreen.module.css';

export default function PresencaConfirmacaoScreen() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<QrPreviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanFeedback | null>(null);

  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 1. Verificação de autenticação: redireciona para login preservando o destino
    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      navigate('/login', { replace: true });
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    void (async () => {
      if (!reference || !/^[A-Za-z0-9_-]{10,64}$/.test(reference)) {
        setLoading(false);
        setErrorMessage('Link de presença inválido ou incompleto.');
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await getAttendanceQrPreview(reference, controller.signal);
        setPreview(data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const errObj = err as { code?: string; message?: string; status?: string };
        if (errObj.code === 'EXPIRED_OR_INVALID_QR') {
          setErrorMessage(
            'Este QR Code já expirou. Por favor, aponte a câmera novamente para o telão para fazer uma nova leitura.',
          );
        } else if (errObj.code === 'CHECKPOINT_CLOSED') {
          setErrorMessage(
            'O checkpoint de presença para este evento foi encerrado ou alterado.',
          );
        } else if (errObj.status === '401') {
          sessionStorage.setItem('returnUrl', window.location.pathname);
          navigate('/login', { replace: true });
        } else {
          setErrorMessage(
            errObj.message || 'Não foi possível carregar os dados deste evento.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [reference, navigate]);

  const handleConfirm = async () => {
    if (!reference || submitting || !preview) return;

    try {
      setSubmitting(true);
      const data = await confirmAttendanceReference(reference);
      const feedback = responseFeedback(data);
      setResult(feedback);
    } catch (err: unknown) {
      setResult(errorFeedback(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    navigate('/eventos/scanner');
  };

  if (result) {
    return (
      <EventsPageLayout
        title="Presença em evento"
        backTo="/eventos"
        backLabel="Voltar aos eventos"
      >
        <div className={styles.container}>
          <ScanResultCard result={result} onRetry={handleRetry} />
        </div>
      </EventsPageLayout>
    );
  }

  return (
    <EventsPageLayout
      title="Confirmar presença"
      backTo="/eventos"
      backLabel="Voltar aos eventos"
    >
      <div className={styles.container}>
        {loading && (
          <div className={`${styles.card} ${styles.loadingState}`}>
            <LoaderCircle size={44} className={styles.spin} />
            <p>Carregando informações do evento...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className={`${styles.card} ${styles.errorState}`}>
            <AlertCircle size={48} color="#BA1A1A" />
            <h2 className={styles.errorTitle}>QR Code Inválido ou Expirado</h2>
            <p className={styles.errorMessage}>{errorMessage}</p>
            <div className={styles.actions} style={{ width: '100%' }}>
              <Link to="/eventos/scanner" className={styles.confirmButton}>
                <QrCode size={18} />
                Escanear novamente no telão
              </Link>
              <Link to="/eventos" className={styles.secondaryButton}>
                Voltar para eventos
              </Link>
            </div>
          </div>
        )}

        {!loading && !errorMessage && preview && (
          <div className={styles.card}>
            <div className={styles.header}>
              <span
                className={`${styles.badge} ${
                  preview.checkpoint.type === 'CHECK_IN'
                    ? styles.badgeCheckIn
                    : styles.badgeCheckOut
                }`}
              >
                <Clock size={14} />
                {preview.checkpoint.type === 'CHECK_IN'
                  ? 'Entrada no Evento'
                  : 'Saída e Certificado'}
              </span>
            </div>

            <div className={styles.eventInfo}>
              <h1 className={styles.title}>{preview.event.title}</h1>

              <div className={styles.metaList}>
                {preview.event.speaker && (
                  <div className={styles.metaItem}>
                    <User size={18} />
                    <span>Palestrante: <strong>{preview.event.speaker}</strong></span>
                  </div>
                )}
                {preview.event.location && (
                  <div className={styles.metaItem}>
                    <MapPin size={18} />
                    <span>Local: <strong>{preview.event.location}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.alertBox}>
              <AlertCircle size={20} />
              <span>
                Para registrar sua presença com segurança, clique no botão abaixo para confirmar sua participação.
              </span>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={20} className={styles.spin} />
                    Registrando presença...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    {preview.checkpoint.type === 'CHECK_IN'
                      ? 'Confirmar Entrada'
                      : 'Confirmar Saída'}
                  </>
                )}
              </button>

              <Link to="/eventos" className={styles.secondaryButton}>
                Cancelar
              </Link>
            </div>
          </div>
        )}
      </div>
    </EventsPageLayout>
  );
}
