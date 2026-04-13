import { Animated, StyleSheet } from "react-native"
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";


export const styles = StyleSheet.create({
 container: {
    backgroundColor: backgroundColor,
    flex: 1,
    justifyContent: 'space-between',
 },
   logo: {
    margin: 10,
    width: 150,
    height: 90
  },
  logoRodape: {
    width: 200,
    height: 70
   
  },
  imgAluno:{
    width: 80,
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
    alignItems: 'center',
    rowGap: 20,
    
  },
  containerCard: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: "#C9C9C9",
    borderWidth: 1,
    borderRadius: 10, 
    justifyContent:'space-between', 
    alignItems: 'flex-start',
    rowGap: 15,
    paddingBottom: 15,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
    elevation: 8,

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
    paddingLeft: 15,

  },
  containerInfo:{
    marginLeft: 30
  },
  containerNome:{
    width: '85%',
  },

  textRA:{
    marginTop: 10,
    fontWeight: '700'
  },
  textAluno:{
    fontSize: 20,
    fontWeight: '600',
    

  },
  textCurso: {
    fontSize: 16,
    color: '#5B5B5B',
    fontWeight: '500'

  },
  
  
})


