import { useLocationNotice } from '../../hooks/useLocationNotice';
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  RefreshCw,
  X,
  Sparkles,
  Star,
} from "lucide-react";
const logoFatec = "/fatec_itaquera_logo.png";
import {
  visitorRequest,
  validVisitorCpf,
  VisitorApiError,
  locate,
  type Series,
  type Visitor,
  type PublicQr,
  type VisitorAttendance,
  type VisitorCertificate,
} from "../../../api/events/visitor";
import { parsePresenceUrlOrToken } from "../../../api/attendance/scanAttendance";
import CameraReader from "../scanner/CameraReader";
import { availableVisitorSeries } from '../../../api/events/eventAvailability';
import MessageModal from "../../components/MessageModal/MessageModal";
import styles from "./PublicEventsScreen.module.css";

function formatEventTime(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt) return "";
  const start = new Date(startsAt);
  const startStr = start.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  const endStr = end.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
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

function formatWorkload(minutes?: number | null) {
  if (!minutes || minutes <= 0) return null;
  if (minutes % 60 === 0) return `${minutes / 60}h de carga horária`;
  return `${minutes} min de carga horária`;
}

export default function PublicEventsScreen({
  reference,
}: {
  reference?: string;
}) {
  const [search] = useSearchParams();
  const { confirmLocation, locationNotice } = useLocationNotice();
  const activeReferenceParam = reference || search.get("ref") || search.get("reference") || "";
  const eventIdParam = search.get("evento") || search.get("id");

  const [confirmedReference, setConfirmedReference] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState<string>(activeReferenceParam);
  const [series, setSeries] = useState<Series[]>([]);
  const [session, setSession] = useState<Visitor | null>(null);
  const [attendances, setAttendances] = useState<VisitorAttendance[]>([]);
  const [certificates, setCertificates] = useState<VisitorCertificate[]>([]);
  const [preview, setPreview] = useState<PublicQr | null>(null);
  const [contextUnavailable, setContextUnavailable] = useState(false);

  const [selected, setSelected] = useState(search.get("edicao") || "");
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorCourse, setVisitorCourse] = useState('');
  const [visitorCpf, setVisitorCpf] = useState('');

  const eventCardRef = useRef<HTMLDivElement | null>(null);
  const seriesRequestRef = useRef<{ request: Promise<Series[]>; signal?: AbortSignal } | null>(null);

  const current = series.find((s) => s.id === (preview?.seriesId || selected));
  const visibleSeries = contextUnavailable ? [] : (activeReference || eventIdParam) && preview
    ? series.map(item => ({ ...item, events: item.events.filter(event => event.id === preview.event.id) })).filter(item => item.events.length > 0)
    : series;

  const refreshSeries = useCallback(async (signal?: AbortSignal) => {
    if (seriesRequestRef.current && !seriesRequestRef.current.signal?.aborted) return seriesRequestRef.current.request;
    const request = visitorRequest<Series[]>('public/events/series', undefined, signal)
      .then(data => {
        const rows = availableVisitorSeries(data);
        setSeries(rows);
        return rows;
      })
      .finally(() => {
        if (seriesRequestRef.current?.request === request) seriesRequestRef.current = null;
      });
    seriesRequestRef.current = { request, signal };
    return request;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      if (document.hidden) return;
      void refreshSeries(controller.signal).then(rows => {
        if (preview?.visitorsAllowed && !rows.some(item => item.events.some(event => event.id === preview.event.id))) {
          setContextUnavailable(true);
          setActiveReference('');
        }
      }).catch(() => {
        // A API valida o estado novamente antes de qualquer registro de presença.
      });
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refreshSeries, preview?.event.id, preview?.visitorsAllowed]);

  const loadCertificates = useCallback(async () => {
    try {
      const list = await visitorRequest<VisitorCertificate[]>("visitor/certificates");
      setCertificates(list);
    } catch {
      // Ignora falhas se não logado
    }
  }, []);

  const loadAttendances = useCallback(async () => {
    try {
      const list = await visitorRequest<VisitorAttendance[]>("visitor/attendances");
      setAttendances(list);
    } catch {
      // Endpoint opcional caso visitante não esteja autenticado
    }
  }, []);

  const handleError = useCallback((error: unknown) => {
    setCameraActive(false);
    if ((error as { code?: string })?.code === 'LOCATION_CANCELLED') {
      setMessage('Registro cancelado. Nenhuma presença foi registrada.');
      return;
    }
    if (error instanceof VisitorApiError) {
      if (error.code === 'EXPIRED_OR_INVALID_QR') {
        setModalState({
          visible: true,
          tone: 'warning',
          title: 'QR Code Expirado ou Inválido',
          message: error.message || 'QR Code expirado ou inválido. Faça uma nova leitura.',
          confirmText: 'Ler QR atual',
          onConfirm: () => {
            setModalState(null);
            setCameraActive(true);
          },
        });
        return;
      }
      if (error.code === 'LOCATION_INCONCLUSIVE') {
        setModalState({
          visible: true,
          tone: 'warning',
          title: 'Localização Inconclusiva',
          message: 'Não foi possível validar sua localização na área do evento ou a precisão do GPS foi insuficiente. Se o problema persistir, procure a Secretaria presencialmente.',
          confirmText: 'Tentar novamente',
          onConfirm: () => setModalState(null),
        });
        return;
      }
      if (['PERMISSION_DENIED', 'POSITION_UNAVAILABLE', 'LOCATION_UNAVAILABLE', 'TIMEOUT'].includes(error.code || '')) {
        setModalState({
          visible: true,
          tone: 'error',
          title: 'Acesso à Localização',
          message: 'Acesso à localização negado ou indisponível. Para confirmar a presença por geolocalização, habilite a permissão de GPS no seu navegador ou procure a Secretaria.',
          confirmText: 'Entendi',
          onConfirm: () => setModalState(null),
        });
        return;
      }
      if (error.code === 'CHECKPOINT_CLOSED') {
        setModalState({
          visible: true,
          tone: 'warning',
          title: 'Checkpoint Encerrado',
          message: 'O checkpoint de presença para este evento foi encerrado ou alterado.',
          confirmText: 'OK',
          onConfirm: () => setModalState(null),
        });
        return;
      }
      if (error.code === 'ALREADY_REGISTERED' || (error.message && /já foi registrada/i.test(error.message))) {
        setModalState({
          visible: true,
          tone: 'info',
          title: 'Presença já Registrada',
          message: error.message || 'Sua presença já foi registrada nesta atividade.',
          confirmText: 'OK',
          onConfirm: () => setModalState(null),
        });
        return;
      }
      if (error.status === 401) {
        setSession(null);
        setCertificates([]);
        setAttendances([]);
        setModalState({
          visible: true,
          tone: 'info',
          title: 'Sessão Expirada',
          message: 'Seu acesso temporário expirou. Identifique-se novamente.',
          confirmText: 'OK',
          onConfirm: () => setModalState(null),
        });
        return;
      }
      if (error.status === 409) {
        setModalState({
          visible: true,
          tone: 'warning',
          title: 'Cadastro já Existente',
          message: 'Este e-mail ou CPF já foi informado nesta edição. Para preservar seu histórico com segurança, procure o atendimento da Secretaria para emitir seus certificados.',
          confirmText: 'Entendi',
          onConfirm: () => setModalState(null),
        });
        return;
      }
    }
    const errObj = error as { code?: string; message?: string };
    if (errObj?.code === 'EXPIRED_OR_INVALID_QR') {
      setModalState({
        visible: true,
        tone: 'warning',
        title: 'QR Code Expirado ou Inválido',
        message: errObj.message || 'QR Code expirado ou inválido. Faça uma nova leitura.',
        confirmText: 'Ler QR atual',
        onConfirm: () => {
          setModalState(null);
          setCameraActive(true);
        },
      });
      return;
    }
    const msg = error instanceof Error ? error.message : 'Falha de conexão com o servidor.';
    setModalState({
      visible: true,
      tone: 'error',
      title: 'Atenção',
      message: msg,
      confirmText: 'Fechar',
      onConfirm: () => setModalState(null),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const rows = await refreshSeries(controller.signal);

        let qr: PublicQr | null = null;
        if (activeReferenceParam) {
          try {
            qr = await visitorRequest<PublicQr>(
              `public/events/qr/${encodeURIComponent(activeReferenceParam)}`,
              undefined,
              controller.signal,
            );
            setPreview(qr);
            setActiveReference(activeReferenceParam);
            setContextUnavailable(false);
          } catch (error) {
            if (controller.signal.aborted) throw error;
            setContextUnavailable(true);
            handleError(error);
          }
        } else if (eventIdParam) {
          try {
            const ev = await visitorRequest<{
              event: {
                id: string;
                title: string;
                description?: string | null;
                speaker: string;
                location: string;
                startsAt?: string;
                endsAt?: string;
                workloadMinutes?: number;
              };
              seriesId: string | null;
              visitorsAllowed: boolean;
              locationRequired: boolean;
              serverTime: string;
            }>(
              `public/events/${encodeURIComponent(eventIdParam)}`,
              undefined,
              controller.signal,
            );
            qr = {
              checkpoint: { type: "CHECK_IN" },
              event: ev.event,
              seriesId: ev.seriesId,
              visitorsAllowed: ev.visitorsAllowed,
              locationRequired: ev.locationRequired,
              expiresAt: "",
              serverTime: ev.serverTime,
            };
            setPreview(qr);
            setContextUnavailable(false);
          } catch (error) {
            if (controller.signal.aborted) throw error;
            setContextUnavailable(true);
            handleError(error);
          }
        }

        setSelected((previous) => qr?.seriesId || (activeReferenceParam || eventIdParam ? '' : rows.some(item => item.id === previous) ? previous : rows[0]?.id || ''));

        try {
          const visitor = await visitorRequest<Visitor>(
            "visitor/session",
            undefined,
            controller.signal,
          );
          setSession(visitor);
          await Promise.all([loadCertificates(), loadAttendances()]);
        } catch (error) {
          if (!(error instanceof VisitorApiError && error.status === 401)) {
            throw error;
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          handleError(error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [activeReferenceParam, eventIdParam, loadCertificates, loadAttendances, handleError, refreshSeries]);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      if (!document.hidden) {
        void visitorRequest<Visitor>("visitor/session")
          .then(setSession)
          .catch((error) => {
            if (error instanceof VisitorApiError && error.status === 401) {
              setSession(null);
              setCertificates([]);
              setAttendances([]);
              setMessage("Seu acesso temporário expirou. Identifique-se novamente.");
            }
          });
      }
    }, 30000);
    return () => window.clearInterval(id);
  }, [session]);



  async function act(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setFailure("");
    try {
      await action();
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  const register = (form: HTMLFormElement) =>
    act(async () => {
      const data = new FormData(form);
      if (!validVisitorCpf(String(data.get('cpf') || ''))) throw new Error('Informe um CPF válido.');
      const targetSeriesId = preview?.seriesId || selected;
      if (!targetSeriesId) {
        setFailure("Selecione uma edição para continuar.");
        return;
      }
      await visitorRequest<{
        visitorId: string;
        name: string;
        email: string;
        seriesId: string;
        isSelfDeclared?: boolean;
      }>("visitor/registration", {
        seriesId: targetSeriesId,
        name: String(data.get("name")),
        email: String(data.get("email")),
        course: String(data.get("course") || "") || undefined,
        cpf: String(data.get("cpf") || "") || undefined,
      });

      const currentVisitor = await visitorRequest<Visitor>("visitor/session");
      setSession(currentVisitor);
      await Promise.all([loadCertificates(), loadAttendances()]);
      setMessage(
        activeReference
          ? "Identificação concluída! Clique em Confirmar presença abaixo ou faça nova leitura."
          : "Identificação confirmada! Selecione uma atividade para escanear a presença.",
      );
    });

  const confirmPresence = (refToConfirm: string) =>
    act(async () => {
      if (contextUnavailable) throw new Error('Este evento não está disponível para participação.');
      const targetRef = refToConfirm || activeReference;
      if (!targetRef) return;

      const latestQr = await visitorRequest<PublicQr>(`public/events/qr/${encodeURIComponent(targetRef)}`);
      if (preview && latestQr.event.id !== preview.event.id) {
        throw new VisitorApiError('O QR Code pertence a outro evento. Leia o QR da atividade selecionada.', 400, 'EVENT_MISMATCH');
      }
      setPreview(latestQr);

      let position;
      if (latestQr.locationRequired) {
        await confirmLocation();
        const challenge = await visitorRequest<{ challengeId: string }>(
          "visitor/challenge",
          { reference: targetRef, eventId: latestQr.event.id },
        );
        position = { ...(await locate()), challengeId: challenge.challengeId };
      }

      const result = await visitorRequest<{ message: string; type?: string }>(
        "visitor/attendance",
        { reference: targetRef, eventId: latestQr.event.id, position },
      );

      setConfirmedReference(targetRef);
      setMessage(
        result.message ||
          (latestQr.checkpoint.type === "CHECK_IN"
            ? "Entrada (Check-in) registrada com sucesso! ✓"
            : "Saída (Check-out) confirmada com sucesso! ✓ Seu certificado está liberado."),
      );
      await Promise.all([loadCertificates(), loadAttendances()]);
    });

  const handleCameraScan = useCallback(
    async (rawToken: string) => {
      setCameraActive(false);
      setBusy(true);
      setMessage("");
      setFailure("");

      const parsed = parsePresenceUrlOrToken(rawToken);
      const scannedRef = parsed?.type === "reference" ? parsed.reference : rawToken.trim();

      if (!scannedRef || !/^[A-Za-z0-9_-]{10,64}$/.test(scannedRef)) {
        setBusy(false);
        setModalState({
          visible: true,
          tone: 'warning',
          title: 'QR Code Inválido',
          message: 'QR Code não reconhecido. Certifique-se de escanear o QR Code exibido no telão.',
          confirmText: 'Escanear novamente',
          onConfirm: () => {
            setModalState(null);
            setCameraActive(true);
          },
        });
        return;
      }

      try {
        const qr = await visitorRequest<PublicQr>(`public/events/qr/${encodeURIComponent(scannedRef)}`);
        if (preview && qr.event.id !== preview.event.id) {
          throw new VisitorApiError('O QR Code pertence a outro evento. Leia o QR da atividade selecionada.', 400, 'EVENT_MISMATCH');
        }
        setPreview(qr);
        setContextUnavailable(false);
        setActiveReference(scannedRef);
        setConfirmedReference(null);

        // Se o visitante já tem sessão válida nesta edição, confirma presença imediatamente
        if (session && qr.seriesId === session.seriesId) {
          let position;
          if (qr.locationRequired) {
            await confirmLocation();
            const challenge = await visitorRequest<{ challengeId: string }>(
              "visitor/challenge",
              { reference: scannedRef, eventId: qr.event.id },
            );
            position = { ...(await locate()), challengeId: challenge.challengeId };
          }

          const result = await visitorRequest<{ message: string }>(
            "visitor/attendance",
            { reference: scannedRef, eventId: qr.event.id, position },
          );

          setConfirmedReference(scannedRef);
          setMessage(
            result.message ||
              (qr.checkpoint.type === "CHECK_IN"
                ? "Entrada (Check-in) registrada com sucesso! ✓"
                : "Saída (Check-out) confirmada com sucesso! ✓ Seu certificado está liberado."),
          );
          await Promise.all([loadCertificates(), loadAttendances()]);
        } else if (session && qr.seriesId !== session.seriesId) {
          setMessage("Atividade de outra edição. Confirme sua participação nesta atividade abaixo.");
        } else {
          setMessage("QR Code do evento escaneado! Identifique-se rapidamente abaixo para registrar sua presença.");
          if (qr.seriesId) setSelected(qr.seriesId);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setBusy(false);
      }
    },
    [session, loadCertificates, loadAttendances, handleError, preview, confirmLocation],
  );

  const selectEventAndScan = (event: Series['events'][number]) => {
    setActiveReference('');
    setConfirmedReference(null);
    setContextUnavailable(false);
    setPreview({
      checkpoint: { type: "CHECK_IN" },
      event: {
        id: event.id,
        title: event.title,
        speaker: event.speaker,
        location: event.location,
        startsAt: event.startsAt,
        description: event.description,
      },
      seriesId: current?.id || null,
      visitorsAllowed: true,
      locationRequired: false,
      expiresAt: "",
      serverTime: new Date().toISOString(),
    });
    setCameraActive(true);
    eventCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function download(id: string) {
    const response = await fetch(
      `/api/visitor/certificates/${encodeURIComponent(id)}/pdf`,
      { credentials: "same-origin", cache: "no-store" },
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || "PDF em processamento. Atualize em instantes.",
      );
    }
    const url = URL.createObjectURL(await response.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificado.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Identifica a presença atual para o evento selecionado
  const currentEventId = preview?.event.id;
  const currentAttendance = attendances.find((a) => a.eventId === currentEventId);
  const hasCheckIn = Boolean(currentAttendance?.checkInAt);
  const hasCheckOut = Boolean(currentAttendance?.checkOutAt);

  return (
    <main className={styles.page}>
      {/* Cabeçalho no padrão visual arredondado do Arthur */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <img src={logoFatec} alt="Fatec Itaquera" className={styles.brandLogo} />
          <Link to="/login" className={styles.studentLink}>
            <User size={15} />
            Acesso de aluno
          </Link>
        </div>

        <div className={styles.headerBadge}>
          <Sparkles size={13} />
          Carteirinha Digital · Visitantes
        </div>

        <h1 className={styles.headerTitle}>Eventos e certificados</h1>
        <p className={styles.headerSubtitle}>
          Participe como visitante, sem criar uma conta na carteirinha.
        </p>
      </header>

      <div className={styles.content}>
        {loading && (
          <div className={styles.card} role="status">
            <p>Carregando eventos...</p>
          </div>
        )}

        {message && (
          <div className={styles.success} role="status">
            <CheckCircle2 size={20} />
            <span>{message}</span>
          </div>
        )}

        {failure && (
          <div className={styles.error} role="alert">
            <AlertCircle size={20} />
            <span>{failure}</span>
          </div>
        )}

        {/* Detalhes completos do Evento & Fluxo de Check-in/Check-out */}
        {contextUnavailable && <p role="alert">Este evento não está disponível para participação. Leia o QR de uma atividade disponível.</p>}
        {preview && !contextUnavailable && (
          <section className={styles.eventDetailCard} ref={eventCardRef}>
            <div className={styles.eventHeaderRow}>
              <div>
                <span className={`${styles.badge} ${hasCheckOut ? styles.badgeSuccess : hasCheckIn ? styles.badgeWarning : styles.badgeInfo}`}>
                  {hasCheckOut ? "Presença Concluída" : hasCheckIn ? "Check-in Realizado" : "Check-in Disponível"}
                </span>
                <h2 className={styles.eventTitle}>{preview.event.title}</h2>
              </div>
            </div>

            {/* Metadados detalhados com ícones */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <User size={18} />
                <span><strong>Palestrante:</strong> {preview.event.speaker}</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={18} />
                <span><strong>Local:</strong> {preview.event.location}</span>
              </div>
              {preview.event.startsAt && (
                <div className={styles.metaItem}>
                  <Clock size={18} />
                  <span><strong>Horário:</strong> {formatEventTime(preview.event.startsAt, preview.event.endsAt)}</span>
                </div>
              )}
              {preview.event.workloadMinutes && (
                <div className={styles.metaItem}>
                  <Calendar size={18} />
                  <span><strong>Carga horária:</strong> {formatWorkload(preview.event.workloadMinutes)}</span>
                </div>
              )}
            </div>

            {preview.event.description && (
              <div className={styles.eventDescription}>
                <p>{preview.event.description}</p>
              </div>
            )}

            {!preview.visitorsAllowed ? (
              <div className={styles.error} role="alert">
                <AlertCircle size={20} />
                <div>
                  <p>Esta atividade é restrita a alunos cadastrados.</p>
                  <Link
                    to="/login"
                    onClick={() =>
                      activeReference &&
                      sessionStorage.setItem("returnUrl", `/p/${activeReference}`)
                    }
                    className={styles.btnSecondary}
                    style={{ marginTop: 8 }}
                  >
                    Entrar como aluno
                  </Link>
                </div>
              </div>
            ) : session?.seriesId === preview.seriesId ? (
              <>
                {/* Stepper do Processo Completo de Presença */}
                <div className={styles.presenceProcess}>
                  <h3 className={styles.processTitle}>
                    <QrCode size={20} />
                    Processo de Presença do Visitante
                  </h3>

                  <div className={styles.processSteps}>
                    {/* Passo 1: Check-in */}
                    <div className={`${styles.stepBox} ${hasCheckIn ? styles.stepBoxCompleted : styles.stepBoxActive}`}>
                      <span className={styles.stepLabel}>Passo 1: Entrada</span>
                      <span className={styles.stepStatus}>
                        {hasCheckIn ? (
                          <>
                            <CheckCircle2 size={16} color="#2e7d32" />
                            Confirmado {currentAttendance?.checkInAt ? `às ${new Date(currentAttendance.checkInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </>
                        ) : (
                          "Check-in pendente"
                        )}
                      </span>
                    </div>

                    {/* Passo 2: Check-out */}
                    <div className={`${styles.stepBox} ${hasCheckOut ? styles.stepBoxCompleted : hasCheckIn ? styles.stepBoxActive : ""}`}>
                      <span className={styles.stepLabel}>Passo 2: Saída</span>
                      <span className={styles.stepStatus}>
                        {hasCheckOut ? (
                          <>
                            <CheckCircle2 size={16} color="#2e7d32" />
                            Confirmado {currentAttendance?.checkOutAt ? `às ${new Date(currentAttendance.checkOutAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
                          </>
                        ) : hasCheckIn ? (
                          "Aguardando término da atividade"
                        ) : (
                          "Disponível após check-in"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Leitor de Câmera Inline */}
                  {cameraActive && (
                    <div className={styles.scannerWrapper}>
                      <div className={styles.scannerHeader}>
                        <h3>Leitor de QR Code</h3>
                        <button
                          type="button"
                          className={styles.closeScannerBtn}
                          onClick={() => setCameraActive(false)}
                        >
                          <X size={16} /> Fechar câmera
                        </button>
                      </div>
                      <CameraReader onRead={handleCameraScan} />
                      <p className={styles.scannerHint}>
                        Aponte a câmera para o QR Code rotativo exibido no telão do evento.
                      </p>
                    </div>
                  )}

                  {/* Ações de Presença (Botão de confirmação e botão de escanear) */}
                  <div className={styles.btnActionGroup}>
                    {activeReference && !hasCheckOut && (
                      <button
                        className={styles.btnPrimary}
                        disabled={busy || confirmedReference === activeReference}
                        onClick={() => void confirmPresence(activeReference)}
                      >
                        <CheckCircle2 size={18} />
                        {busy
                          ? "Confirmando presença..."
                          : confirmedReference === activeReference
                            ? "Presença confirmada ✓"
                            : preview.checkpoint.type === "CHECK_IN"
                              ? "Confirmar Entrada (Check-in)"
                              : "Confirmar Saída (Check-out)"}
                      </button>
                    )}

                    {!cameraActive && !hasCheckOut && (
                      <button
                        type="button"
                        className={activeReference ? styles.btnSecondary : styles.btnPrimary}
                        disabled={busy}
                        onClick={() => setCameraActive(true)}
                      >
                        <Camera size={18} />
                        {!hasCheckIn
                          ? "Escanear QR Code de Check-in no telão"
                          : "Escanear QR Code de Check-out no telão"}
                      </button>
                    )}

                    {hasCheckOut && (
                      <>
                        <div className={styles.success} style={{ width: "100%" }}>
                          <CheckCircle2 size={20} />
                          <span>Sua presença foi 100% concluída neste evento! O certificado está liberado para download abaixo.</span>
                        </div>
                        <Link
                          to={`/eventos/${preview.event.id}/avaliacao?perfil=visitante&title=${encodeURIComponent(preview.event.title)}`}
                          state={{ eventTitle: preview.event.title }}
                          className={styles.btnPrimary}
                          style={{ width: "100%", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
                        >
                          <Star size={18} /> Avaliar palestra (Pesquisa de Satisfação)
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : session && session.seriesId !== preview.seriesId ? (
              <div className={styles.contextSwitchAlert} role="region" aria-label="Aviso de troca de atividade">
                <p>
                  Você possui sessão ativa em outra edição ({session.name}).
                </p>
                <p>
                  Para participar de <strong>{preview.event.title}</strong>, confirme sua identificação nesta edição. Seus certificados anteriores continuam seguros.
                </p>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={busy}
                  onClick={() => {
                    setSession(null);
                    
                    if (preview.seriesId) setSelected(preview.seriesId);
                    setMessage("Informe seus dados para participar desta atividade.");
                  }}
                >
                  Participar desta atividade
                </button>
              </div>
            ) : (
              <div className={styles.eventContext}>
                <p>
                  Identifique-se abaixo para registrar sua presença. Você não precisará criar senha nem conta de aluno.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Cadastro rápido e Identificação do visitante */}
        {!contextUnavailable && (!session || (preview && session.seriesId !== preview.seriesId)) && (!preview || preview.visitorsAllowed) && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Identificação rápida do visitante</h2>
                <p>Informe seus dados uma única vez para registrar presença e emitir certificados.</p>
              </div>
            </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void register(e.currentTarget);
                }}
              >
                {preview ? (
                  <div className={styles.eventContext}>
                    <p>
                      Atividade selecionada: <strong>{preview.event.title}</strong>
                      {preview.event.speaker ? ` · ${preview.event.speaker}` : ""}
                    </p>
                  </div>
                ) : (
                  <label>
                    Edição do evento
                    <select
                      required
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      <option value="">Selecione a edição</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  Nome completo
                  <input
                    name="name"
                    value={visitorName}
                    onChange={event => setVisitorName(event.target.value)}
                    required
                    minLength={3}
                    maxLength={160}
                    autoComplete="name"
                    placeholder="Seu nome completo para o certificado"
                  />
                </label>

                <label>
                  E-mail
                  <input
                    name="email"
                    value={visitorEmail}
                    onChange={event => setVisitorEmail(event.target.value)}
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="exemplo@email.com"
                  />
                </label>

                <label>
                  Vínculo ou curso
                  <select name="course" value={visitorCourse} onChange={event => setVisitorCourse(event.target.value)}>
                    <option value="">Visitante — Participante/ouvinte externo</option>
                    {current?.courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </label>

                  <label>
                    CPF
                    <input
                      name="cpf"
                      value={visitorCpf}
                      onChange={event => setVisitorCpf(event.target.value)}
                      required
                      inputMode="numeric"
                      minLength={11}
                      maxLength={14}
                      autoComplete="off"
                      placeholder="Somente números"
                    />
                  </label>
                <div className={styles.btnActionGroup}>
                  <button
                    className={styles.btnPrimary}
                    disabled={busy || !(preview?.seriesId || selected)}
                  >
                    {busy ? "Identificando..." : "Continuar como visitante"}
                  </button>
                </div>
              </form>
          </section>
        )}

        {/* Painel do Visitante logado: Certificados e Sessão */}
        {session && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Olá, {session.name}</h2>
                <Link to="/visitantes/certificados">Meus certificados e acesso por CPF</Link>
                <p>
                  Seus certificados ficam disponíveis até{" "}
                  {new Date(session.retentionAt).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}.
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.btnSecondary}
                  disabled={busy}
                  onClick={() => void act(async () => {
                    await Promise.all([loadCertificates(), loadAttendances()]);
                  })}
                >
                  <RefreshCw size={16} />
                  Atualizar
                </button>
                <button
                  className={styles.btnSecondary}
                  disabled={busy}
                  onClick={() =>
                    void act(async () => {
                      await visitorRequest("visitor/logout", {});
                      setVisitorName('');
                      setVisitorEmail('');
                      setVisitorCourse('');
                      setVisitorCpf('');
                      setSession(null);
                      setCertificates([]);
                      setAttendances([]);
                    })
                  }
                >
                  Sair
                </button>
              </div>
            </div>

            {!certificates.length ? (
              <p>Seus certificados aparecerão aqui após a confirmação de saída (Check-out) das atividades.</p>
            ) : (
              certificates.map((cert) => (
                <article className={styles.activity} key={cert.id}>
                  <div className={styles.activityHeader}>
                    <h3>{cert.event.title}</h3>
                    <span className={`${styles.badge} ${cert.revokedAt ? styles.badgeWarning : cert.artifact?.state === "READY" ? styles.badgeSuccess : styles.badgeInfo}`}>
                      {cert.revokedAt ? "Revogado" : cert.artifact?.state === "READY" ? "Disponível para download" : "Em processamento"}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.btnPrimary}
                      disabled={busy || Boolean(cert.revokedAt) || cert.artifact?.state !== "READY"}
                      onClick={() => void act(() => download(cert.id))}
                    >
                      <Download size={16} />
                      Baixar PDF do Certificado
                    </button>
                    <Link
                      to={`/certificado/verificar/${cert.verificationCode}`}
                      className={styles.btnSecondary}
                    >
                      <ExternalLink size={16} />
                      Verificar código
                    </Link>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* Programação completa de atividades com botão de entrar e escanear */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Programação de Atividades</h2>
              <p>Explore as palestras e atividades. Você pode entrar em qualquer atividade e escanear sua presença no telão.</p>
            </div>
          </div>

          {!visibleSeries.length && !loading && (
            <p>Nenhuma edição aberta no momento.</p>
          )}

          {visibleSeries.map((s) => (
            <div key={s.id} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "16px 0 12px", color: "var(--app-color-primary, #ba1a1a)" }}>
                {s.title}
              </h3>

              {s.events.map((event) => {
                const eventAttendance = attendances.find((a) => a.eventId === event.id);

                return (
                  <article key={event.id} className={styles.activity}>
                    <div className={styles.activityHeader}>
                      <div>
                        <h3>{event.title}</h3>
                        <div className={styles.activityMeta}>
                          <span><Clock size={15} /> {formatEventTime(event.startsAt, event.endsAt)}</span>
                          <span><MapPin size={15} /> {event.location}</span>
                          <span><User size={15} /> {event.speaker}</span>
                          {event.workloadMinutes && (
                            <span><Calendar size={15} /> {formatWorkload(event.workloadMinutes)}</span>
                          )}
                        </div>
                      </div>

                      {eventAttendance && (
                        <span className={`${styles.badge} ${eventAttendance.checkOutAt ? styles.badgeSuccess : styles.badgeWarning}`}>
                          {eventAttendance.checkOutAt ? "Presença Concluída ✓" : "Check-in Realizado"}
                        </span>
                      )}
                    </div>

                    {session?.seriesId === s.id && (
                      <div className={styles.btnActionGroup}>
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          disabled={busy}
                          onClick={() => selectEventAndScan(event)}
                        >
                          <Camera size={16} />
                          {eventAttendance?.checkInAt && !eventAttendance.checkOutAt
                            ? "Escanear QR de Saída (Check-out)"
                            : "Entrar no evento e já escanear"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ))}
        </section>
      </div>
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
      {locationNotice}
    </main>
  );
}
