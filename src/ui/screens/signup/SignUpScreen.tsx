import { Dispatch, SetStateAction, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { InputComp } from '../../components/input/InputComp';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { TextInfoComp } from '../../components/textinfo/TextInfoComp';
import { ErrorModalComp } from '../../components/ErrorModal';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import { ErrorField } from '../../../utils/Types';

import { backgroundColor } from '../../themes/Color';

import { NavigationProps } from '../../../routes';

import { FirstAccess } from '../../../domains/FirstAccess';

import { sendCpf } from '../../../api/firstaccess/sendCpf';
import { sendCode } from '../../../api/firstaccess/sendCode';
import { sendPassword } from '../../../api/firstaccess/sendPassword';

import { styles } from './style';

export default function SignUpScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("faluno@fatec.sp.gov.br")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [errorFields, setErrorFields] = useState<ErrorField[]>()
  const [modalErrorVisible, setModalErrorVisible] = useState(false)
  const [onLoading, setOnLoading] = useState(false)

  const [part1, setPart1] = useState(true)
  const [part2, setPart2] = useState(false)
  const [part3, setPart3] = useState(false)
  const [part4, setPart4] = useState(false)

  function goToPart1() {
    setPart1(true)
    setPart2(false)
    setPart3(false)
    setPart4(false)
  }

  function goToPart2() {
    setPart1(false)
    setPart2(true)
    setPart3(false)
    setPart4(false)
  }

  function goToPart3() {
    setPart1(false)
    setPart2(false)
    setPart3(true)
    setPart4(false)
  }

  function goToPart4() {
    setPart1(false)
    setPart2(false)
    setPart3(false)
    setPart4(true)
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <InternetWatcher />
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

        {part1 && (
          <SignUpPart1Comp
            navigateBackButton={() => navigate("Login")}
            navigateNextStepButton={async () => {
                setOnLoading(true)
                const cpfToSend = new FirstAccess({ cpf: cpf, code: null, password: null })
                const result = await sendCpf(cpfToSend)
                if ('email' in result) {
                  if (result.email != "") {
                    setEmail(result.email)
                    goToPart2()
                  }
                } else {
                  setMessage(result.message)
                  setErrorFields(result.errorFields ?? [])
                  setModalErrorVisible(true)
                }
                setOnLoading(false)
              }
            }
            value={cpf}
            setValue={setCpf}
            onLoading={onLoading}
          />
        )}

        {part2 && (
          <SignUpPart2Comp
            navigateBackButton={() => goToPart1()}
            navigateNextStepButton={() => { goToPart3() }}
            value={email}
            setValue={setEmail}
            onLoading={onLoading}
          />
        )}

        {part3 && (
          <SignUpPart3Comp
            navigateBackButton={() => goToPart2()}
            navigateNextStepButton={async () => {
                setOnLoading(true)
                const firstAccess = new FirstAccess({ cpf: cpf, code: code, password: null })
                const result = await sendCode(firstAccess)
                if ('ok' in result) {
                  goToPart4()
                } else {
                  setMessage(result.message)
                  setErrorFields(result.errorFields ?? [])
                  setModalErrorVisible(true)
                }
                setOnLoading(false)
              }
            }
            value={code}
            setValue={setCode}
            onLoading={onLoading}
          />
        )}

        {part4 && (
          <SignUpPart4Comp
            navigateBackButton={() => goToPart3()}
            navigateNextStepButton={async (passwordEquals: boolean) => {
              setOnLoading(true)

              if (!passwordEquals) {
                setMessage("As senhas não são iguais.")
                setModalErrorVisible(true)
                setOnLoading(false)
                return
              }

              const recovery = new FirstAccess({
                cpf: cpf,
                code: code,
                password: password
              })
              const result = await sendPassword(recovery)
              if ('ok' in result) {
                navigate("Login")
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }
            }
            value={password}
            setValue={setPassword}
            onLoading={onLoading}
          />
        )}
      </View>
    </View>
  );
}

type SignupCompProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  onLoading: boolean,
  navigateNextStepButton: () => void,
}

type SignupCompNextStepBooleanProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  onLoading: boolean,
  navigateNextStepButton: (x: boolean) => void,
}

function SignUpPart1Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <TitleComp text="Primeiro Acesso" size={20} />
      <InputComp label="CPF" placeholder="Ex: 000.000.000-00" value={value} onChangeText={setValue} />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator
          size="large"
          style={{ transform: [{ scale: 1.5 }] }}
        />
      ) : (
          <ButtonComp
            text="Enviar CPF"
            action={() => navigateNextStepButton()}
            color={backgroundColor}
          />
      )}
      <TextClickableComp text="Este não é seu primeiro acesso? Clique aqui" action={navigateBackButton} />
    </>
  )
}

function SignUpPart2Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Enviamos um código no seu e-mail institucional para definição da senha!
      </TextInfoComp>
      <View style={styles.containertext}>
        <Text style={styles.textLabel}> E-mail: </Text>
        <Text style={styles.textValue}> {value} </Text>
      </View>
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      <ButtonComp
        text="Prosseguir"
        action={() => navigateNextStepButton()}
        color={backgroundColor}
      />
    </>
  )
}

function SignUpPart3Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira o código de segurança que enviamos no seu e-mail institucional
      </TextInfoComp>
      <InputCodeComp label="Insira o código" onChangeText={setValue} />
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator
          size="large"
          style={{ transform: [{ scale: 1.5 }] }}
        />
      ) : (
          <ButtonComp
            text="Enviar código"
            action={() => navigateNextStepButton()}
            color={backgroundColor}
        />
      )}
    </>
  )
}

function SignUpPart4Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompNextStepBooleanProps) {
  const [repeatPassword, setRepeatPassword] = useState("")
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Código validado com sucesso!
        Defina sua senha
      </TextInfoComp>
      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator
          size="large"
          style={{ transform: [{ scale: 1.5 }] }}
        />
      ) : (
        <ButtonComp
          text="Definir senha"
          action={() => {
            let passwordEquals = false
            if (value === repeatPassword) {
              passwordEquals = true
            }
            navigateNextStepButton(passwordEquals)
          }}
          color={backgroundColor}
        />
      )}
    </>
  )
}