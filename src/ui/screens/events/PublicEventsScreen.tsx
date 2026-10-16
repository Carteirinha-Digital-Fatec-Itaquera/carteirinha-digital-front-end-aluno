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
  const activeReferenceParam = reference || search.get("ref") || search.get("reference") || "";
  const eventIdParam = search.get("evento") || search.get("id");

  const [confirmedReference, setConfirmedReference] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState<string>(activeReferenceParam);
  const [series, setSeries] = useState<Series[]>([]);
  const [session, setSession] = useState<Visitor | null>(null);
  const [attendances, setAttendances] = useState<VisitorAttendance[]>([]);
  const [certificates, setCertificates] = useState<VisitorCertificate[]>([]);
  const [preview, setPreview] = useState<PublicQr | null>(null);

  const [selected, setSelected] = useState(search.get("edicao") || "");
  const [registration, setRegistration] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);

  const eventCardRef = useRef<HTMLDivElement | null>(null);

  const current = series.find((s) => s.id === (preview?.seriesId || selected));

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

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const rows = await visitorRequest<Series[]>(
          "public/events/series",
          undefined,
          controller.signal,
        );
        setSeries(rows);

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
          } catch (error) {
            if (controller.signal.aborted) throw error;
            setFailure(
              error instanceof Error
                ? error.message
                : "QR Code expirado ou inválido. Faça uma nova leitura no telão.",
            );
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
          } catch (error) {
            if (controller.signal.aborted) throw error;
            setFailure(
              error instanceof Error
                ? error.message
                : "Evento não encontrado ou indisponível.",
            );
          }
        }

        setSelected((previous) => qr?.seriesId || previous || rows[0]?.id || "");

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
          setFailure(
            error instanceof Error ? error.message : "Falha de conexão com o servidor.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [activeReferenceParam, eventIdParam, loadCertificates, loadAttendances]);

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
      setFailure(error instanceof Error ? error.message : "Falha de conexão.");
      if (error instanceof VisitorApiError && error.status === 401) {
        setSession(null);
        setCertificates([]);
        setAttendances([]);
      }
    } finally {
      setBusy(false);
    }
  }

  const register = (form: HTMLFormElement) =>
    act(async () => {
      const data = new FormData(form);
      const targetSeriesId = preview?.seriesId || selected;
      if (!targetSeriesId) {
        setFailure("Selecione uma edição para continuar.");
        return;
      }
      const result = await visitorRequest<{ registrationId: string }>(
        "visitor/registration",
        {
          seriesId: targetSeriesId,
          name: String(data.get("name")),
          email: String(data.get("email")),
          course: String(data.get("course") || "") || undefined,
          cpf: String(data.get("cpf") || "") || undefined,
        },
      );
      setRegistration(result.registrationId);
      setMessage("Código de 6 dígitos enviado ao seu e-mail. Verifique também o spam.");
    });

  const verify = (form: HTMLFormElement) =>
    act(async () => {
      await visitorRequest("visitor/verify", {
        registrationId: registration,
        code: String(new FormData(form).get("code")),
      });
      const currentVisitor = await visitorRequest<Visitor>("visitor/session");
      setSession(currentVisitor);
      await Promise.all([loadCertificates(), loadAttendances()]);
      setRegistration("");
      setMessage(
        activeReference
          ? "Identificação concluída! Clique em Confirmar presença abaixo ou faça nova leitura."
          : "Identificação confirmada! Selecione uma atividade para escanear a presença.",
      );
    });

  const confirmPresence = (refToConfirm: string) =>
    act(async () => {
      const targetRef = refToConfirm || activeReference;
      if (!targetRef) return;

      const latestQr = await visitorRequest<PublicQr>(`public/events/qr/${encodeURIComponent(targetRef)}`);
      setPreview(latestQr);

      let position;
      if (latestQr.locationRequired) {
        const challenge = await visitorRequest<{ challengeId: string }>(
          "visitor/challenge",
          { reference: targetRef },
        );
        position = { ...(await locate()), challengeId: challenge.challengeId };
      }

      const result = await visitorRequest<{ message: string; type?: string }>(
        "visitor/attendance",
        { reference: targetRef, position },
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
        setFailure("QR Code não reconhecido. Certifique-se de escanear o QR Code exibido no telão.");
        setBusy(false);
        return;
      }

      try {
        const qr = await visitorRequest<PublicQr>(`public/events/qr/${encodeURIComponent(scannedRef)}`);
        setPreview(qr);
        setActiveReference(scannedRef);
        setConfirmedReference(null);

        // Se o visitante já tem sessão válida nesta edição, confirma presença imediatamente
        if (session && qr.seriesId === session.seriesId) {
          let position;
          if (qr.locationRequired) {
            const challenge = await visitorRequest<{ challengeId: string }>(
              "visitor/challenge",
              { reference: scannedRef },
            );
            position = { ...(await locate()), challengeId: challenge.challengeId };
          }

          const result = await visitorRequest<{ message: string }>(
            "visitor/attendance",
            { reference: scannedRef, position },
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
        setFailure(error instanceof Error ? error.message : "Erro ao processar QR Code.");
      } finally {
        setBusy(false);
      }
    },
    [session, loadCertificates, loadAttendances],
  );

  const selectEventAndScan = (event: { id: string; title: string; speaker: string; location: string; startsAt: string; description?: string | null }) => {
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
        {preview && (
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
                          to={`/eventos/${preview.event.id}/avaliacao?title=${encodeURIComponent(preview.event.title)}`}
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
                    setRegistration("");
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
        {(!session || (preview && session.seriesId !== preview.seriesId)) && (!preview || preview.visitorsAllowed) && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Identificação rápida do visitante</h2>
                <p>Informe seus dados uma única vez para registrar presença e emitir certificados.</p>
              </div>
            </div>

            {registration ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void verify(e.currentTarget);
                }}
              >
                <label>
                  Código de 6 dígitos recebido por e-mail
                  <input
                    name="code"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Ex: 123456"
                  />
                </label>
                <div className={styles.btnActionGroup}>
                  <button className={styles.btnPrimary} disabled={busy}>
                    <CheckCircle2 size={18} />
                    Confirmar e-mail e entrar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className={styles.btnSecondary}
                    onClick={() => setRegistration("")}
                  >
                    Solicitar outro código
                  </button>
                </div>
              </form>
            ) : (
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
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="exemplo@email.com"
                  />
                </label>

                <label>
                  Vínculo ou curso
                  <select name="course">
                    <option value="">Visitante — Participante/ouvinte externo</option>
                    {current?.courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </label>

                {current?.cpfRequired && (
                  <label>
                    CPF (solicitado pela organização desta edição)
                    <input
                      name="cpf"
                      required
                      inputMode="numeric"
                      minLength={11}
                      maxLength={14}
                      autoComplete="off"
                      placeholder="Somente números"
                    />
                  </label>
                )}

                <div className={styles.btnActionGroup}>
                  <button
                    className={styles.btnPrimary}
                    disabled={busy || !(preview?.seriesId || selected)}
                  >
                    {busy ? "Enviando..." : "Receber código de acesso por e-mail"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Painel do Visitante logado: Certificados e Sessão */}
        {session && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Olá, {session.name}</h2>
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

          {!series.length && !loading && (
            <p>Nenhuma edição aberta no momento.</p>
          )}

          {series.map((s) => (
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
    </main>
  );
}
