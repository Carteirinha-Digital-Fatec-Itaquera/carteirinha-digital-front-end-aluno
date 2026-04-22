import React, { useState } from "react";
import { Text, View, Image } from "react-native";
import { styles } from './styleBadge';

export interface Props{
    status: string,
    validade: Date

}

function Badge({status, validade}: Props ){
const [matricula, setMatricula] = useState<string | undefined>()
    return(
        <View style={status === 'Ativo' && validade > new Date() ? styles.containerBadgeAtiva : styles.containerBadgeInativa}>

        <View style={status === 'Ativo' && validade > new Date() ? styles.pontoAtiva : styles.pontoInativa}></View>
        <Text style={status === 'Ativo' && validade > new Date() ? styles.textAtiva : styles.textInativa}>Matrícula {status === 'Ativo' && validade > new Date() ? 'Ativa' : 'Inativa'}</Text>
        </View>
    )
}
export default Badge