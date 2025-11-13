import { StyleSheet } from "react-native";
import { backgroundColor, titleColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingTop: 35,
    paddingBottom: 6,
  },

  titleContainer: {
    flex: 1, 
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '600',
    color: titleColor,
    textAlign: 'center'
  },

  divider: {
    height: 3,
    backgroundColor: titleColor,
    width: '65%',
    marginBottom: 10
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