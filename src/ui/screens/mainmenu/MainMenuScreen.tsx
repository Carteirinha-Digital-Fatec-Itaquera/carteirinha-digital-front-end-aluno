
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

const logoFatec = '/fatec_itaquera_logo.png';
const perfilDefault = '/perfil_default.png';

import { findProfile } from '../../../api/student/findProfile';
import type { Student } from '../../../domains/Student';

import {
  IdCard,
  Settings,
  HelpCircle,
  Camera,
  QrCode,
  LogOut,
  CalendarDays,
  Award,
} from 'lucide-react';

import styles from './style.module.css';

export default function MainMenuScreen() {
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const cachedData = localStorage.getItem('@Carteirinha:profile');

      if (cachedData) {
        setStudent(JSON.parse(cachedData));
      }

      if (navigator.onLine) {
        const result = await findProfile();

        if (result && !('code' in result)) {
          const freshData = result as Student;

          setStudent(freshData);

          localStorage.setItem(
            '@Carteirinha:profile',
            JSON.stringify(freshData)
          );
        }
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Sair do app?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('@Carteirinha:profile');
      localStorage.removeItem('@Carteirinha:photoOffline');
      localStorage.removeItem('@Carteirinha:accessibility');

      window.location.href = '/login';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mobileWrapper}>
        <InternetWatcher />

        <div className={styles.redHeader}>
          <img
            src={logoFatec}
            className={styles.logo}
            alt="Logo Fatec"
          />
        </div>

        <div className={styles.subcontainer}>
          <div className={styles.avatarWrapper}>
            <img
              src={
                navigator.onLine
                  ? student?.photo && student?.photoStatus === 'APPROVED'
                    ? student.photo
                    : perfilDefault
                  : localStorage.getItem('@Carteirinha:photoOffline') ||
                    perfilDefault
              }
              className={styles.avatar}
              alt="Perfil"
              onError={(e) => {
                e.currentTarget.src = perfilDefault;
              }}
            />
          </div>

          <h1 className={styles.welcomeText}>
            Bem-vindo(a),{' '}
            {student?.name ? student.name.split(' ')[0] : 'Aluno'}
          </h1>

          <div className={styles.gridContainer}>
            {/* PRIMEIRO ACESSO PRINCIPAL */}
            <button
              type="button"
              className={`${styles.menuCard} ${styles.cardCarteirinha}`}
              onClick={() => navigate('/DigitalStudentCard')}
            >
              <IdCard
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Abrir carteirinha</p>
            </button>

            {/* EVENTOS */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => navigate('/eventos')}
            >
              <CalendarDays
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Eventos &amp; Palestras</p>
            </button>

            {/* CERTIFICADOS */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => navigate('/certificados')}
            >
              <Award
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Meus Certificados</p>
            </button>

            {/* ENVIAR FOTO */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => {
                alert(
                  'Instruções: Fundo neutro, rosto centralizado, sem óculos escuros.'
                );

                navigate('/UploadImage');
              }}
            >
              <Camera
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Enviar Foto</p>
            </button>

            {/* QR CODE */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => navigate('/qrCodeScan')}
            >
              <QrCode
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>QRCode</p>
            </button>

            {/* CONFIGURAÇÕES */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => navigate('/config')}
            >
              <Settings
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Configurações</p>
            </button>

            {/* AJUDA */}
            <button
              type="button"
              className={styles.menuCard}
              onClick={() => navigate('/Help')}
            >
              <HelpCircle
                className={styles.icon}
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <p>Ajuda</p>
            </button>
          </div>

          {/* SAIR */}
          <button
            type="button"
            className={styles.logoutCotainerButton}
            onClick={handleLogout}
          >
            <span>Deslogar</span>

            <LogOut
              className={styles.iconLogout}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

