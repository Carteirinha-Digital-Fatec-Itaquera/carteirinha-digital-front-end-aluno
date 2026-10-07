import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';
import MessageModal from '../../components/MessageModal/MessageModal';

// import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
const logoFatec = '/fatec_itaquera_logo.png'

// import perfilDefault from "../../../assets/images/perfil_default.png";
const perfilDefault = "/perfil_default.png"

import { findProfile } from '../../../api/student/findProfile';
import type { Student } from '../../../domains/Student';
// import { GLOBAL_VAR } from '../../../api/config/globalVar';
import { IdCard, Settings, HelpCircle, Camera, QrCode, LogOut, CalendarDays, Award } from 'lucide-react';

import styles from './style.module.css';
import { useMockEvents } from '../../../services/eventService';
export default function MainMenuScreen() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [messageDialog, setMessageDialog] = useState<'logout' | 'photo' | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const cachedData = localStorage.getItem('@Carteirinha:profile');
      if (cachedData) {
        setStudent(JSON.parse(cachedData));
      }

      if (navigator.onLine && !useMockEvents) {
        const result = await findProfile();
        if (result && !('code' in result)) {
          const freshData = result as Student;
          setStudent(freshData);
          localStorage.setItem('@Carteirinha:profile', JSON.stringify(freshData));
        }
      }
    };

    //   const result = await findProfile();
    //   if (result && !('code' in result)) {
    //     setStudent(result as Student);
    //   }
    // };
    loadProfile();
  }, []);

  // const handleLogout = () => {
  //   const confirm = window.confirm("Tem certeza que deseja sair?");
  //   if (confirm) {
  //     localStorage.removeItem('token');
  //     navigate("/login");
  //   }
  // };
  const handleLogout = () => {
    setMessageDialog(null);
    localStorage.removeItem('token');
    localStorage.removeItem('@Carteirinha:profile');
    localStorage.removeItem('@Carteirinha:photoOffline');
    localStorage.removeItem('@Carteirinha:accessibility')
    window.location.href = "/login"
    // navigate("/");
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
                navigator.onLine 
                  ? (student?.photo && student?.photoStatus === 'APPROVED' ? student.photo : perfilDefault)
                  : (localStorage.getItem('@Carteirinha:photoOffline') || perfilDefault)
              }
              // src={
              //   student?.photo && student?.photoStatus === 'APPROVED' 
              //     ?student.photo
              //     : perfilDefault
              // } 
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
          <p className={styles.intro}>Acesse sua identificação, acompanhe eventos e consulte suas conquistas.</p>

          <div className={styles.gridContainer}>

            <button className={`${styles.menuCard} ${styles.fullWidth}`} onClick={() => navigate("/DigitalStudentCard")}>
              <IdCard className={styles.icon} strokeWidth={1.5} />
              <p>Minha Carteirinha</p>
            </button>

            <button className={styles.menuCard} onClick={() => navigate('/eventos')}>
              <CalendarDays className={styles.icon} strokeWidth={1.5} />
              <p>Eventos &amp; Palestras</p>
            </button>

            <button className={styles.menuCard} onClick={() => navigate('/certificados')}>
              <Award className={styles.icon} strokeWidth={1.5} />
              <p>Meus Certificados</p>
            </button>
             
            
            <button className={`${styles.menuCard} ${styles.menuCard}`} onClick={() => setMessageDialog('photo')}>
                <Camera className={styles.icon} strokeWidth={1.5} />
                <p>Enviar Foto</p>
              </button>
            
            <button className={styles.menuCard} onClick={() => navigate("/qrCodeScan")}>
              <QrCode className={styles.icon} strokeWidth={1.5} />
              <p>QRCode</p>
            </button>


            <button className={styles.menuCard} onClick={() => {
              // alert('Feature de configurações do usuário')
              navigate('/config')
            }}>
              <Settings className={styles.icon} strokeWidth={1.5} />
              <p>Configurações</p>
            </button>
            
            

            <button className={styles.menuCard} onClick={() => navigate("/Help")}>
              <HelpCircle className={styles.icon} strokeWidth={1.5} />
              <p>Ajuda</p>
            </button>
          </div>

          <Link className={styles.projectCreditsLink} to="/creditos" state={{ from: '/MainMenu' }}>
            Créditos de quem constrói o projeto
          </Link>

          <button type="button" className={styles.logoutCotainerButton} onClick={() => setMessageDialog('logout')}>
            {/* <button className={styles.logoutButton} onClick={handleLogout}> */}
            Deslogar
          {/* </button> */}
          <LogOut className={styles.iconLogout}></LogOut>
          </button>

          {messageDialog === 'photo' && (
            <MessageModal
              visible
              tone="info"
              title="Antes de enviar sua foto"
              message="Para uma boa identificação, use fundo neutro, mantenha o rosto centralizado e evite óculos escuros."
              confirmText="Continuar"
              cancelText="Cancelar"
              onCancel={() => setMessageDialog(null)}
              onConfirm={() => {
                setMessageDialog(null);
                navigate('/UploadImage');
              }}
            />
          )}

          {messageDialog === 'logout' && (
            <MessageModal
              visible
              tone="warning"
              title="Deseja sair do app?"
              message="Sua sessão será encerrada neste dispositivo. Para acessar a carteirinha novamente, será necessário fazer login."
              confirmText="Sair"
              cancelText="Cancelar"
              onCancel={() => setMessageDialog(null)}
              onConfirm={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
