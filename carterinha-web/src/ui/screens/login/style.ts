import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center',
  },

  subcontainer: {
    flex: 1,
    width: "100%",
    borderTopStartRadius: 60,
    borderTopEndRadius: 60,
    backgroundColor: backgroundSecondaryColor,
    justifyContent: 'space-around'

  },
  logo: {
    margin: 10,
    width: 190,
    height: 115
  },
  logocps: {
    display: 'flex',
    alignSelf: 'center',
    width: 300,
    height: 50,
  }
})