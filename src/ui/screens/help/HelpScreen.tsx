import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Mail } from 'lucide-react';

// Assets
const logoFatecbranca = '/fatec_itaquera_logo.png';
const logoCps = '/logos_cps_governo_com_slogan_horizontal_cor.png';
// const logoSaoPaulo = '/logo_sao_paulo_governo.png';

import styles from './style.module.css';

export default function HelpScreen() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.redHeader}>
        <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>
          <ArrowLeft size={28} color="#FFF" strokeWidth={2.5} />
        </button>
        <div className={styles.logoFatecContainer}>
          <img src={logoFatecbranca} className={styles.logoFatec} alt="Logo Fatec" />
        </div>
      </div>

      {/* Conteúdo que sobrepõe o fundo vermelho */}
      <div className={styles.contentWrapper}>
        <div className={styles.contactContainer}>
          <p className={styles.faleConoscoLabel}>FALE CONOSCO</p>
          <h1 className={styles.mainTitle}>Contatos</h1>

          <div className={styles.contactList}>
            {/* Card WhatsApp */}
            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgWhatsapp}`}>
                <MessageCircle size={24} color="#FFF" fill="#FFF" />
              </div>
              <div className={styles.contactInfo}>
                <label>WHATSAPP</label>
                <p>98787-7625</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgPhone}`}>
                <Phone size={24} color="#FFF" fill="#FFF" />
              </div>
              <div className={styles.contactInfo}>
                <label>TELEFONE</label>
                <p>(11) 98787-7625</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgEmail}`}>
                <Mail size={24} color="#FFF" fill="#FFF" />
              </div>
              <div className={styles.contactInfo}>
                <label>EMAIL</label>
                <p>coordfatec@fatec.sp.gov.br</p>
              </div>
            </div>
          </div>

          <div className={styles.hoursBox}>
            <p className={styles.hoursLabel}>Horário de atendimento</p>
            <p className={styles.hoursValue}>Seg - Sex, 8h às 18h</p>
          </div>

          <footer className={styles.footerLogos}>
            <img src={logoCps} alt="Logo CPS" className={styles.footerLogoImg} />
            {/* <img src={logoSaoPaulo} alt="Logo SP" className={styles.footerLogoImg} /> */}
          </footer>
        </div>
      </div>
    </div>
  );
}