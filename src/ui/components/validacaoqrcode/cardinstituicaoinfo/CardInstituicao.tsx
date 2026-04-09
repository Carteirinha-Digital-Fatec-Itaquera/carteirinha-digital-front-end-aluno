import { Text, View } from "react-native";
import { styles } from './stylesCard'

function CardInfoInstituicao(){
    return(
        <View style={styles.containerCardInstituicao}>
                        <Text style={styles.titleInstituicao}>Instituição</Text>
                        <View style={styles.containerTuplas}>
                            <Text style={styles.textTuplas}>Faculdade</Text>
                            <Text style={styles.textTuplasResult}>Fatec Itaquera Prof. Miguel Reale</Text>
                            </View>
                        <View style={styles.containerTuplas}>
                            <Text style={styles.textTuplas}>Diretor</Text>
                            <Text style={styles.textTuplasResult}>Luis Carlos Barbosa de Oliveira</Text>
                            </View>
                        <View style={styles.containerTuplas}>
                            <Text style={styles.textTuplas}>Endereço</Text>
                            <Text style={styles.textTuplasResult}>Av. Miguel Ignácio Curi, 360 - Vila Carmosina - Itaquera</Text>
                            </View>
                        <View style={styles.containerTuplas}>
                            <Text style={styles.textTuplas}>Telefone</Text>
                            <Text style={styles.textTuplasResult}>{`(11) 2056-4347 / 2056-4245`}</Text>
                            </View>
                        
                    </View>
    )
}
export default CardInfoInstituicao