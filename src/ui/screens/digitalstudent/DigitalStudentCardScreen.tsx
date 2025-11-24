import { Text, View, Image } from 'react-native';
import { TitleComp } from '../../components/title/TitleComp';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../../routes';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DigitalStudentCardScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  return (
    <SafeAreaView style={styles.container}>
      <SpacerComp vertical={20} />
      <TitleComp text="Carteirinha Digital" showButton={true} actionButton={() => navigate("MainMenu")} />
      <Image source={require("../../../assets/images/fatec_itaquera_logo_preto.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <View style={styles.imagecontainer}>
          <Image source={require("../../../assets/images/perfil_default.png")} style={styles.image} />
          <Image source={require("../../../assets/images/qrcode_default.png")} style={styles.image} />
        </View>
        <View style={styles.infocontainer}>
          <Text style={[styles.texto1, { textAlign: 'center', marginTop: 5, fontSize: 18 }]}>Nome do Aluno</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>RG: </Text><Text style={styles.texto2}>123456781</Text>
            <Text style={styles.texto1}>CPF: </Text><Text>12345678912</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>NASCIMENTO: </Text>
            <Text>12-12-1234</Text>
          </View>
        </View>
        <View style={styles.infocontainer}>
          <Text style={{ marginLeft: 10, marginTop: 5, fontSize: 18 }}>Curso Superior de Tecnologia em Multiplataforma</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>PERIODO: </Text><Text style={styles.texto2}>Tarde</Text>
            <Text style={styles.texto1}>RA: </Text><Text>257139252123</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>VALIDADE: </Text>
            <Text>12-12-1234</Text>
          </View>
        </View>
      </View>
      {/* <Image source={require("../../../assets/images/cps_logo_cor.png")} style={styles.logo_cps} /> */}
      <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocpssp} />
    </SafeAreaView>
  );
}
