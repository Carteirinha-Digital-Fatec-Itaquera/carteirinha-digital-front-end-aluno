import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Phone, MessageCircle, Mail } from 'lucide-react';

// import logoFatecPreto from "../../../assets/images/fatec_itaquera_logo_preto.png";
const logoFatecPreto = '/fatec_itaquera_logo_preto.png'
import styles from './style.module.css';

export default function HelpScreen() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.appWrapper}>
        
        {/* Cabeçalho com botão de voltar */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate("/MainMenu")}>
            <ArrowLeft size={28} color="#000" strokeWidth={2} />
          </button>
          <img src={logoFatecPreto} className={styles.logoTop} alt="Logo Fatec" />
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.helpCard}>
            
            <h1 className={styles.title}>Ajuda</h1>
            <HelpCircle size={42} className={styles.mainIcon} strokeWidth={1.5} />

            <p className={styles.subtitle}>Dúvidas? Entre em contato:</p>
            <p className={styles.sectionTitle}>Contatos:</p>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Phone size={20} className={styles.icon} />
                <span>Telefone: 11 23232323</span>
              </div>

              <div className={styles.contactItem}>
                <MessageCircle size={20} color="#25D366" className={styles.icon} />
                <span>WhatsApp: 11 987877625</span>
              </div>

              <div className={styles.contactItem}>
                <Mail size={20} className={styles.icon} />
                <span className={styles.emailText}>
                  email:<br/>
                  <strong>coordfatec@fatec.sp.gov.br</strong>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}