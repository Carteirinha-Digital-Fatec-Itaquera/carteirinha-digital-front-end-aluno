import { Image, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { useState } from 'react';
import { backgroundColor } from '../../themes/Color';
import { styles } from './style';

export default function PasswordRecoveryScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [email, setEmail] = useState("")

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={() => navigate("Login")} />
        <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <ButtonComp text="Enviar E-mail" action={() => navigate("Home")} color={backgroundColor} />
      </View>
    </View>
  );
}
