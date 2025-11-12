import { Image, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { useState } from 'react';
import { InputComp } from '../../components/input/InputComp';
import { styles } from './style';
import { backgroundColor } from '../../themes/Color';

export default function SignUpScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [cpf, setCpf] = useState("")

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <TitleComp text="Primeiro Acesso" size={20} />
        <InputComp label="CPF" placeholder="Ex: 000.000.000-00" value={cpf} onChangeText={setCpf} />
        <ButtonComp text="Ir para home" action={() => navigate("Home")} color={backgroundColor} />
      </View>
    </View>
  );
}
