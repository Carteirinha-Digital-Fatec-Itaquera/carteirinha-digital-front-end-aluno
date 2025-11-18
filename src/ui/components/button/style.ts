import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    button: {
        backgroundColor: '#006516',
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

    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        tintColor: '#fff'
    },

    text: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        letterSpacing: 0.5
    },

}) 