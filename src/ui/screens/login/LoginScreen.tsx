import AuthLayout from '../../components/page/AuthLayout';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const logoCps = '/cps_logo_cor.png';

import { ButtonComp } from '../../components/button/ButtonComp';
import { InputComp } from '../../components/input/InputComp';
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
    <AuthLayout title="Login" variant="classic">

      <div className={styles.subcontainer}>
        <InternetWatcher />
        <h1 className={styles.loginHeading}>Login</h1>

        <div className={styles.formFields}>
          <InputComp label="E-mail institucional" placeholder="Ex: aluno@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
          <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        </div>

        <div className={styles.forgotPassword}>
          <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("/PasswordRecovery")} alignSelf="flex-end" />
        </div>

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

        <div className={styles.loginAction}>
          {onLoading ? (
            <div className={styles.loginLoading} role="status">
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
                    localStorage.setItem("token", result.token);

                    const returnUrl = sessionStorage.getItem("returnUrl");
                    const safeReturn =
                      returnUrl && returnUrl.startsWith("/p/") ? returnUrl : null;

                    if (result.mustChangePassword) {
                      // alert(`${result.mustChangePassword}\n\n${String(result.mustChangePassword)}`)
                      localStorage.setItem("mustChangePassword", "false");
                      // navigate('/first-access');
                      window.location.href = "/first-access";
                    } else {
                      localStorage.setItem("mustChangePassword", "true");
                      if (safeReturn) {
                        sessionStorage.removeItem("returnUrl");
                        window.location.href = safeReturn;
                      } else {
                        window.location.href = "/MainMenu";
                      }
                    }

                  } else {
                    setMessage(result.message);
                    setErrorFields(result.errorFields ?? []);
                    setModalErrorVisible(true);
                  }
                } catch {
                  setMessage("Erro de conexão.");
                  setModalErrorVisible(true);
                }
                setOnLoading(false);
              }}
            />
          )}
        </div>

        <div className={styles.firstAccessNotice}>
          <span>Este é o seu primeiro acesso?</span>
          <a
            href="https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.firstAccessLink}
          >
            Clique aqui
          </a>
        </div>
        <Link to="/creditos" className={styles.projectCreditsLink}>
          Conheça quem constrói este projeto
        </Link>
          <Link to="/visitantes" className={styles.projectCreditsLink}>Eventos e certificados para visitantes</Link>
        <img src={logoCps} className={styles.logocps} alt="Logo CPS" />
      </div>
    </AuthLayout>
  );
}


