import { Image, View, ActivityIndicator, Alert } from 'react-native';
import { NavigationProps } from '../../../routes';
import { useNavigation } from '@react-navigation/native';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { useContext, useEffect, useState } from 'react';
import { backgroundColor } from '../../themes/Color';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { styles } from './style';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import AsyncStorage from '@react-async-storage/async-storage';
import api from '../../../services/api';
import jwt_decode from 'jwt-decode';
import { AuthContext } from '../../../contexts/AuthContext';

export default function LoginScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('@token');

      if (token) {
        navigate('MainMenu');
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    setLoading(true);

    try {
      const response = api.post('/autenticacao/login', {
        email: email.toLowerCase().trim(),
        password,
      });
      console.log('Resposta do login', response.data);

      if (response.data.status && response.data.content) {
        const token = response.data.content;

        await login(token);

        navigate('MainMenu')
      } else {
        Alert.alert('Erro', response.data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login', error.response?.data || error.message);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Falha ao realizar login'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <SpacerComp vertical={20} />
        <TitleComp text="Login" size={20} />
        <SpacerComp vertical={40} />
        <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={email} onChangeText={setEmail} />
        <SpacerComp vertical={10} />
        <InputPasswordComp label="Senha" placeholder="Ex: ********" value={password} onChangeText={setPassword} />
        <TextClickableComp text="Esqueceu a sua senha?" action={() => navigate("PasswordRecovery")} alignSelf="flex-end"/>
        <SpacerComp vertical={30} />
        <ButtonComp text="Entrar" action={() => navigate("MainMenu")} color={backgroundColor} />
        <SpacerComp vertical={20} />
        <TextClickableComp text="Este é seu primeiro acesso? Clique aqui" action={() => navigate("SignUp")} />
        <Image source={require("../../../assets/images/logos_cps_governo_com_slogan_horizontal_cor.png")} style={styles.logocps} />
      </View>
    </View>
  );
}
