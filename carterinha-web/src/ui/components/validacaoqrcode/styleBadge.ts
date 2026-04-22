import { StyleSheet } from "react-native"
import { backgroundColor, backgroundSecondaryColor } from "../../themes/Color";


export const styles = StyleSheet.create({
    containerBadgeAtiva: {
        backgroundColor: '#b6ebc3ff',
        width: 150,
        paddingLeft: 10,
        paddingRight: 10,
        borderColor: '#70B882',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
        borderRadius: 50,
        flexDirection: 'row',
        columnGap: 10,
        marginLeft: 15,
        shadowColor: '#0fb045ff',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 7,
        elevation: 8,

    },
    containerBadgeInativa:{
        backgroundColor: '#fdc7c7ff',
        width: 150,
        paddingLeft: 10,
        paddingRight: 10,
        borderColor: 'red',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
        borderRadius: 50,
        flexDirection: 'row', 
        columnGap: 10,
        marginLeft: 15,
        shadowColor: '#eb4848ff',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 7,
        elevation: 8,
    },
    textAtiva: {
        color:'#1e9947ff',
        fontSize: 14,
        fontWeight: '600'

    },
      textInativa: {
        color:'#ca0909',
        fontSize: 14,
        fontWeight: '600'

    },
    pontoAtiva: {
        width: 8,
        height: 8,
        borderRadius: 50,
        backgroundColor: '#1e8629ff',
        top:1
    },
    pontoInativa: {
        width: 8,
        height: 8,
        borderRadius: 50,
        backgroundColor: '#ca0909',
        top: 1
    }

})