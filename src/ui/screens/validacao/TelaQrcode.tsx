import React from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { styles } from './style';
import Badge from "../../components/validacaoqrcode/Badge";
import CardMatricula from "../../components/validacaoqrcode/cardmatriculainfo/CardMatricula";
import CardInfoInstituicao from "../../components/validacaoqrcode/cardinstituicaoinfo/CardInstituicao";

function TelaQrcode(){
    return(
      <>
      <ScrollView>
      <View style={styles.container}>
          <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo}/>

        
          <View style={styles.containerInformacoes}>
            <View style={styles.containerCard}>
              <Text style={styles.title}>Aluno</Text>

              <View style={styles.containerImgInfo}>
                <Image source={require("../../../assets/images/perfil_default.png")} style={styles.imgAluno}></Image>
                <View style={styles.containerInfo}>
                  <Text style={styles.textAluno}>Joao Fulano</Text>
                  <Text style={styles.textCurso}>Desenvolvimento de software</Text>
                  <Text style={styles.textRA}>RA: 874375327</Text>
                </View>
              </View>

              <Badge status="Ativo" validade={new Date("2029-03-02")} />
            </View>
            <CardMatricula status="Ativo" validade={new Date("2029-03-02")}/>

            <CardInfoInstituicao/>

          </View>
          

           <View style={styles.containerRodape}>
          <Image source={require("../../../assets/images/logos_cps_governo_com_slogan.png")} style={styles.logoRodape}/>
          </View>
          

      </View>
      </ScrollView>

      </>
        

      
    )
}
export default TelaQrcode;