import { Image, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { useState } from 'react';
import { backgroundColor } from '../../themes/Color';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { styles } from './style';
import { Spacer } from '../../components/spacer/Spacer';

export default function LoginScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <Spacer vertical={20} />
        <TitleComp text="Login" size={20} />
        <Spacer vertical={40} />
        <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <Spacer vertical={10} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("PasswordRecovery")} alignSelf="flex-end"/>
        <Spacer vertical={30} />
        <ButtonComp text="Entrar" action={() => navigate("Home")} color={backgroundColor} />
        <Spacer vertical={20} />
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigate("SignUp")} />
      </View>
    </View>
  );
}
