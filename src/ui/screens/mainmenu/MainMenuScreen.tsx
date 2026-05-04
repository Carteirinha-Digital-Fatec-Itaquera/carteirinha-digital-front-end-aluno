import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import perfilDefault from "../../../assets/images/perfil_default.png";
import { findProfile } from '../../../api/student/findProfile';
import type { Student } from '../../../domains/Student';
import { GLOBAL_VAR } from '../../../api/config/globalVar';
import { IdCard, Settings, HelpCircle, Camera } from 'lucide-react'; 

import styles from './style.module.css';
export default function MainMenuScreen() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await findProfile();
      if (result && !('code' in result)) {
        setStudent(result as Student);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    const confirm = window.confirm("Tem certeza que deseja sair?");
    if (confirm) {
      localStorage.removeItem('token');
      navigate("/login");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mobileWrapper}>
        <InternetWatcher />
        
        <div className={styles.redHeader}>
          <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
        </div>
        
        <div className={styles.subcontainer}>
          <div className={styles.avatarWrapper}>
            <img 
              src={
                student?.photo && student?.photoStatus === 'APPROVED' 
                  // ? `${GLOBAL_VAR.BASE_URL}${student.photo}` 
                  ?student.photo
                  : perfilDefault
              } 
              className={styles.avatar} 
              alt="Perfil" 
              onError={(e) => {
                e.currentTarget.src = perfilDefault; 
              }}
            />
          </div>

          <h1 className={styles.welcomeText}>
            Bem-vindo(a), {student?.name ? student.name.split(' ')[0] : "Aluno"}
          </h1>

          <div className={styles.gridContainer}>
            <button className={`${styles.menuCard} ${styles.fullWidth}`} onClick={() => navigate("/DigitalStudentCard")}>
              <IdCard className={styles.icon} strokeWidth={1.5} />
              <p>Carteirinha</p>
            </button>
            
            <button className={styles.menuCard} onClick={() => navigate('/config')}>
              <Settings className={styles.icon} strokeWidth={1.5} />
              <p>Configurações</p>
            </button>
            
            {/* <button className={styles.menuCard} onClick={() => alert("Central de Ajuda")}> */}
            <button className={styles.menuCard} onClick={() => navigate("/Help")}>
              <HelpCircle className={styles.icon} strokeWidth={1.5} />
              <p>Ajuda</p>
            </button>
            
            <button className={`${styles.menuCard} ${styles.fullWidth}`} onClick={() => {
              alert("Instruções: Fundo neutro, rosto centralizado, sem óculos escuros.");
              navigate("/UploadImage");
            }}>
              <Camera className={styles.icon} strokeWidth={1.5} />
              <p>Enviar Foto</p>
            </button>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}