import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundSecondaryColor,
    padding: 20,
    gap: 10
  },
  box: {
    width: 306,
    height: 406,
    borderWidth: 4,
    borderColor: "#000", 
    borderRadius: 0, 
    padding: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
    placeholderImage: {
    width: 500,
    height: 500,
    resizeMode: "center",
    opacity: 1,   
  },
    userImage: {
    width: 300,
    height: 400,
    opacity: 1,
  },
  button: {
    backgroundColor: backgroundColor,
    borderRadius: 35,
    padding: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  buttonText: {
    color: backgroundSecondaryColor,
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5
  }
})