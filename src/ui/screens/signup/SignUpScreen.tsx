import { Image, Text, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { Dispatch, SetStateAction, useState } from 'react';
import { InputComp } from '../../components/input/InputComp';
import { styles } from './style';
import { backgroundColor } from '../../themes/Color';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { TextInfoComp } from '../../components/textinfo/TextInfoComp';

export default function SignUpScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("faluno@fatec.sp.gov.br")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

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
        {part1 && (
          <SignUpPart1Comp
            navigateBackButton={() => navigate("Login")}
            navigateNextStepButton={() => { goToPart2() }}
            value={cpf}
            setValue={setCpf}
          />
        )}

        {part2 && (
          <SignUpPart2Comp
            navigateBackButton={() => goToPart1()}
            navigateNextStepButton={() => { goToPart3() }}
            value={email}
            setValue={setEmail}
          />
        )}

        {part3 && (
          <SignUpPart3Comp
            navigateBackButton={() => goToPart2()}
            navigateNextStepButton={() => { goToPart4() }}
            value={code}
            setValue={setCode}
          />
        )}

        {part4 && (
          <SignUpPart4Comp
            navigateBackButton={() => goToPart3()}
            navigateNextStepButton={() => navigate("Login")}
            value={password}
            setValue={setPassword}
          />
        )}
      </View>
    </View>
  );
}

type SignUpCompProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  navigateNextStepButton: () => void,
}

function SignUpPart1Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: SignUpCompProps) {
  return (
    <>
      <SpacerComp vertical={20} />
      <TitleComp text="Primeiro Acesso" size={20} />

      <SpacerComp vertical={40} />
      <InputComp label="CPF" placeholder="Ex: 000.000.000-00" value={value} onChangeText={setValue} />

      <SpacerComp vertical={60} />
      <ButtonComp text="Enviar CPF" action={navigateNextStepButton} color={backgroundColor} />

      <SpacerComp vertical={30} />
      <TextClickableComp text="Este não é seu primeiro acesso? Clique aqui" action={navigateBackButton} />
    </>
  )
}

function SignUpPart2Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: SignUpCompProps) {
  return (
    <>
      <SpacerComp vertical={20} />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Enviamos um código no seu e-mail institucional para definição da senha!
      </TextInfoComp>
      <View style={styles.containertext}>
        <Text style={styles.textLabel}> E-mail: </Text>
        <Text style={styles.textValue}> {value} </Text>
      </View>

      <SpacerComp vertical={50} />
      <ButtonComp text="Enviar e-mail" action={navigateNextStepButton} color={backgroundColor} />
    </>
  )
}

function SignUpPart3Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: SignUpCompProps) {
  return (
    <>
      <SpacerComp vertical={20} />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira o código de segurança que enviamos no seu e-mail institucional
      </TextInfoComp>
      <SpacerComp vertical={10} />

      <InputCodeComp label="Insira o código" onChangeText={setValue} />

      <SpacerComp vertical={50} />
      <ButtonComp text="Enviar código" action={navigateNextStepButton} color={backgroundColor} />
    </>
  )
}

function SignUpPart4Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: SignUpCompProps) {
  const [repeatPassword, setRepeatPassword] = useState("")
  return (
    <>
      <SpacerComp vertical={20} />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />

      <TextInfoComp>
        Código validado com sucesso!
        Defina sua senha
      </TextInfoComp>
      <SpacerComp vertical={10} />

      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />

      <SpacerComp vertical={20} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />

      <SpacerComp vertical={50} />
      <ButtonComp text="Definir senha" action={navigateNextStepButton} color={backgroundColor} />
    </>
  )
}