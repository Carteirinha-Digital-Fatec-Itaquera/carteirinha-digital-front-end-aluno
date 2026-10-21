import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Clock,
  MapPin,
  User,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';
import { visitorRequest, VisitorApiError, type PublicQr } from '../../../api/events/visitor';
import MessageModal from '../../components/MessageModal/MessageModal';
import styles from './PublicPresenceGateway.module.css';

function formatEventTime(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt) return '';
  const start = new Date(startsAt);
  const startStr = start.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  const endStr = end.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startStr} às ${endStr}`;
}

type ModalState = {
  visible: boolean;
  tone?: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
};

export default function PublicPresenceGateway() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const isInvalidRef = !reference || !/^[A-Za-z0-9_-]{10,64}$/.test(reference);
  const [loading, setLoading] = useState(() => Boolean(reference && !isInvalidRef));
  const [preview, setPreview] = useState<PublicQr | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(() => {
    if (isInvalidRef) {
      return {
        visible: true,
        tone: 'error',
        title: 'QR Code Inválido',
        message: 'O link ou código de presença informado é inválido.',
        confirmText: 'Voltar ao início',
        onConfirm: () => navigate('/visitantes', { replace: true }),
      };
    }
    return null;
  });

  useEffect(() => {
    if (!reference || !/^[A-Za-z0-9_-]{10,64}$/.test(reference)) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setLoading(true);
        const data = await visitorRequest<PublicQr>(
          `public/events/qr/${encodeURIComponent(reference)}`,
          undefined,
          controller.signal,
        );
        setPreview(data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const errObj = err instanceof VisitorApiError ? err : (err as { code?: string; message?: string; status?: number });
        if (errObj.code === 'EXPIRED_OR_INVALID_QR') {
          setModalState({
            visible: true,
            tone: 'warning',
            title: 'QR Code Expirado',
            message:
              'Este QR Code já expirou. Por favor, aponte a câmera novamente para o telão para fazer uma nova leitura.',
            confirmText: 'Entendi',
            onConfirm: () => setModalState(null),
          });
        } else {
          setModalState({
            visible: true,
            tone: 'error',
            title: 'Erro ao Carregar Evento',
            message: errObj.message || 'Não foi possível carregar as informações do evento.',
            confirmText: 'Fechar',
            onConfirm: () => setModalState(null),
          });
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

  const handleSelectStudent = () => {
    if (!reference) return;
    navigate(`/p/${encodeURIComponent(reference)}/aluno`);
  };

  const handleSelectVisitor = () => {
    if (!reference) return;
    navigate(`/visitantes?ref=${encodeURIComponent(reference)}`);
  };

  const visitorsAllowed = preview ? preview.visitorsAllowed : true;

  return (
    <main className={styles.container}>
      <header className={styles.brandHeader}>
        <div className={styles.brandBadge}>
          <Sparkles size={14} />
          Fatec Itaquera · Presença
        </div>
        <h1 className={styles.brandTitle}>Confirmação de Presença</h1>
        <p className={styles.brandSubtitle}>
          Identifique-se para registrar sua participação no evento
        </p>
      </header>

      {loading && (
        <div role="status" className={styles.loadingBox}>
          <LoaderCircle size={40} className={styles.spin} />
          <p>Carregando dados do evento...</p>
        </div>
      )}

      {!loading && preview && (
        <section className={styles.eventCard} aria-labelledby="event-title">
          <div className={styles.eventHeader}>
            <span
              className={`${styles.badge} ${
                preview.checkpoint.type === 'CHECK_IN'
                  ? styles.badgeCheckIn
                  : styles.badgeCheckOut
              }`}
            >
              <Clock size={13} />
              {preview.checkpoint.type === 'CHECK_IN'
                ? 'Entrada (Check-in)'
                : 'Saída (Check-out)'}
            </span>
          </div>

          <h2 id="event-title" className={styles.eventTitle}>
            {preview.event.title}
          </h2>

          <div className={styles.eventMeta}>
            {preview.event.speaker && (
              <div className={styles.metaItem}>
                <User size={16} />
                <span>
                  Palestrante: <strong>{preview.event.speaker}</strong>
                </span>
              </div>
            )}
            {preview.event.location && (
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>
                  Local: <strong>{preview.event.location}</strong>
                </span>
              </div>
            )}
            {preview.event.startsAt && (
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>
                  Horário: {formatEventTime(preview.event.startsAt, preview.event.endsAt)}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.selectorCard} aria-labelledby="choice-heading">
        <h2 id="choice-heading" className={styles.promptTitle}>
          Como deseja registrar sua presença?
        </h2>
        <p className={styles.promptDesc}>
          Selecione uma das opções abaixo para prosseguir com a validação:
        </p>

        <div className={styles.optionsGroup}>
          <button
            type="button"
            className={styles.optionButton}
            onClick={handleSelectStudent}
            autoFocus
          >
            <div className={`${styles.optionIcon} ${styles.studentIcon}`} aria-hidden="true">
              <GraduationCap size={24} />
            </div>
            <div className={styles.optionCopy}>
              <span className={styles.optionTitle}>Sou estudante da Fatec Itaquera</span>
              <span className={styles.optionDesc}>
                Acessar com RA institucional e registrar no meu histórico de aluno
              </span>
            </div>
          </button>

          <button
            type="button"
            className={styles.optionButton}
            onClick={handleSelectVisitor}
            disabled={!visitorsAllowed}
          >
            <div className={`${styles.optionIcon} ${styles.visitorIcon}`} aria-hidden="true">
              <Users size={24} />
            </div>
            <div className={styles.optionCopy}>
              <span className={styles.optionTitle}>Sou visitante</span>
              <span className={styles.optionDesc}>
                Participar sem conta de aluno e emitir certificado de ouvinte
              </span>
              {!visitorsAllowed && (
                <span className={styles.visitorNotice}>
                  Este evento é exclusivo para alunos cadastrados.
                </span>
              )}
            </div>
          </button>
        </div>
      </section>

      {modalState && (
        <MessageModal
          visible={modalState.visible}
          tone={modalState.tone}
          title={modalState.title}
          message={modalState.message}
          confirmText={modalState.confirmText}
          onConfirm={modalState.onConfirm}
        />
      )}
    </main>
  );
}
