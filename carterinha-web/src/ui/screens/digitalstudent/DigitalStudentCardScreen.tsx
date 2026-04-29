import React, { useEffect, useState } from "react";
import { Text, View, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleComp } from '../../components/title/TitleComp';
import { InternetWatcher } from "../../components/internetwatcher/InternetWatcher";
import { ErrorModalComp } from "../../components/ErrorModal/ErrorModalComp";

import { findProfile } from "../../../api/student/findProfile";

import { Student } from "../../../domains/Student";

import { NavigationProps } from '../../../routes';

import { styles } from './style';
import QRCode from "react-native-qrcode-svg";

export default function DigitalStudentCardScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);


  useEffect(() => {
    const loadStudent = async () => {
      const result = await findProfile();

      if ('code' in result) {
        setMessage(result.message);
        setModalErrorVisible(true);
      } else {
        setStudent(result);
      }
    };

    loadStudent();
  }, []);

  if (!student) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <ErrorModalComp
        visible={modalErrorVisible}
        error={message}
        fields={[]}
        onClose={() => {
          setMessage("");
          setModalErrorVisible(false);
          navigate("MainMenu");
        }}
      />
      <TitleComp text="Carteirinha Digital" showButton={true} actionButton={() => navigate("MainMenu")} />
      <Image source={require("../../../assets/images/fatec_itaquera_logo_preto.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <InternetWatcher />
        <View style={styles.imagecontainer}>
          <Image
            source={
              student.photo && student.photo.length > 0
                ? { uri: student.photo }
                : require("../../../assets/images/perfil_default.png")
            }
            style={styles.image}
          />
          <QRCode
            value="https://meusite.com"
            size={200}
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
