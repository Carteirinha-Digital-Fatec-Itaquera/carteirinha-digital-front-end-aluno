import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import type { ErrorField } from '../../../utils/Types';
import { sendEmail } from '../../../api/recoverypassword/sendEmail';

import styles from './style.module.css';

export default function PasswordRecoveryScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState<ErrorField[]>([]);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  function showError(msg: string, fields?: ErrorField[] | null) {
    setMessage(msg);
    setErrorFields(fields ?? []);
    setModalErrorVisible(true);
  }

  const handleSendLink = async () => {
    if (!email) {
      showError("Por favor, digite seu e-mail.");
      return;
    }
    
    setOnLoading(true);
    try {
      const result = await sendEmail({ email, type: 'student' });
      if ('ok' in result) {
        setStep(2);
      } else {
        // Agora o TypeScript sabe que aqui dentro é 100% um ApiError!
        showError(result.message || "Erro ao enviar e-mail.", result.errorFields);
      }
    } catch (e) {
      showError("Erro de conexão com o servidor.");
    }
    setOnLoading(false);
  };

  return (
    <div className={styles.container}>
      <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
      
      <div className={styles.subcontainer}>
        <InternetWatcher />
        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={errorFields?.map((val) => val.description) ?? []}
          onClose={() => setModalErrorVisible(false)}
        />

        {step === 1 && (
          <div className={styles.stepContainer}>
            <TitleComp text="Recuperação de senha" size={20} />
            <SpacerComp />
            <p className={styles.infoText}>
              Insira seu e-mail institucional. Se ele estiver cadastrado, enviaremos um link para redefinição.
            </p>
            <SpacerComp />
            <InputComp 
              label="E-mail institucional" 
              placeholder="Ex: aluno@fatec.sp.gov.br" 
              value={email} 
              onChangeText={setEmail} 
            />
            <SpacerComp vertical={30} />
            
            <button className={styles.button} onClick={handleSendLink} disabled={onLoading}>
              {onLoading ? "Enviando..." : "Enviar Link"}
            </button>
            
            <SpacerComp />
            <button className={styles.linkButton} onClick={() => navigate('/login')}>
              Voltar ao Login
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContainer}>
            <TitleComp text="E-mail Enviado!" size={20} />
            <SpacerComp />
            <p className={styles.infoText}>
              Verifique sua caixa de entrada (e a pasta de spam). Você receberá um link em breve com as instruções para criar uma nova senha.
            </p>
            <SpacerComp vertical={30} />
            <button className={styles.button} onClick={() => navigate('/login')}>
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}