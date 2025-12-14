import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    gap: "20%"
  },
  image: {
    width: "40%",
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
    fontFamily: 'Montserrat-Medium',
    fontSize: 16
  },
  texto2: {
    marginRight: "24%",
    fontFamily: 'Montserrat-Medium',
    fontSize: 16
  },
  logo: {
    display: 'flex',
    alignSelf: 'center',
    margin: 10,
    width: 190,
    height: 115
  },
  logo_cps: {
    marginBottom: 40,
    width: 100,
    height: 67
  },
  logocpssp: {
    display: 'flex',
    alignSelf: 'center',
    width: 300,
    height: 50,
  }
})
