import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft,AlertCircle } from "lucide-react";

import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";

import { findProfile } from "../../../api/student/findProfile";
import type { Student } from "../../../domains/Student";
import styles from './style.module.css';
import { formatDateBR } from "../../../utils/dateProcessing";

const logoFatecPreto = '/fatec_itaquera_logo_preto.png';
// const logoFatecBranco = '/fatec_itaquera_logo_branco.png';
const logoCps = '/logos_cps_governo_com_slogan_horizontal_cor.png';
// const logoCpsBranco = '/logos_cps_governo_com_slogan_horizontal_branco.png';
// const logoSaoPauloBranco = '/logo_sao_paulo_governo_branco.png'; 
const perfilDefault = '/images/perfil_default.png';

function BarcodeMock() {
  return (
    <div className={styles.barcodeContainer}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
          key={i} 
          className={styles.barcodeLine} 
          style={{ 
            width: i % 4 === 0 ? '3px' : '1px',
            marginRight: '1px',
            opacity: i % 7 === 0 ? 0.5 : 1
          }} 
        />
      ))}
    </div>
  );
}

export default function DigitalStudentCardScreen() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const cacheImageForOffline = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => localStorage.setItem('@Carteirinha:photoOffline', reader.result as string);
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error("Erro ao salvar imagem para uso offline", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      const cached = localStorage.getItem('@Carteirinha:profile');
      if (cached) setStudent(JSON.parse(cached));

      if (navigator.onLine) {
        const result = await findProfile();
        if (result && !('code' in result)) {
          const s = result as Student;
          setStudent(s);
          setMessage("");
          localStorage.setItem('@Carteirinha:profile', JSON.stringify(s));
          if (s.photo && s.photoStatus === 'APPROVED') cacheImageForOffline(s.photo);
        }
      }
    };
    load();
  }, []);

  if (!student) return <div className={styles.loadingContainer}>Carregando...</div>;

  const isPhotoApproved = student.photo && student.photoStatus === 'APPROVED';

  const studentStatus = student.status || "Em curso";
  const validationUrl = `${window.location.origin}/valida/${student?.qrcode || ''}`;
  const photoSrc = student.photo && student.photoStatus === 'APPROVED' ? student.photo : perfilDefault;

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("curso") || s.includes("ativo") || s.includes("concluido")) return "#2ecc71";
    if (s.includes("trancado")) return "#f39c12";
    return "#BA1A1A";
  };


  
  return (
    <div className={styles.container}>
      <ErrorModalComp
        visible={modalErrorVisible}
        error={message}
        onClose={() => { setModalErrorVisible(false); navigate("/MainMenu"); }}
      />

      <div className={styles.appWrapper}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>
            <ArrowLeft size={24} color="#BA1A1A" strokeWidth={3} />
          </button>
          <span className={styles.headerTitle}>Carteirinha</span>
          <div style={{ width: 44 }} />
        </header>

        <InternetWatcher />

        <div className={styles.cardStage}>
          <div
            className={`${styles.cardViewport} ${showBack ? styles.cardViewportBack : ''}`}
            onClick={() => setShowBack(!showBack)}
          >
            <div className={styles.cardInner}>
              
              <div className={`${styles.cardFace} ${styles.faceFront}`}>
                <div className={styles.frontBlock1}>
                  <img src={logoFatecPreto} className={styles.fatecLogoFront} alt="Fatec" />
                </div>

                <div className={styles.frontBlock2}>
                  <div className={styles.photoColumn}>
                    <div className={styles.photoFrame}>
                      <img src={photoSrc} alt="Perfil" onError={(e) => e.currentTarget.src = perfilDefault} />
                    </div>
                  </div>
                  
                  <div className={styles.infoColumn}>
                    <label className={styles.labelWhite}>NOME DO ALUNO</label>
                    <h2 className={styles.studentName}>{student.name}</h2>
                    <p className={styles.courseName}>Curso: {student.course}</p>

                    <div className={styles.dataGrid}>
                      <div className={styles.dataItem}>
                        <label>RA: {student.ra}</label>
                      </div>
                      <div className={styles.dataItem}>
                        <label>VAL: {formatDateBR(student.dueDate)}</label>
                      </div>
                      <div className={styles.dataItem}>
                        <label>Data Nascimento: {formatDateBR(student.birthDate)}</label>
                      </div>
                      <div className={styles.dataItem}>
                        <label>CPF: {student.cpf}</label>
                      </div>
                    </div>

                    <div className={styles.statusBox}>
                      <span className={styles.statusPill} style={{ backgroundColor: getStatusColor(studentStatus) }}>
                        {studentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.frontBlock3}>
                  <img src={logoCps} alt="CPS" className={styles.footerLogo} />
                  {/* <img src={logoSaoPaulo} alt="SP" className={styles.footerLogo} /> */}
                </div>
              </div>

              <div className={`${styles.cardFace} ${styles.faceBack}`}>
                <div className={styles.backBlock1}>
                  <div className={styles.backHeader}>
                    <img src={logoFatecPreto} alt="Fatec" className={styles.logoFatecBack} />
                    {/* <img src={logoCpsBranco} alt="CPS" className={styles.logoCpsBack} /> */}
                  </div>

                  <div className={styles.backMainRow}>
                    <div className={styles.institutionBox}>
                      {/* <p className={styles.instTitle}>FATEC ITAQUERA</p> */}
                      <div className={styles.backInfoCard}>
                        <p className={styles.instSub}>Faculdade de Tecnologia Itaquera - Prof. Miguel Reale</p>
                        <p className={styles.instSub}>Av. Miguel Ignácio Curi, 360 - Itaquera/SP | CEP: 08295-005</p>
                        <p className={styles.instSub}> Tel: (11) 2056-4347 | 2058-4245</p>
                      </div>
                      <div className={styles.instructions}>
                        <p><span>›</span> Documento pessoal e intransferível</p>
                        <p><span>›</span> Validação via QR Code</p>
                      </div>
                    </div>
                    <div className={styles.qrContainer}>
                      {/* <QRCodeSVG value={validationUrl} size={100} /> */}
                      {isPhotoApproved ? (
                        <QRCodeSVG value={validationUrl} size={100} />
                      ) : (
                        <div className={styles.qrBlocked}>
                          <AlertCircle size={30} color="#BA1A1A" />
                          <span>Foto Pendente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.backBlock2}>
                  <p className={styles.backUrl}>https://www.cps.sp.gov.br</p>
                  <BarcodeMock />
                </div>
              </div>

            </div>
          </div>
        </div>

        <p className={styles.flipHint}>Toque para virar a carteirinha</p>
        <div className={styles.dotsRow}>
          <div className={`${styles.dot} ${!showBack ? styles.dotActive : ''}`} />
          <div className={`${styles.dot} ${showBack ? styles.dotActive : ''}`} />
        </div>
      </div>
    </div>
  );
}