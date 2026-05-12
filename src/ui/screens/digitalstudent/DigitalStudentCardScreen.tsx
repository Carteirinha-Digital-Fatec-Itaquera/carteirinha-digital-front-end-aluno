import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";
// import {Qrdcode}

import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";


// import logoFatecPreto from "../../../assets/images/fatec_itaquera_logo_preto.png";
const logoFatecPreto = '/fatec_itaquera_logo_preto.png'
// import logoCps from "../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png";
const logoCps = '/logos_cps_governo_com_slogan_horizontal_cor.png'
// import perfilDefault from "../../../assets/images/perfil_default.png";
const perfilDefault = '/images/perfil_default.png'

import { findProfile } from "../../../api/student/findProfile";
import type { Student } from "../../../domains/Student";
// import { GLOBAL_VAR } from "../../../api/config/globalVar";
import styles from './style.module.css';
import { ArrowLeft } from "lucide-react"; 

export default function DigitalStudentCardScreen() {
  const navigate = useNavigate();

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

  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);

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
        setMessage('erro ao procurar imagem')
        localStorage.setItem('@Carteirinha:profile', JSON.stringify(freshStudent));
        
        if (freshStudent.photo && freshStudent.photoStatus === 'APPROVED') {
          cacheImageForOffline(freshStudent.photo);
        }
      }
    }
  };

  loadStudent();
}, []);
  // useEffect(() => {
  //   const loadStudent = async () => {
  //     const result = await findProfile();
  //     if (result && 'code' in result) {
  //       setMessage(result.message);
  //       setModalErrorVisible(true);
  //     } else {
  //       setStudent(result as Student);
  //     }
  //   };
  //   loadStudent();
  // }, []);

  if (!student) {
    return <div className={styles.loadingContainer}>Carregando...</div>;
  }

  const studentStatus = student.status || "Em curso"; 

  // const validationUrl = `http://localhost:5173/valida/${student?.qrcode || 'local'}`;


  const validationUrl = `${window.location.origin}/valida/${student?.qrcode || ''}`;

  console.log("Link do QR Code:", validationUrl);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("curso") || s.includes("ativo") || s.includes("em curso")|| s.includes("concluido"))return "#2ecc71";
    if (s.includes("trancado")) return "#f39c12"; 
    if (s.includes("desistente") ) return "#e74c3c";
    return "#BA1A1A"; 
  };


  


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
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>
             <ArrowLeft size={28} color="#000" strokeWidth={2} />
          </button>
          <img src={logoFatecPreto} className={styles.logoTop} alt="Logo Fatec" />
        </div>
        
        <div className={styles.cardContainer}>
          <InternetWatcher />
          
          <div className={styles.topSection}>
            <img 
              src={
                student?.photo && student?.photoStatus === 'APPROVED' 
                  // ? `${GLOBAL_VAR.BASE_URL}${student.photo}` 
                  ? student.photo
                  : perfilDefault
              } 
              className={styles.profileImage} 
              alt="Foto do Aluno" 
              onError={(e) => {
                e.currentTarget.src = perfilDefault; 
              }}
            />

          <div className={styles.qrWrapper}>
            <QRCodeSVG value={validationUrl} 
            size={256} 
            style={{ width: '100%', height: '100%' }}
            
            // includeMargin={true} />
            includeMargin={false} />
          </div>
            {/* <div className={styles.qrWrapper}>
              <QRCodeSVG value={`https://meusite.com/valida/${student.ra}`} size={110} />
            </div> */}
          </div>

          <div className={styles.infoSection}>
            <h2 className={styles.studentName}>{student.name}</h2>
            
            <div className={styles.row}>
              <div className={styles.statusContainer}>
                <strong>STATUS:</strong> 
                <span 
                  className={styles.statusPill} 
                  style={{ backgroundColor: getStatusColor(studentStatus) }}
                >
                  {studentStatus.toUpperCase()}
                </span>
              </div>
              <p><strong>CPF:</strong> {student.cpf}</p>
            </div>
            <div className={styles.row}>
              <p><strong>NASCIMENTO:</strong> {student.birthDate}</p>
            </div>
          </div>

          <div className={styles.infoSection}>
            <h3 className={styles.courseName}>Curso: {student.course}</h3>
            
            <div className={styles.row}>
              <p><strong>RA:</strong> {student.ra}</p>
            </div>
            <div className={styles.row}>
              <p><strong>VALIDADE:</strong> {student.dueDate}</p>
            </div>
          </div>
          
          <img src={logoCps} className={styles.logoCps} alt="Logo CPS" />
        </div>
      </div>
    </div>
  );
}