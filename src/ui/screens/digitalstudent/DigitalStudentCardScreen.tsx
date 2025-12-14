import React, { useEffect, useState } from "react";
import { Text, View, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpacerComp } from '../../components/spacer/SpacerComp';
import { TitleComp } from '../../components/title/TitleComp';

import { findProfile } from "../../../api/student/findProfile";

import { Student } from "../../../domains/Student";

import { NavigationProps } from '../../../routes';

import { styles } from './style';

export default function DigitalStudentCardScreen() {
  
  const [student, setStudent] = useState<Student | undefined>(undefined);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await findProfile();
        setStudent(data);
      } catch (error) {
        console.error("Erro ao carregar aluno:", error);
      }
    };

    loadStudent();
  }, []);

  const { navigate } = useNavigation<NavigationProps>();

  if (!student) return <ActivityIndicator size="large" />

  return (
    <SafeAreaView style={styles.container}>
      <SpacerComp vertical={20} />
      <TitleComp text="Carteirinha Digital" showButton={true} actionButton={() => navigate("MainMenu")} />
      <Image source={require("../../../assets/images/fatec_itaquera_logo_preto.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <View style={styles.imagecontainer}>
          <Image
            source={
              student.photo && student.photo.length > 0
                ? { uri: student.photo }
                : require("../../../assets/images/perfil_default.png")
            }
            style={styles.image}
          />
          <Image
            source={
              student.qrcode && student.qrcode.length > 0
                ? { uri: student.qrcode }
                : require("../../../assets/images/qrcode_default.png")
            }
            style={styles.image}
          />
        </View>
        <View style={styles.infocontainer}>
          <Text style={[styles.texto1, { textAlign: 'center', marginTop: 5, fontSize: 18 }]}>{student.name}</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>RG: </Text><Text style={styles.texto2}>{student.rg}</Text>
            <Text style={styles.texto1}>CPF: </Text><Text>{student.cpf}</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>NASCIMENTO: </Text>
            <Text>{student.birthDate}</Text>
          </View>
        </View>
        <View style={styles.infocontainer}>
          <Text style={{ marginLeft: 10, marginTop: 5, fontSize: 18 }}>{student.course}</Text>
          <View style={styles.cut}>
            <Text style={styles.texto1}>PERIODO: </Text><Text style={styles.texto2}>{student.period}</Text>
            <Text style={styles.texto1}>RA: </Text><Text>{student.ra}</Text>
          </View>
          <View style={styles.cut}>
            <Text style={styles.texto1}>VALIDADE: </Text>
            <Text>{student.dueDate}</Text>
          </View>
        </View>
      </View>
      <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocpssp} />
    </SafeAreaView>
  );
}
