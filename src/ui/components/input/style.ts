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
        marginLeft: 12,
        marginBottom: 4
    },

    inputField: {
        borderWidth: 1,
        borderColor: labelColor,
        borderRadius: 20,
        padding: 14,
        fontSize: 14,
        backgroundColor: backgroundSecondaryColor,
        fontFamily: 'Montserrat-Medium',
    },
})