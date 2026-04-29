import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import perfilDefault from "../../../assets/images/perfil_default.png";
import { findProfile } from '../../../api/student/findProfile';
import type { Student } from '../../../domains/Student';

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
      <InternetWatcher />
      
      {/* Área vermelha do topo com a Logo */}
      <div className={styles.redHeader}>
        <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
      </div>
      
      {/* Área branca principal */}
      <div className={styles.subcontainer}>
        {/* Foto Flutuante */}
        <div className={styles.avatarWrapper}>
          <img 
            src={student?.photo && student.photo.length > 0 ? student.photo : perfilDefault} 
            className={styles.avatar} 
            alt="Perfil" 
          />
        </div>

        <h1 className={styles.welcomeText}>
          Bem-vindo(a), {student?.name ? student.name.split(' ')[0] : "Aluno"}
        </h1>

        <div className={styles.gridContainer}>
          {/* Botão Carteirinha ocupando linha inteira (estilo Figma) */}
          <button className={`${styles.menuCard} ${styles.fullWidth}`} onClick={() => navigate("/DigitalStudentCard")}>
            <span className={styles.icon}></span>
            <p>Carteirinha</p>
          </button>
          
          <button className={styles.menuCard} onClick={() => alert("Em breve!")}>
            <span className={styles.icon}>⚙️</span>
            <p>Configurações</p>
          </button>
          
          <button className={styles.menuCard} onClick={() => alert("Central de Ajuda")}>
            <span className={styles.icon}>❓</span>
            <p>Ajuda</p>
          </button>
          
          {/* Botão Enviar Foto */}
          <button className={`${styles.menuCard} ${styles.fullWidth}`} onClick={() => {
            alert("Instruções: Fundo neutro, rosto centralizado, sem óculos escuros.");
            navigate("/UploadImage");
          }}>
            <span className={styles.icon}>📸</span>
            <p>Enviar Foto</p>
          </button>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}