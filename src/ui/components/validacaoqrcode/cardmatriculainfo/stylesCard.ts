import { StyleSheet } from "react-native"
import { backgroundColor, backgroundSecondaryColor } from "../../../themes/Color";

export const styles = StyleSheet.create({
containerCard: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: "#C9C9C9",
    borderWidth: 1,
    borderRadius: 10, 
    justifyContent:'space-between', 
    alignItems: 'flex-start',
    rowGap: 10,
    paddingBottom: 15,
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
    top: 5


  },
  containerTuplas:{
    width: '100%',
    paddingLeft: 15,
    borderTopColor: "#C9C9C9",
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15,
    paddingBottom: 10,
  

  },
  textTuplas:{
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
    top: 10

  },
    textTuplasResult:{
    color: '#000000ff',
    fontSize: 13,
    fontWeight: '700',
      top: 10

  },
  textTuplasDataAtiva:{
    fontSize: 13,
    fontWeight: '700',
    top: 10, 
    color: '#1e9947ff',
  },
  textTuplasDataInativa:{
    fontSize: 13,
    fontWeight: '700',
    top: 10, 
    color: '#ac1b1b',
  }
  
})