import PageLayout from '../../components/page/PageLayout';
// import { ArrowLeft, Phone, MessageCircle, Mail, WheatIcon } from 'lucide-react';

// Assets

const logoCps = '/cps_logo_br.png';
const iconWhats = '/whatsappIcon.png'
const iconEmail = '/emailIcon.png'
const iconTele = '/phoneIcon.png'
// const logoSaoPaulo = '/logo_sao_paulo_governo.png';

import styles from './style.module.css';

export default function HelpScreen() {


  return (
    <PageLayout title="Como podemos ajudar?" subtitle="Encontre os canais de atendimento da sua instituição." backTo="/MainMenu">
      {/* Conteúdo que sobrepõe o fundo vermelho */}
      <div className={styles.contentWrapper}>
        <div className={styles.contactContainer}>
          <p className={styles.faleConoscoLabel}>FALE CONOSCO</p>
          <h2 className={styles.mainTitle}>Contatos</h2>

          <div className={styles.contactList}>
            {/* Card WhatsApp */}
            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgWhatsapp}`}>
                <img src={iconWhats} alt="Logo whatsapp" className={styles.logoContatos} />
              </div>
              <div className={styles.contactInfo}>
                <label>WHATSAPP</label>
                <p>98787-7625</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgPhone}`}>
                <img src={iconTele} alt="Logo telefone" className={styles.logoContatos} />
              </div>
              <div className={styles.contactInfo}>
                <label>TELEFONE</label>
                <p>(11) 98787-7625</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={`${styles.iconCircle} ${styles.bgEmail}`}>
                <img src={iconEmail} alt="Logo email" className={styles.logoContatos} />
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

          
        </div>
        
      </div>
      <footer className={styles.footerLogos}>
            <img src={logoCps} alt="Logo CPS" className={styles.footerLogoImg} />
            {/* <img src={logoSaoPaulo} alt="Logo SP" className={styles.footerLogoImg} /> */}
          </footer>
    </PageLayout>
  );
}