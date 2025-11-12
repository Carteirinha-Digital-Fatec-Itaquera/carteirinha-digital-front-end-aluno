import { StyleSheet } from "react-native";
import { titleColor } from "../../themes/Color";

export const styles = StyleSheet.create({
    container: {
        paddingTop: 35,
        paddingBottom: 6,
        alignItems: 'center',
        marginBottom: 8
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
})