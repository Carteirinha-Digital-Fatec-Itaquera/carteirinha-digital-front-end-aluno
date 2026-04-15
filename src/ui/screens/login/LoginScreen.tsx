import { Image, View ,ActivityIndicator } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { ErrorModalComp } from '../../components/ErrorModal';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import { backgroundColor } from '../../themes/Color';

import { ErrorField } from '../../../utils/Types';

import { login } from '../../../api/auth/login';

import { Auth } from '../../../domains/Auth';

import { NavigationProps } from '../../../routes';

import { styles } from './style';
import CardInfoInstituicao from '../../components/validacaoqrcode/cardinstituicaoinfo/CardInstituicao';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../routes';

export default function LoginScreen() {
  // const { navigate } = useNavigation<NavigationProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [errorFields, setErrorFields] = useState<ErrorField[]>()
  const [modalErrorVisible, setModalErrorVisible] = useState(false)
  const [onLoading, setOnLoading] = useState(false)

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <InternetWatcher />
        <SpacerComp />
        <TitleComp text="Login" size={20} />
        <SpacerComp />
        <InputComp label="E-mail institucional" placeholder="Ex: aluno@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigation.navigate('PasswordRecovery',{})} alignSelf="flex-end" />
        <SpacerComp />
        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={errorFields?.map((val: ErrorField) => { return val.description }) ?? []}
          onClose={() => {
            setMessage("")
            setErrorFields([])
            setModalErrorVisible(false)
          }}
        />
        {onLoading ? (
          <ActivityIndicator
            size="large"
            style={{ transform: [{ scale: 1.5 }] }}
          />
        ) : (
          <ButtonComp
            text="Entrar"
            action={async () => {
              setOnLoading(true)
              const auth = new Auth({ email, password })
              console.log(`primeiro passo: \n${auth.email}\n${auth.password}`)
              
              const result:any = await login(auth)
              console.log(`\n\n${result}\n\isFirstLogin ?: ${result.isFirstLogin }`)

              if('token' in result){
                console.log(`É O PRIMEIRO LOGIN DO CABEÇA?: ${result.isFirstLogin }`)
                
                await AsyncStorage.setItem("token", result.token)
                
                if (result.isFirstLogin ) {
                  navigation.navigate('PasswordRecovery', {
                    firstLogin: true,
                    email
                  })
                } else {
                  navigation.navigate('MainMenu')
                }
              }
              else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }}
            color={backgroundColor}
          />
        )}
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigation.navigate("SignUp")} />
        <SpacerComp />
        <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocps} />
      </View>
    </View>
  );
}
