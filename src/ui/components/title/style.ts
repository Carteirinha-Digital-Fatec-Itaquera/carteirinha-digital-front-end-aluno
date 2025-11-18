import { StyleSheet } from "react-native";
import { backgroundColor, titleColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: titleColor,
    textAlign: 'center'
  },

  divider: {
    height: 3,
    backgroundColor: titleColor,
    width: '65%',
  },

  button: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundColor,
    borderTopEndRadius: 20,
    borderBottomEndRadius: 20,
    alignSelf: 'flex-start',
  }

})