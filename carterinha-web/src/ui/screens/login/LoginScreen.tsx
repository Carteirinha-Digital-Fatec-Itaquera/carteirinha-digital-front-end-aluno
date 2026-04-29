import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import logoCps from "../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png";

import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import type { ErrorField } from '../../../utils/Types';
import { login } from '../../../api/auth/login';
import { Auth } from '../../../domains/Auth';

import styles from './style.module.css';

export default function LoginScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState<ErrorField[]>([]);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  const backgroundColor = "#BA1A1A";

  return (
    <div className={styles.container}>
      <img src={logoFatec} className={styles.logo} alt='Logo Fatec' />
      
      <div className={styles.subcontainer}>
        <InternetWatcher />
        <SpacerComp />
        <TitleComp text="Login" size={20} />
        <SpacerComp />

        {/* Retornado para E-mail Institucional */}
        <InputComp label="E-mail institucional" placeholder="Ex: aluno@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("/PasswordRecovery")} alignSelf="flex-end" />
        <SpacerComp />

        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={errorFields?.map((val: ErrorField) => val.description) ?? []}
          onClose={() => {
            setMessage("");
            setErrorFields([]);
            setModalErrorVisible(false);
          }}
        />

        {onLoading ? (
          <div style={{ alignSelf: 'center', margin: "20px 0", fontWeight: 'bold' }}>
            Carregando...
          </div>
        ) : (
          <ButtonComp
            text="Entrar"
            color={backgroundColor}
            action={async () => {
              setOnLoading(true);
              const auth = new Auth({ email, password });
              try {
                const result = await login(auth);
                
                if ('token' in result) {
                  // 1. Salva o token independente de qual tela vai
                  localStorage.setItem("token", result.token);
                  
                  // 2. Faz a bifurcação baseada no primeiro acesso!
                  if (result.mustChangePassword) {
                    navigate('/first-access'); // 👈 Vai para a tela de trocar senha
                  } else {
                    navigate('/MainMenu'); // 👈 Vai para o sistema normal
                  }
                  
                } else {
                  setMessage(result.message);
                  setErrorFields(result.errorFields ?? []);
                  setModalErrorVisible(true);
                }
              } catch (e) {
                setMessage("Erro de conexão.");
                setModalErrorVisible(true);
              }
              setOnLoading(false);
            }}
          />
        )}
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigate("/SignUp")} />
        <SpacerComp />
        <img src={logoCps} className={styles.logocps} alt="Logo CPS" />
      </div>
    </div>
  );
}