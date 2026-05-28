import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, AlertCircle } from "lucide-react"; 

import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";

import { findProfile } from "../../../api/student/findProfile";
import type { Student } from "../../../domains/Student";
import styles from './styleQrCode.module.css';

const logoFatec = '/fatec_itaquera_logo.png'
const logoCps = '/logos_cps_governo_com_slogan.png'
const iconScan = '/iconScan.png'



export default function DigitalStudentQrCode() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  
  const cacheImageForOffline = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        localStorage.setItem('@Carteirinha:photoOffline', reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Erro ao salvar imagem para uso offline", error);
    }
  };

  useEffect(() => {
    const loadStudent = async () => {
      const cachedData = localStorage.getItem('@Carteirinha:profile');
      if (cachedData) {
        setStudent(JSON.parse(cachedData));
      }
      if (navigator.onLine) {
        const result = await findProfile();
        
        if (result && !('code' in result)) {
          const freshStudent = result as Student;
          setStudent(freshStudent);
          localStorage.setItem('@Carteirinha:profile', JSON.stringify(freshStudent));
          setMessage('Certo')
          if (freshStudent.photo && freshStudent.photoStatus === 'APPROVED') {
            cacheImageForOffline(freshStudent.photo);
          }
        }
      }
    };

    loadStudent();
  }, []);

  if (!student) {
    return <div className={styles.loadingContainer}>Carregando...</div>;
  }

  const validationUrl = `${window.location.origin}/valida/${student?.qrcode || ''}`;
  console.log(`${student.qrcode}`)
  const isPhotoApproved = student.photo && student.photoStatus === 'APPROVED';

  return (
    <div className={styles.container}>
      <ErrorModalComp
        visible={modalErrorVisible}
        error={message}
        fields={[]}
        onClose={() => {
          setModalErrorVisible(false);
          navigate("/MainMenu");
        }}
      />

      <div className={styles.appWrapper}>
        <div className={styles.redHeader}>
          <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>
            <ArrowLeft size={24} color="#FFF" strokeWidth={3} />
          </button>
          <img src={logoFatec} className={styles.logoTop} alt="Logo Fatec" />
        </div>
        
        <div className={styles.contentWrapper}>
          <div className={styles.cardContainer}>
            <InternetWatcher />
            
            <h1 className={styles.mainTitle}>Validação da Carteirinha</h1>

            <div className={styles.qrViewportContainer}>
              <div className={styles.qrCornerTopLeft} />
              <div className={styles.qrCornerTopRight} />
              <div className={styles.qrCornerBottomLeft} />
              <div className={styles.qrCornerBottomRight} />

              <div className={styles.qrWrapper}>
                {isPhotoApproved ? (
                  <QRCodeSVG 
                    value={validationUrl} 
                    size={256} 
                    style={{ width: '100%', height: '100%' }}
                    includeMargin={false} 
                  />
                ) : (
                  <div className={styles.qrBlocked}>
                    <AlertCircle size={36} color="#BA1A1A" />
                    <span>Foto Pendente</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoInstructionRow}>
              <img src={iconScan} alt="Ícone de Leitura" className={styles.scanIcon} />
              <p className={styles.instructionText}>
                Leia o QRCode para validar sua carteirinha digital
              </p>
            </div>
          </div>
        </div>

        {/* BLOCO 3: Rodapé com as marcas institucionais em branco */}
        <footer className={styles.footerLogos}>
          <img src={logoCps} alt="Logo CPS" className={styles.footerLogoImg} />
          {/* <img src={logoSaoPauloBranco} alt="Logo SP" className={styles.footerLogoImg} /> */}
        </footer>
      </div>
    </div>
  );
}