import { Image, View } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { useState } from 'react';
import { backgroundColor } from '../../themes/Color';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { styles } from './style';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorField } from '../../../utils/Types';
import { login } from '../../../api/auth/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorModalComp } from '../../components/ErrorModal';
import { ActivityIndicator } from 'react-native';
import { Auth } from '../../../domains/Auth';

export default function LoginScreen() {
  const { navigate } = useNavigation<NavigationProps>();

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
        <SpacerComp />
        <TitleComp text="Login" size={20} />
        <SpacerComp />
        <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("PasswordRecovery")} alignSelf="flex-end"/>
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
              const result = await login(auth)
              if ('token' in result) {
                await AsyncStorage.setItem("token", result.token)
                navigate('MainMenu')
              } else {
                setMessage(result.message)
                setErrorFields(result.errorFields ?? [])
                setModalErrorVisible(true)
              }
              setOnLoading(false)
            }}
            color={backgroundColor}
          />
        )}
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigate("SignUp")} />
        <SpacerComp />
        <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocps} />
      </View>
    </View>
  );
}
