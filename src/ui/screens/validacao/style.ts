import { StyleSheet } from "react-native"
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
 container: {
    backgroundColor: backgroundColor,
    flex: 1,
    justifyContent: 'space-between'
 },
   logo: {
    margin: 10,
    width: 190,
    height: 115
  },
  logoRodape: {
   
  },
  imgAluno:{
    width: 50,
    height: 80,

  },
  containerRodape:{
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerInformacoes: {
    backgroundColor: '#e7e7e7ff',
    padding: 15,
    width: '100%',
    flex: 1
  }
})