import { StyleSheet } from "react-native";
import { backgroundSecondaryColor, labelColor } from "../../themes/Color";

export const styles = StyleSheet.create({
    formGroup: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },

    label: {
        fontFamily: 'Montserrat',
        fontSize: 14,
        color: labelColor,
        marginBottom: 6,
        marginLeft: 4,
    },

    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        backgroundColor: backgroundSecondaryColor,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 4,
    },

    inputText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Montserrat-Medium',
        color: labelColor,
        paddingVertical: 0,
    },

    inputIcon: {
        width: 24,
        height: 24,
        opacity: 0.65,
        marginLeft: 8,
    },
});