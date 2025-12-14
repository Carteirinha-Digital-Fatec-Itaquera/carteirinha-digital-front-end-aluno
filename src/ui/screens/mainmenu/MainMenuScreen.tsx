import { Image, View, Alert } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';

import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ButtonGrid } from '../../components/buttonGrid/ButtonGrid';

import { backgroundColor } from '../../themes/Color';
import { styles } from './style';

export default function MainMenuScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/fatec_itaquera_logo.png")}
        style={styles.logo}
      />
      <View style={styles.subcontainer}>
        <SpacerComp vertical={20} />
        <TitleComp text="Bem-vindo, Fulano" size={18} />
        <SpacerComp vertical={20} />
        <ButtonGrid 
          items={[
            { icon: "idcard", label: "Carteirinha", size: "large", onPress: () => navigate("DigitalStudentCard") },
            { icon: "setting",    label: "Ajustes", onPress: () => Alert.alert("Config") },
            { icon: "question-circle",    label: "Ajuda", onPress: () => Alert.alert("Ajuda?")},
          ]}
        />
        <SpacerComp vertical={75} />
        <ButtonComp
        text="Sair"
        action={() => Alert.alert(
          'Confirme',
          'Deseja Sair?',
          [
            {
              text: 'Não',
            },
            {
              text: 'Sim',
              onPress: () => navigate("Login"),
            },
          ],
        )}
        color={backgroundColor}
        />
      </View>
    </View>
  );
}
