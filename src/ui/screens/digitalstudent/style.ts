import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  subcontainer: {
    flex: 1,
    width: "90%",
    borderRadius: 20,
    backgroundColor: backgroundColor,
    marginBottom: 20
  },
  imagecontainer: {
    flexDirection: 'row',
    margin: 10,
    gap: 30
  },
  image: {
    width: 120,
    height: 130,
    borderRadius: 5
  },
  infocontainer: {
    margin: 10,
    backgroundColor: backgroundSecondaryColor,
    borderRadius: 10,
  },
  cut: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 5,
    marginBottom: 5,
  },
  texto1: {
    fontWeight: 'bold',
  },
  texto2: {
    marginRight: 30,
  },
  logo_fatec: {
    margin: 20,
    width: 100,
    height: 60
  },
  logo_cps: {
    marginBottom: 40,
    width: 100,
    height: 67
  }
})