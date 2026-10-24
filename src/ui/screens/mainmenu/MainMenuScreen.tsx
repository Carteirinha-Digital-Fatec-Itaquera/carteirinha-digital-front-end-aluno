import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';
import MessageModal from '../../components/MessageModal/MessageModal';
import StudentPhoto from '../../components/studentPhoto/StudentPhoto';
import PhotoStatus, { type PhotoStatusAvailability } from '../../components/photoStatus/PhotoStatus';

// import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
const logoFatec = '/fatec_itaquera_logo.png'

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

  const [profileAvailability, setProfileAvailability] = useState<PhotoStatusAvailability>('loading');
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const cachedData = localStorage.getItem('@Carteirinha:profile');
      if (cachedData) {
        try { setStudent(JSON.parse(cachedData)); } catch { /* Cache inválido não impede a consulta. */ }
      }
      // Mantém o cache para a identificação, mas só confirma status com a consulta atual.
      setProfileAvailability('loading');
      if (!online || useMockEvents) {
        setProfileAvailability('unavailable');
        return;
      }
      try {
        const result = await findProfile();
        if (!active) return;
        if (result && !('code' in result)) {
          setStudent(result);
          setProfileAvailability('ready');
          localStorage.setItem('@Carteirinha:profile', JSON.stringify(result));
        } else {
          setProfileAvailability('unavailable');
        }
      } catch {
        if (active) setProfileAvailability('unavailable');
      }
    };
    void loadProfile();
    return () => { active = false; };
  }, [online]);

  const photoSrc = online
    ? (student?.photo && student.photoStatus === 'APPROVED' ? student.photo : '')
    : (localStorage.getItem('@Carteirinha:photoOffline') || '');

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
            <StudentPhoto src={photoSrc} />
          </div>

          <h1 className={styles.welcomeText}>
            Bem-vindo(a), {student?.name ? student.name.split(' ')[0] : "Aluno"}
          </h1>
          <p className={styles.intro}>Acesse sua identificação, acompanhe eventos e consulte suas conquistas.</p>

          <PhotoStatus key={`${student?.id || student?.ra || 'unknown'}:${student?.photoStatus || 'unknown'}`}
            status={student?.photoStatus} availability={online ? profileAvailability : 'unavailable'}
            studentKey={student?.id ? `id:${student.id}` : student?.ra ? `ra:${student.ra}` : undefined} />

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
