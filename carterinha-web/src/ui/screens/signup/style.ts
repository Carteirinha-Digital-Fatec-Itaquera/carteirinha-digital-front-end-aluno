import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor, labelColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: 'center'
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

  containertext: {
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    margin: 20
  },

  textLabel: {
    alignSelf: "center",
    fontFamily: 'Montserrat-Medium',
    fontSize: 18,
    color: labelColor,
    textAlign: 'justify',
  },

  textValue: {
    alignSelf: "center",
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: labelColor,
    textAlign: 'justify',
  }
})