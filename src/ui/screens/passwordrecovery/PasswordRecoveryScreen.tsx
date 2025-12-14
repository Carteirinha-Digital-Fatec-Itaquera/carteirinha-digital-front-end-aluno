import { Dispatch, SetStateAction, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { TextInfoComp } from '../../components/textinfo/TextInfoComp';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';
import { ErrorModalComp } from '../../components/ErrorModal';

import { backgroundColor } from '../../themes/Color';
import { NavigationProps } from '../../../routes';

import { sendEmail } from '../../../api/recoverypassword/sendEmail';
import { sendCode } from '../../../api/recoverypassword/sendCode';
import { sendPassword } from '../../../api/recoverypassword/sendPassword';

import { RecoveryPassword } from '../../../domains/RecoveryPassword';
import { Email } from '../../../domains/Email';

import { ErrorField } from '../../../utils/Types';

import { styles } from './style';

export default function PasswordRecoveryScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")


  const [message, setMessage] = useState("")
  const [errorFields, setErrorFields] = useState<ErrorField[]>()
  const [modalErrorVisible, setModalErrorVisible] = useState(false)
  const [onLoading, setOnLoading] = useState(false)

  const [part1, setPart1] = useState(true)
  const [part2, setPart2] = useState(false)
  const [part3, setPart3] = useState(false)

  function goToPart1() {
    setPart1(true)
    setPart2(false)
    setPart3(false)
  }

  function goToPart2() {
    setPart1(false)
    setPart2(true)
    setPart3(false)
  }

  function goToPart3() {
    setPart1(false)
    setPart2(false)
    setPart3(true)
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
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
          <PasswordRecoveryPart1Comp
            navigateBackButton={() => navigate("Login")}
            navigateNextStepButton={async () => {
              setOnLoading(true)
              const emailToSend = new Email({ email })
              const result = await sendEmail(emailToSend)
              if ('ok' in result) {
                goToPart2()
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }
            }
            value={email}
            setValue={setEmail}
            onLoading={onLoading}
          />
        )}
        {part2 && (
          <PasswordRecoveryPart2Comp
            navigateBackButton={() => { goToPart1() }}
            navigateNextStepButton={async () => {
              setOnLoading(true)
              const result = await sendCode(email ?? "", code)
              if ('ok' in result) {
                goToPart3()
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }}
            value={code}
            setValue={setCode}
            onLoading={onLoading}
          />
        )}
        {part3 && (
          <PasswordRecoveryPart3Comp
            navigateBackButton={() => { goToPart2() }}
            navigateNextStepButton={async (passwordEquals: boolean) => {
              setOnLoading(true)

              if (!passwordEquals) {
                setMessage("As senhas não são iguais.")
                setModalErrorVisible(true)
                setOnLoading(false)
                return
              }
              const recovery = new RecoveryPassword({
                email: email ?? "",
                code: code ?? "",
                newPassword: password
              })
              const result = await sendPassword(recovery)
              if ('ok' in result) {
                navigate('Login')
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }}
            value={password}
            setValue={setPassword}
            onLoading={onLoading}
          />
        )}
      </View>
    </View>
  );
}

type PasswordRecoveryProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  onLoading: boolean,
  navigateNextStepButton: () => void,
}

type PasswordRecoveryNextStepBooleanProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  onLoading: boolean,
  navigateNextStepButton: (value: boolean) => void,
}

function PasswordRecoveryPart1Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: PasswordRecoveryProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira seu e-mail institucional para enviarmos um código de segurança
      </TextInfoComp>
      <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={value} onChangeText={setValue} />
      <SpacerComp />
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
          text="Enviar E-mail"
          action={() => navigateNextStepButton()}
          color={backgroundColor}
        />
      )}
      <SpacerComp />
    </>
  )
}

function PasswordRecoveryPart2Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: PasswordRecoveryProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira o código de segurança que enviamos no seu e-mail institucional
      </TextInfoComp>
      <InputCodeComp label="Insira o código" onChangeText={setValue} />
      <SpacerComp />
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
      <SpacerComp />

    </>
  )
}

function PasswordRecoveryPart3Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: PasswordRecoveryNextStepBooleanProps) {
  const [repeatPassword, setRepeatPassword] = useState("")
  return (
    <>
      <SpacerComp />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Código validado com sucesso! Redefina sua senha
      </TextInfoComp>
      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />
      <SpacerComp />
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
          text="Redefinir"
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
      <SpacerComp />

    </>
  )
}


