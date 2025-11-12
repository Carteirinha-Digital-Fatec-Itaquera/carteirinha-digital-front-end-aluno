import { StyleSheet } from "react-native";
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: backgroundColor,
        alignItems: 'center'
    },
    
    subcontainer: {
        flex: 1,
        width: "100%",
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        backgroundColor: backgroundSecondaryColor
    },
    logo: {
        margin: 20
    }
})