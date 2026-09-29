import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from './EventsPageLayout';

import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  QrCode,
  TicketCheck,
  TriangleAlert,
} from 'lucide-react';

import type { Certificate } from '../../../domains/Certificate';

import { eventService } from '../../../services/eventService';

import styles from './style.module.css';


/* =========================================================
   LAYOUT BASE
========================================================= */

function useData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;


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