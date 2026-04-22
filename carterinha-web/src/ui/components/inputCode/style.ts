import { StyleSheet } from 'react-native';
import { backgroundSecondaryColor, labelColor } from '../../themes/Color';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'center'
  },

  subcontainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  label: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: labelColor,
    marginLeft: 32,
    marginBottom: 4
  },

  inputField: {
    borderWidth: 1,
    borderColor: labelColor,
    borderRadius: 20,
    fontSize: 14,
    backgroundColor: backgroundSecondaryColor,
    fontFamily: 'Montserrat-Medium',
    padding: 20,
    margin: 2
  },
});