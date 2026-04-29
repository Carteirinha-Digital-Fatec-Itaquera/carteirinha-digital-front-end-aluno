import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from "qrcode.react";

import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";

import logoFatecPreto from "../../../assets/images/fatec_itaquera_logo_preto.png";
import logoCps from "../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png";
import perfilDefault from "../../../assets/images/perfil_default.png";

import { findProfile } from "../../../api/student/findProfile";
import type { Student } from "../../../domains/Student";

import styles from './style.module.css';

export default function DigitalStudentCardScreen() {
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);

  useEffect(() => {
    const loadStudent = async () => {
      const result = await findProfile();
      if (result && 'code' in result) {
        setMessage(result.message);
        setModalErrorVisible(true);
      } else {
        setStudent(result as Student);
      }
    };
    loadStudent();
  }, []);

  if (!student) {
    return <div className={styles.loadingContainer}>Carregando...</div>;
  }

  // Fallback de segurança caso a API não retorne status
  const studentStatus = student.status || "Em curso"; 
  
  // Define a cor da "Pílula" de status baseada no valor
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("curso") || s.includes("ativo") || s.includes("concluido")) return "#2ecc71"; // Verde
    if (s.includes("trancado")) return "#f39c12"; // Laranja
    if (s.includes("desistente")) return "#e74c3c"; // Vermelho
    return "#BA1A1A"; // Padrão
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
             &#8592; {/* Ícone de Seta */}
          </button>
          <img src={logoFatecPreto} className={styles.logoTop} alt="Logo Fatec" />
        </div>
        
        <div className={styles.cardContainer}>
          <InternetWatcher />
          
          <div className={styles.topSection}>
            <img 
              src={student.photo && student.photo.length > 0 ? student.photo : perfilDefault} 
              className={styles.profileImage} 
              alt="Foto do Aluno" 
            />
            <div className={styles.qrWrapper}>
              <QRCodeSVG value={`https://meusite.com/valida/${student.ra}`} size={110} />
            </div>
          </div>

          <div className={styles.infoSection}>
            <h2 className={styles.studentName}>{student.name}</h2>
            
            <div className={styles.row}>
              {/* Onde antes era RG, agora é o Status em formato de "pill" */}
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
            <h3 className={styles.courseName}>{student.course}</h3>
            
            <div className={styles.row}>
              <p><strong>PERÍODO:</strong> {student.period}</p>
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