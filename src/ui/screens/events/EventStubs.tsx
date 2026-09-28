import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';

import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  QrCode,
  TicketCheck,
  TriangleAlert,
} from 'lucide-react';

import type { Event } from '../../../domains/Event';
import type { Attendance } from '../../../domains/Attendance';
import type { Certificate } from '../../../domains/Certificate';

import { eventService } from '../../../services/eventService';

import styles from './style.module.css';


/* =========================================================
   LAYOUT BASE
========================================================= */

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

function PageLayout({
  title,
  subtitle,
  icon,
  children,
}: PageLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <div className={styles.headerArea}>
          <header className={styles.header}>

            <Link
              to="/MainMenu"
              className={styles.backLink}
            >
              <ArrowLeft size={17} strokeWidth={2} />
              Voltar ao menu
            </Link>

            <div className={styles.headerIdentity}>
              {icon && (
                <div className={styles.headerIcon}>
                  {icon}
                </div>
              )}

              <span className={styles.badge}>
                Carteirinha Digital
              </span>
            </div>

            <h1>{title}</h1>

            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}

          </header>
        </div>

        <section className={styles.content}>
          {children}
        </section>

      </div>
    </main>
  );
}


function useData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setError(false);

    load()
      .then((value) => {
        if (active) {
          setData(value);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [load]);

  return {
    data,
    error,
  };
}


function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className={styles.message}
      role="status"
    >
      <LoaderCircle
        size={18}
        className={styles.loadingIcon}
      />

      <span>{text}</span>
    </div>
  );
}


function ErrorState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className={styles.messageError}
      role="alert"
    >
      <TriangleAlert size={18} />
      <span>{text}</span>
    </div>
  );
}


const loadEvents = (): Promise<[Event[], Attendance[]]> =>
  Promise.all([
    eventService.getEvents(),
    eventService.getMyAttendances(),
  ]);


export function EventsStub() {
  const { data, error } = useData(loadEvents);

  const events = data?.[0] ?? [];
  const attendances = data?.[1] ?? [];

  return (
    <PageLayout
      title="Eventos & Palestras"
      subtitle="Descubra as atividades disponíveis e acompanhe suas participações acadêmicas."
      icon={
        <CalendarDays
          size={22}
          strokeWidth={1.8}
        />
      }
    >

      {error ? (
        <ErrorState text="Não foi possível carregar os eventos e presenças." />
      ) : !data ? (
        <LoadingState text="Carregando eventos..." />
      ) : (
        <>

          {/* RESUMO */}

          <section className={styles.summaryGrid}>

            <article className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <CalendarDays size={19} />
              </div>

              <div>
                <span className={styles.summaryNumber}>
                  {events.length}
                </span>

                <span className={styles.summaryLabel}>
                  Eventos disponíveis
                </span>
              </div>
            </article>


            <article className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <CheckCircle2 size={19} />
              </div>

              <div>
                <span className={styles.summaryNumber}>
                  {attendances.length}
                </span>

                <span className={styles.summaryLabel}>
                  Participações registradas
                </span>
              </div>
            </article>

          </section>


          {/* EVENTOS */}

          <section className={styles.section}>

            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Agenda acadêmica
                </span>

                <h2>Próximos eventos</h2>
              </div>

              <span className={styles.sectionCount}>
                {events.length}
              </span>
            </div>


            {events.length === 0 ? (
              <div className={styles.emptyState}>
                <CalendarDays size={34} />

                <h2>Nenhum evento disponível</h2>

                <p>
                  Quando novos eventos forem publicados,
                  eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className={styles.cardList}>

                {events.map((event) => (
                  <article
                    key={event.id}
                    className={styles.eventCard}
                  >

                    <div className={styles.eventCardTop}>

                      <span className={styles.eventTag}>
                        Evento
                      </span>

                      <CalendarDays
                        size={18}
                        className={styles.eventCardIcon}
                      />

                    </div>

                    <h3>
                      {event.title}
                    </h3>

                    {'description' in event &&
                      event.description && (
                        <p>
                          {String(event.description)}
                        </p>
                      )}

                  </article>
                ))}

              </div>
            )}

          </section>

        </>
      )}


      {/* AÇÃO */}

      <div className={styles.actionsArea}>

        <Link
          to="/eventos/scanner"
          className={styles.primaryButton}
        >
          <QrCode size={18} />
          Registrar presença
        </Link>

        <p className={styles.actionHint}>
          Use o QR Code disponibilizado no evento para registrar sua participação.
        </p>

      </div>

    </PageLayout>
  );
}



