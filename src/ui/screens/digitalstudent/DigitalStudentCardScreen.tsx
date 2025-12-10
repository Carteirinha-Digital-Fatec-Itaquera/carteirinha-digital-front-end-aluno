import React, { useEffect, useState } from "react";
import { Text, View, Image, Button, ActivityIndicator } from 'react-native';
import { TitleComp } from '../../components/title/TitleComp';
import { styles } from './style';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NavigationProps, RootStackParamList } from '../../../routes';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../services/api';

export default function DigitalStudentCardScreen({ route }: { route: RouteProp<RootStackParamList, 'DigitalStudentCard'> }) {
  const { estudanteRa } = route.params;

  const [estudante, setEstudante] = useState({
    course: '',
    period: '',
    name: '',
    cpf: '',
    rg: '',
    qrcode: '',
    photo: '',
    birthDate: '',
    dueDate: ''
  });
  const { navigate } = useNavigation<NavigationProps>();

  async function carregarEstudante() {
    try {
      const res = await api.get(`/${estudanteRa}`);
      setEstudante(res.data);
    } catch (error) {
      console.error("Erro ao buscar estudante:", error);
    }
  }

  useEffect(() => {
    carregarEstudante();
  }, []);

  if (!estudante) return <ActivityIndicator size="large" />

  return (
    <SafeAreaView style={styles.container}>
      <SpacerComp vertical={20} />
      <TitleComp text="Carteirinha Digital" showButton={true} actionButton={() => navigate("MainMenu")} />
      <Image source={require("../../../assets/images/fatec_itaquera_logo_preto.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <View style={styles.imagecontainer}>
          <Image
            source={
              estudante.photo && estudante.photo.length > 0
                ? { uri: estudante.photo }
                : require("../../../assets/images/perfil_default.png")
            }
            style={styles.image}
          />
          <Image
            source={
              estudante.qrcode && estudante.qrcode.length > 0
                ? { uri: estudante.qrcode }
                : require("../../../assets/images/qrcode_default.png")
            }
            style={styles.image}
          />
        </View>
        <View style={styles.infocontainer}>
          <Text style={[styles.texto1, { textAlign: 'center', marginTop: 5, fontSize: 18 }]}>{estudante.name}</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>RG: </Text><Text style={styles.texto2}>{estudante.rg}</Text>
            <Text style={styles.texto1}>CPF: </Text><Text>{estudante.cpf}</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>NASCIMENTO: </Text>
            <Text>{estudante.birthDate}</Text>
          </View>
        </View>
        <View style={styles.infocontainer}>
          <Text style={{ marginLeft: 10, marginTop: 5, fontSize: 18 }}>{estudante.course}</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>PERIODO: </Text><Text style={styles.texto2}>{estudante.period}</Text>
            <Text style={styles.texto1}>RA: </Text><Text>{estudanteRa}</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>VALIDADE: </Text>
            <Text>{estudante.dueDate}</Text>
          </View>
        </View>
      </View>
      {/* <Image source={require("../../../assets/images/cps_logo_cor.png")} style={styles.logo_cps} /> */}
      <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocpssp} />
    </SafeAreaView>
  );
}
