import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  visitorRequest,
  VisitorApiError,
  locate,
  type Series,
  type Visitor,
  type PublicQr,
  type VisitorCertificate,
} from "../../../api/events/visitor";
import styles from "./PublicEventsScreen.module.css";

export default function PublicEventsScreen({
  reference,
}: {
  reference?: string;
}) {
  const [search] = useSearchParams();
  const [confirmedReference, setConfirmedReference] = useState<string | null>(
    null,
  );
  const [series, setSeries] = useState<Series[]>([]),
    [session, setSession] = useState<Visitor | null>(null),
    [preview, setPreview] = useState<PublicQr | null>(null);
  const [selected, setSelected] = useState(search.get("edicao") || ""),
    [registration, setRegistration] = useState(""),
    [certificates, setCertificates] = useState<VisitorCertificate[]>([]);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failure, setFailure] = useState(""),
    [loading, setLoading] = useState(true);
  const current = series.find((s) => s.id === selected);
  const loadCertificates = async () =>
    setCertificates(
      await visitorRequest<VisitorCertificate[]>("visitor/certificates"),
    );
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
        if (reference) {
          try {
            qr = await visitorRequest<PublicQr>(
              `public/events/qr/${encodeURIComponent(reference)}`,
              undefined,
              controller.signal,
            );
            setPreview(qr);
          } catch (error) {
            if (controller.signal.aborted) throw error;
            setFailure(
              error instanceof Error
                ? error.message
                : "Faça uma nova leitura do QR.",
            );
          }
        }
        setSelected(
          (previous) => qr?.seriesId || previous || rows[0]?.id || "",
        );
        try {
          const visitor = await visitorRequest<Visitor>(
            "visitor/session",
            undefined,
            controller.signal,
          );
          setSession(visitor);
          setCertificates(
            await visitorRequest<VisitorCertificate[]>(
              "visitor/certificates",
              undefined,
              controller.signal,
            ),
          );
        } catch (error) {
          if (!(error instanceof VisitorApiError && error.status === 401))
            throw error;
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setFailure(
            error instanceof Error ? error.message : "Falha de conexão.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reference]);
  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      if (!document.hidden)
        void visitorRequest<Visitor>("visitor/session")
          .then(setSession)
          .catch((error) => {
            if (error instanceof VisitorApiError && error.status === 401) {
              setSession(null);
              setCertificates([]);
              setMessage("Seu acesso expirou. Confirme seu e-mail novamente.");
            }
          });
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
      }
    } finally {
      setBusy(false);
    }
  }
  const register = (form: HTMLFormElement) =>
    act(async () => {
      const data = new FormData(form);
      const result = await visitorRequest<{ registrationId: string }>(
        "visitor/registration",
        {
          seriesId: selected,
          name: String(data.get("name")),
          email: String(data.get("email")),
          course: String(data.get("course") || "") || undefined,
          cpf: String(data.get("cpf") || "") || undefined,
        },
      );
      setRegistration(result.registrationId);
      setMessage("Código enviado. Verifique também o spam.");
    });
  const verify = (form: HTMLFormElement) =>
    act(async () => {
      await visitorRequest("visitor/verify", {
        registrationId: registration,
        code: String(new FormData(form).get("code")),
      });
      setSession(await visitorRequest<Visitor>("visitor/session"));
      await loadCertificates();
      setRegistration("");
      setMessage(
        reference
          ? "Acesso confirmado. Se o QR venceu, faça uma nova leitura no telão."
          : "Acesso confirmado. Inscreva-se na atividade ou leia o QR no local.",
      );
    });
  const confirm = () =>
    act(async () => {
      if (!reference || !preview) return;
      // Atualiza a validade antes de pedir o GPS; o servidor valida novamente na gravação.
      await visitorRequest(`public/events/qr/${encodeURIComponent(reference)}`);
      let position;
      if (preview.locationRequired) {
        const challenge = await visitorRequest<{ challengeId: string }>(
          "visitor/challenge",
          { reference },
        );
        position = { ...(await locate()), challengeId: challenge.challengeId };
      }
      const result = await visitorRequest<{ message: string }>(
        "visitor/attendance",
        { reference, position },
      );
      setConfirmedReference(reference);
      setMessage(result.message);
      await loadCertificates();
    });
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
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/login">Acesso de aluno</Link>
        <p>FATEC ITAQUERA</p>
        <h1>Eventos e certificados</h1>
        <p>Participe como visitante, sem criar uma conta na carteirinha.</p>
      </header>
      <div className={styles.content}>
        {loading && <p role="status">Carregando eventos...</p>}
        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}
        {failure && (
          <p className={styles.error} role="alert">
            {failure}
          </p>
        )}
        {reference && preview && (
          <section className={styles.card}>
            <h2>{preview.event.title}</h2>
            <p>
              {preview.event.speaker} · {preview.event.location}
            </p>
            <p>
              {preview.checkpoint.type === "CHECK_IN" ? "Entrada" : "Saída"} ·
              QR de validade curta. Uma nova leitura será necessária se expirar.
            </p>
            {!preview.visitorsAllowed ? (
              <p>
                Esta atividade exige acesso de aluno.{" "}
                <Link
                  to="/login"
                  onClick={() =>
                    sessionStorage.setItem("returnUrl", `/p/${reference}`)
                  }
                >
                  Entrar como aluno
                </Link>
              </p>
            ) : session?.seriesId === preview.seriesId ? (
              <>
                <p>{session.name}</p>
                {preview.locationRequired && (
                  <p>
                    Sua localização será solicitada para comprovar proximidade.
                    Em caso de dificuldade, procure a Secretaria
                    presencialmente.
                  </p>
                )}
                <button
                  disabled={busy || confirmedReference === reference}
                  onClick={() => void confirm()}
                >
                  {busy
                    ? "Confirmando..."
                    : confirmedReference === reference
                      ? "Presença registrada"
                      : "Confirmar presença"}
                </button>
              </>
            ) : (
              <p>
                Identifique-se abaixo antes de confirmar. Nenhuma presença é
                registrada apenas ao abrir este link.
              </p>
            )}
          </section>
        )}
        {!session && (!preview || preview.visitorsAllowed) && (
          <section className={styles.card}>
            <h2>Identificação do visitante</h2>
            {registration ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void verify(e.currentTarget);
                }}
              >
                <label>
                  Código recebido por e-mail
                  <input
                    name="code"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </label>
                <button disabled={busy}>Confirmar e-mail</button>
                <button
                  type="button"
                  disabled={busy}
                  className={styles.secondary}
                  onClick={() => setRegistration("")}
                >
                  Solicitar outro código
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void register(e.currentTarget);
                }}
              >
                <label>
                  Edição
                  <select
                    required
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {series.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nome completo
                  <input
                    name="name"
                    required
                    minLength={3}
                    maxLength={160}
                    autoComplete="name"
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
                  />
                </label>
                <label>
                  Curso ou vínculo
                  <select name="course">
                    <option value="">Visitante — Participante/ouvinte</option>
                    {current?.courses.map((course) => (
                      <option key={course}>{course}</option>
                    ))}
                  </select>
                </label>
                {current?.cpfRequired && (
                  <label>
                    CPF solicitado pela organização
                    <input
                      name="cpf"
                      required
                      inputMode="numeric"
                      minLength={11}
                      maxLength={14}
                      autoComplete="off"
                    />
                    <span>
                      Usado somente para conferir duplicidade; não será impresso
                      no certificado.
                    </span>
                  </label>
                )}
                <p>
                  Usaremos seus dados para presença e emissão. Contatos e acesso
                  temporário serão eliminados após o prazo da edição; o nome e o
                  certificado permanecerão no histórico mínimo.
                </p>
                <button disabled={busy || !selected}>
                  {busy ? "Enviando..." : "Receber código de acesso"}
                </button>
              </form>
            )}
          </section>
        )}
        {session && (
          <section className={styles.card}>
            <h2>Olá, {session.name}</h2>
            <p>
              Baixe seus certificados até{" "}
              {new Date(session.retentionAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}{" "}
              (horário de Brasília). A verificação por código continuará
              disponível.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                disabled={busy}
                onClick={() => void act(loadCertificates)}
              >
                Atualizar certificados
              </button>
              <button
                className={styles.secondary}
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    await visitorRequest("visitor/logout", {});
                    setSession(null);
                    setCertificates([]);
                  })
                }
              >
                Sair do acesso de visitante
              </button>
            </div>
            {!certificates.length && (
              <p>Seus certificados aparecerão após a confirmação de saída.</p>
            )}
            {certificates.map((cert) => (
              <article className={styles.activity} key={cert.id}>
                <h3>{cert.event.title}</h3>
                <p>
                  {cert.revokedAt
                    ? "Revogado"
                    : cert.artifact?.state === "READY"
                      ? "Disponível"
                      : "Em processamento"}
                </p>
                <div className={styles.actions}>
                  <button
                    disabled={
                      busy ||
                      Boolean(cert.revokedAt) ||
                      cert.artifact?.state !== "READY"
                    }
                    onClick={() => void act(() => download(cert.id))}
                  >
                    Baixar PDF
                  </button>
                  <Link to={`/certificado/verificar/${cert.verificationCode}`}>
                    Verificar certificado
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
        <section className={styles.card}>
          <h2>Programação</h2>
          {!series.length && !loading && (
            <p>Nenhuma edição aberta no momento.</p>
          )}
          {series.map((s) => (
            <section key={s.id}>
              <h3>{s.title}</h3>
              {s.events.map((event) => (
                <article key={event.id} className={styles.activity}>
                  <h3>{event.title}</h3>
                  <p>
                    {new Date(event.startsAt).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}{" "}
                    · {event.location}
                  </p>
                  <p>{event.speaker}</p>
                  {session?.seriesId === s.id && (
                    <button
                      disabled={busy}
                      className={styles.secondary}
                      onClick={() =>
                        void act(async () => {
                          await visitorRequest(
                            `visitor/enroll/${event.id}`,
                            {},
                          );
                          setMessage(
                            "Inscrição salva. Registre entrada e saída pelos QR Codes no local.",
                          );
                        })
                      }
                    >
                      Inscrever-se nesta atividade
                    </button>
                  )}
                </article>
              ))}
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
