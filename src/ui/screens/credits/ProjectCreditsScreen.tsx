import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { getProjectCredits } from "../../../api/projectCredits/projectCreditsService";
import type {
  ProjectCreditContributor,
  ProjectCreditsResponse,
} from "../../../domains/ProjectCredits";
import { isApprovedProjectCreditHref } from "../../../utils/projectCreditContact";
import EventsPageLayout from "../events/EventsPageLayout";
import { ErrorState, LoadingState } from "../events/ResourceState";
import eventStyles from "../events/style.module.css";
import styles from "./styleProjectCredits.module.css";

function formatSemester(semester: string): string {
  const match = /^(\d{4})\.([12])$/.exec(semester);
  if (!match) return semester;
  return match[2] + "º semestre de " + match[1];
}

function sortSemesters(semesters: string[]): string[] {
  return [...new Set(semesters)].sort((left, right) =>
    right.localeCompare(left),
  );
}

function ProjectsCreditsList({
  contributors,
  semester,
}: {
  contributors: ProjectCreditContributor[];
  semester: string;
}) {
  const visibleContributors = contributors.filter(
    (person) =>
      semester === "all" ||
      person.participations.some(
        (participation) => participation.semester === semester,
      ),
  );

  if (visibleContributors.length === 0) {
    return (
      <section className={eventStyles.emptyState} aria-live="polite">
        <UsersRound size={40} aria-hidden="true" />
        <h2>Créditos em organização</h2>
        <p>
          A lista histórica será publicada depois de validarmos as participações
          de cada semestre.
        </p>
      </section>
    );
  }

  return (
    <div className={styles.list}>
      {visibleContributors.map((person) => {
        const participations = person.participations.filter(
          (participation) =>
            semester === "all" || participation.semester === semester,
        );

        return (
          <article className={styles.card} key={person.id}>
            <div className={styles.avatar} aria-hidden="true">
              {person.name.trim().charAt(0).toLocaleUpperCase("pt-BR")}
            </div>
            <div className={styles.cardContent}>
              <h2>{person.name}</h2>
              {participations.map((participation) => (
                <section
                  className={styles.participation}
                  key={participation.semester}
                >
                  <h3>{formatSemester(participation.semester)}</h3>
                  <ul className={styles.roles} aria-label="Papéis no projeto">
                    {participation.roles.map((role) => (
                      <li key={role}>{role}</li>
                    ))}
                  </ul>
                  {participation.contribution && (
                    <p>{participation.contribution}</p>
                  )}
                </section>
              ))}
              {person.contacts.some(isApprovedProjectCreditHref) && (
                <nav
                  className={styles.contacts}
                  aria-label={"Contatos profissionais de " + person.name}
                >
                  {person.contacts
                    .filter(isApprovedProjectCreditHref)
                    .map((contact) => (
                      <a
                        key={contact.href}
                        className={styles.contactLink}
                        href={contact.href}
                        {...(contact.kind === "email"
                          ? {}
                          : { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {contact.label}
                      </a>
                    ))}
                </nav>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function ProjectCreditsScreen() {
  const location = useLocation();
  const requestedReturn = (location.state as { from?: unknown } | null)?.from;
  const backTo =
    typeof requestedReturn === "string" &&
    ["/MainMenu", "/Help"].includes(requestedReturn)
      ? requestedReturn
      : "/login";
  const [resource, setResource] = useState<ProjectCreditsResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void getProjectCredits(controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setResource(response);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const semesters = useMemo(
    () =>
      sortSemesters(
        (resource?.contributors ?? []).flatMap((person) =>
          person.participations.map((item) => item.semester),
        ),
      ),
    [resource],
  );
  const [semester, setSemester] = useState("all");
  const retry = () => {
    setLoading(true);
    setError(false);
    setAttempt((current) => current + 1);
  };

  return (
    <EventsPageLayout
      title="Créditos do projeto"
      subtitle="Cada semestre deixa sua marca na Carteirinha Digital. Conheça quem ajudou a construir este projeto."
      icon={<UsersRound size={22} aria-hidden="true" />}
      backTo={backTo}
      backLabel={backTo === "/login" ? "Voltar para o login" : "Voltar"}
      className={eventStyles.eventsPage}
    >
      <section
        className={styles.headingSurface}
        aria-labelledby="credits-history-title"
      >
        <div className={styles.heading}>
          <div>
            <span
              className={
                eventStyles.sectionEyebrow + " " + styles.sectionEyebrow
              }
            >
              Nossa história
            </span>
            <h2 id="credits-history-title">Quem constrói o projeto</h2>
          </div>
          <p>
            Reconhecemos pessoas e contribuições de diferentes etapas do
            projeto.
          </p>
        </div>
      </section>

      {semesters.length > 0 && (
        <div
          className={styles.filters}
          role="group"
          aria-label="Filtrar créditos por semestre"
        >
          <button
            type="button"
            aria-pressed={semester === "all"}
            onClick={() => setSemester("all")}
          >
            Todos os semestres
          </button>
          {semesters.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={semester === value}
              onClick={() => setSemester(value)}
            >
              {formatSemester(value)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingState text="Carregando créditos do projeto..." />
      ) : error ? (
        <ErrorState
          text="Não foi possível carregar os créditos. Confira sua conexão e tente novamente."
          onRetry={retry}
        />
      ) : (
        <ProjectsCreditsList
          contributors={resource?.contributors ?? []}
          semester={semester}
        />
      )}

      <p className={styles.footerNote}>
        Quer atualizar sua participação ou compartilhar um contato profissional?
        A equipe confirma cada informação antes da publicação.
      </p>
      <Link className={styles.homeLink} to="/login">
        Carteirinha Digital FATEC Itaquera
      </Link>
    </EventsPageLayout>
  );
}
