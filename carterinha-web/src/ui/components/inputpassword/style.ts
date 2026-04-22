import { StyleSheet } from "react-native";
import { backgroundSecondaryColor, labelColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },

  label: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: labelColor,
    marginBottom: 4,
    marginLeft: 12,
  }, 

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: labelColor,
    borderRadius: 20,
    backgroundColor: backgroundSecondaryColor,
    paddingHorizontal: 10,
    paddingVertical: 3
  },

  inputText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  }
});