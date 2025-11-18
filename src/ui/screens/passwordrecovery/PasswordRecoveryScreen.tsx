import { Image, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { Dispatch, SetStateAction, useState } from 'react';
import { backgroundColor } from '../../themes/Color';
import { Spacer } from '../../components/spacer/Spacer';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';

import { styles } from './style';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';

export default function PasswordRecoveryScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")

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
        {part1 && (
          <PasswordRecoveryPart1Comp
            navigateBackButton={() => navigate("Login")}
            navigateNextStepButton={() => { goToPart2() }}
            value={email}
            setValue={setEmail}
          />
        )}
        {part2 && (
          <PasswordRecoveryPart2Comp
            navigateBackButton={() => { goToPart1() }}
            navigateNextStepButton={() => { goToPart3() }}
            value={code}
            setValue={setCode}
          />
        )}
        {part3 && (
          <PasswordRecoveryPart3Comp
            navigateBackButton={() => { goToPart2() }}
            navigateNextStepButton={() => {  }}
            value={password}
            setValue={setPassword}
          />
        )}
      </View>
    </View>
  );
}

type PasswordRecoveryCompProps = {
  navigateBackButton: () => void,
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  navigateNextStepButton: () => void,
}

function PasswordRecoveryPart1Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: PasswordRecoveryCompProps) {
  return (
    <>
      <Spacer vertical={20} />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <Spacer vertical={40} />
      <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={value} onChangeText={setValue} />
      <Spacer vertical={60} />
      <ButtonComp text="Enviar E-mail" action={() => navigateNextStepButton()} color={backgroundColor} />
    </>
  )
}

function PasswordRecoveryPart2Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: PasswordRecoveryCompProps) {
  return (
    <>
      <Spacer vertical={20} />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <Spacer vertical={40} />
      <InputCodeComp label="Insira o código" onChangeText={setValue} />
      <Spacer vertical={60} />
      <ButtonComp text="Enviar código" action={navigateNextStepButton} color={backgroundColor} />
    </>
  )
}

function PasswordRecoveryPart3Comp({ navigateBackButton, value, setValue, navigateNextStepButton }: PasswordRecoveryCompProps) {
  const [repeatPassword, setRepeatPassword] = useState("")
  return (
    <>
      <Spacer vertical={20} />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <Spacer vertical={40} />
      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />
      <Spacer vertical={20} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />
      <Spacer vertical={60} />
      <ButtonComp text="Enviar código" action={navigateNextStepButton} color={backgroundColor} />
    </>
  )
}


