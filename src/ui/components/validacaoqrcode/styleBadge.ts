import { StyleSheet } from "react-native"
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";


export const styles = StyleSheet.create({
    containerBadgeAtiva: {
        backgroundColor: '#70B882',
        width: 140,
        padding: 5,
        borderColor: '#70B882',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerBadgeInativa:{
        backgroundColor: 'red',
        width: 140,
        padding: 5,
        borderColor: 'red',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }

})