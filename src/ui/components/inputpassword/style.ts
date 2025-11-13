import { StyleSheet } from "react-native";
import { backgroundSecondaryColor, labelColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  subcontainer: {
    display: 'flex',
    flexDirection: 'row',
  },

  label: {
    fontFamily: 'Montserrat',
    fontWeight: '500',
    fontSize: 14,
    color: labelColor,
    marginBottom: 4,
    marginLeft: 8
  },

  inputField: {
    borderWidth: 1,
    borderColor: labelColor,
    borderRadius: 20,
    padding: 14,
    fontSize: 14,
    backgroundColor: backgroundSecondaryColor,
    fontFamily: 'Montserrat',
    marginTop: 4
  },
})