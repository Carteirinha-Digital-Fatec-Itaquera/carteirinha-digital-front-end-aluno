import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png"
import logoCps from "../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png"


import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { ErrorModalComp } from '../../components/ErrorModal';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import { backgroundColor } from '../../themes/Color';

import type{ ErrorField } from '../../../utils/Types';

import { login } from '../../../api/auth/login';
import { Auth } from '../../../domains/Auth';

// import { NavigationProps } from '../../../routes';

import { styles } from './style';

// import CardInfoInstituicao from '../../components/validacaoqrcode/cardinstituicaoinfo/CardInstituicao';

export default function LoginScreen() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [errorFields, setErrorFields] = useState<ErrorField[]>()
  const [modalErrorVisible, setModalErrorVisible] = useState(false)
  const [onLoading, setOnLoading] = useState(false)

  return (
    <div style={styles.container}>
      <img src={logoFatec} style={styles.logo} alt='Logo Fatec' />
      <div style={styles.subcontainer}>
        <InternetWatcher />
        <SpacerComp />
          <TitleComp text="Login" size={20} />
        <SpacerComp />

        <InputComp label="E-mail institucional" placeholder="Ex: aluno@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("PasswordRecovery")} alignSelf="flex-end" />
        <SpacerComp />

        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={errorFields?.map((val: ErrorField) => { return val.description }) ?? []}
          onClose={() => {
            setMessage("")
            setErrorFields([])
            setModalErrorVisible(false)
          }}
        />
        {onLoading ? (
          <div
          style={{alignSelf: 'center', margin: "20px 0"}}>
            Carregando...
          </div>
        ) : (
          <ButtonComp
          text="Entrar"
          color={backgroundColor}
            action={async () => {
              setOnLoading(true)
              const auth = new Auth({ email, password })
              const result = await login(auth)
              if ('token' in result) {
                localStorage.setItem("token", result.token)
                navigate('/MainMenu')
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }}
          />
        )}
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigate("SignUp")} />
        <SpacerComp />
        <img src={logoCps} style={styles.logocps} />
      </div>
    </div>
  );
}
