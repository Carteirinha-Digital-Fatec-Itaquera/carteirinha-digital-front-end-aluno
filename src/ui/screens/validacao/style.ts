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
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerCard: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: "#C9C9C9",
    borderWidth: 1,
    borderRadius: 5, 
    justifyContent:'center', 
    alignItems: 'center'
  },
  title: {
    color: backgroundColor,
    fontSize: 16,
    fontWeight: '600',
    width: '100%',
    padding: 5,
    paddingLeft: 15,
    borderBottomColor: "#C9C9C9",
    borderBottomWidth: 1
  },
  containerImgInfo:{
    flexDirection: 'row',
    width: '100%', 
    justifyContent: "flex-start",
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 15,
  },
  containerInfo:{
    marginLeft: 30,

  },
  textRA:{
    marginTop: 10,
    fontWeight: '700'
  },
  textAluno:{
    fontSize: 20,
    fontWeight: '600'

  },
  textCurso: {
    fontSize: 16,
    color: '#5B5B5B',
    fontWeight: '500'

  }


})