import React from "react";
import { Text, View, Image } from "react-native";
import { styles } from './style';

function TelaQrcode(){
    return(
      <>
      <View style={styles.container}>
          <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo}/>

          <View style={styles.containerInformacoes}>
            <View style={styles.containerCard}>
              <Text>Aluno</Text>

              <View>
                <Image source={require("../../../assets/images/perfil_default.png")} style={styles.imgAluno}></Image>
                <View>
                  <Text>Joao Fulano</Text>
                  <Text>Desenvolvimento de software</Text>
                  <Text>RA: 874375327</Text>
                </View>
              </View>

              <View>badge</View>
              // os outros dois cards


            </View>

          </View>

           <View style={styles.containerRodape}>
          <Image source={require("../../../assets/images/logos_cps_governo_com_slogan.png")} style={styles.logoRodape}/>
          </View>

      </View>

      </>
        

      
    )
}
export default TelaQrcode;