export function CertificatesStub() {
  const { data, error } = useData<Certificate[]>(
    eventService.getMyCertificates
  );

  const certificates = data ?? [];

  return (
    <PageLayout
      title="Meus Certificados"
      subtitle="Consulte os certificados conquistados por meio das suas participações."
      icon={
        <Award
          size={22}
          strokeWidth={1.8}
        />
      }
    >

      {error ? (
        <ErrorState text="Não foi possível carregar os certificados." />
      ) : !data ? (
        <LoadingState text="Carregando certificados..." />
      ) : certificates.length === 0 ? (

        <div className={styles.emptyState}>

          <Award size={38} />

          <h2>
            Nenhum certificado disponível
          </h2>

          <p>
            Seus certificados aparecerão aqui assim que forem
            liberados após a participação nos eventos.
          </p>

          <Link
            to="/eventos"
            className={styles.secondaryButton}
          >
            Ver eventos disponíveis
          </Link>

        </div>

      ) : (
        <>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                Histórico acadêmico
              </span>

              <h2>
                Certificados disponíveis
              </h2>
            </div>

            <span className={styles.sectionCount}>
              {certificates.length}
            </span>
          </div>


          <div className={styles.cardList}>

            {certificates.map((certificate) => (

              <Link
                key={certificate.id}
                to={`/certificado/${certificate.id}`}
                className={styles.certificateCard}
              >

                <div className={styles.certificateIcon}>
                  <Award size={22} />
                </div>


                <div className={styles.certificateContent}>

                  <span className={styles.eventTag}>
                    Certificado
                  </span>

                  <h3>
                    {certificate.eventTitle}
                  </h3>

                  <p>
                    Visualizar informações do certificado
                  </p>

                </div>


                <span className={styles.arrow}>
                  <ChevronRight size={18} />
                </span>

              </Link>

            ))}

          </div>

        </>
      )}

    </PageLayout>
  );
}


export function ScannerStub() {
  return (
    <PageLayout
      title="Registrar presença"
      subtitle="Use o QR Code disponibilizado no evento para confirmar sua participação."
      icon={
        <QrCode
          size={22}
          strokeWidth={1.8}
        />
      }
    >

      <div className={styles.scannerCard}>

        <div className={styles.scannerPlaceholder}>

          <div className={styles.scannerCorners}>
            <QrCode
              size={58}
              strokeWidth={1.4}
            />
          </div>

        </div>


        <span className={styles.scannerStatus}>
          Scanner
        </span>

        <h2>
          Leitura de QR Code
        </h2>

        <p>
          A navegação para o registro de presença já está preparada.
          A integração com a câmera será adicionada em uma próxima etapa.
        </p>


        <div className={styles.scannerInfo}>

          <TicketCheck size={19} />

          <span>
            O QR Code será usado para identificar o evento
            e registrar sua participação.
          </span>

        </div>

      </div>


      <div className={styles.actionsArea}>

        <Link
          to="/eventos"
          className={styles.secondaryButton}
        >
          <ArrowLeft size={17} />
          Voltar aos eventos
        </Link>

      </div>

    </PageLayout>
  );
}


export function CertificateStub() {
  const { id } = useParams();

  return (
    <PageLayout
      title="Detalhes do certificado"
      subtitle="Confira as informações relacionadas ao certificado selecionado."
      icon={
        <Award
          size={22}
          strokeWidth={1.8}
        />
      }
    >

      <article className={styles.certificateDetail}>

        <div className={styles.certificateDetailHeader}>

          <div className={styles.certificateLargeIcon}>
            <Award size={30} />
          </div>

          <div>

            <span className={styles.eventTag}>
              Certificado
            </span>

            <h2>
              Certificado de participação
            </h2>

          </div>

        </div>


        <div className={styles.detailDivider} />


        <div className={styles.detailField}>

          <span className={styles.certificateId}>
            Identificador do certificado
          </span>

          <code>
            {id}
          </code>

        </div>


        <div className={styles.infoBox}>

          <CheckCircle2 size={19} />

          <p>
            Este certificado está vinculado à sua participação
            em um evento acadêmico.
          </p>

        </div>


        <p className={styles.infoText}>
          A emissão e o download do certificado em PDF serão
          integrados em uma próxima etapa do projeto.
        </p>

      </article>


      <div className={styles.actionsArea}>

        <Link
          to="/certificados"
          className={styles.secondaryButton}
        >
          <ArrowLeft size={17} />
          Voltar aos certificados
        </Link>

      </div>

    </PageLayout>
  );
}