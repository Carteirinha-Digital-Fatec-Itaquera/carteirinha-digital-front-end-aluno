import { View, Text } from "react-native";
import {styles} from './stylesCard'

export interface Props{
    status: string,
    validade: Date

}

function CardValidacaoQrcode({status, validade}: Props){
    return(
        <View style={styles.containerCard}>
            <Text style={styles.title}>Dados da matrícula</Text>
            <View style={styles.containerTuplas}>
                <Text style={styles.textTuplas}>Período</Text>
                <Text style={styles.textTuplasResult}>Tarde</Text>
                </View>
            <View style={styles.containerTuplas}>
                <Text style={styles.textTuplas}>Semestres</Text>
                <Text style={styles.textTuplasResult}>1º/2026</Text>
                </View>
            <View style={styles.containerTuplas}>
                <Text style={styles.textTuplas}>Validade da carteirinha</Text>
                <Text style={status === 'Ativo' && validade > new Date() ? styles.textTuplasDataAtiva : styles.textTuplasDataInativa}>03/09/2026</Text>
                </View>
            <View style={styles.containerTuplas}>
                <Text style={styles.textTuplas}>Tipo</Text>
                <Text style={styles.textTuplasResult}>Tecnólogo</Text>
                </View>
            
        </View>
    )
}
export default CardValidacaoQrcode;