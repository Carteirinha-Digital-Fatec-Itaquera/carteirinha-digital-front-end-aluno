import { Dispatch, SetStateAction, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { TextInfoComp } from '../../components/textinfo/TextInfoComp';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';
import { ErrorModalComp } from '../../components/ErrorModal';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import { backgroundColor } from '../../themes/Color';
import { NavigationProps } from '../../../routes';
import { ErrorField } from '../../../utils/Types';

import { sendEmail } from '../../../api/recoverypassword/sendEmail';
import { sendCode } from '../../../api/recoverypassword/sendCode';
import { sendPassword } from '../../../api/recoverypassword/sendPassword';

import { RecoveryPassword } from '../../../domains/RecoveryPassword';
import { Email } from '../../../domains/Email';

import { styles } from './style';

import { useRoute } from '@react-navigation/native';


//Tipagem de rota para aplicação dq pode receber - Alterações de Jhon 
type PasswordRecoveryRouteParams = {
  firstLogin?: boolean;
  emailParam?: string;
};
//
type Step = 1 | 2 | 3;

export default function PasswordRecoveryScreen() {

  // Alterações de Jhon 
  const route = useRoute();
  const { firstLogin, emailParam } = (route.params ?? {}) as PasswordRecoveryRouteParams;
  // const [ emailState, setEmailParam ] = useState(emailParam ?? "");
  const [email, setEmail] = useState(emailParam ?? "");
  // const [email, setEmail] = useState("");
  //
  const { navigate } = useNavigation<NavigationProps>();

  const [step, setStep] = useState<Step>(1);


  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState<ErrorField[]>();
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  function showError(message: string, fields?: ErrorField[] | null) {
    setMessage(message);
    setErrorFields(fields ?? []);
    setModalErrorVisible(true);
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/images/fatec_itaquera_logo.png")} style={styles.logo} />
      <View style={styles.subcontainer}>
        <InternetWatcher />
        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={errorFields?.map((val: ErrorField) => val.description) ?? []}
          onClose={() => {
            setMessage("");
            setErrorFields([]);
            setModalErrorVisible(false);
          }}
        />

        {step === 1 && (
          <PasswordRecoveryPart1Comp
          navigateBackButton={() => navigate("Login")}
          navigateNextStepButton={async () => {
            setOnLoading(true);
            const result = await sendEmail(new Email({ email }));
            if ('ok' in result) {
              setStep(2);
            } else {
              showError(result.message, result.errorFields);
            }
            setOnLoading(false);
          }}
          value={email}
          setValue={setEmail}
          onLoading={onLoading}
          firstLogin={firstLogin}
          />
        )}

        {step === 2 && (
          <PasswordRecoveryPart2Comp
            navigateBackButton={() => setStep(1)}
            navigateNextStepButton={async () => {
              setOnLoading(true);
              const result = await sendCode(email, code);
              if ('ok' in result) {
                setStep(3);
              } else {
                showError(result.message, result.errorFields);
              }
              setOnLoading(false);
            }}
            value={code}
            setValue={setCode}
            onLoading={onLoading}
          />
        )}

        {step === 3 && (
          <PasswordRecoveryPart3Comp
            navigateBackButton={() => setStep(2)}
            navigateNextStepButton={async (passwordEquals: boolean) => {
              setOnLoading(true);

              if (!passwordEquals) {
                showError("As senhas não são iguais.");
                setOnLoading(false);
                return;
              }

              const result = await sendPassword(new RecoveryPassword({ email, code, newPassword: password }));
              if ('ok' in result) {
                navigate('Login');
              } else {
                showError(result.message, result.errorFields);
              }
              setOnLoading(false);
            }}
            value={password}
            setValue={setPassword}
            onLoading={onLoading}
          />
        )}
      </View>
    </View>
  );
}

type PasswordRecoveryProps = {
  navigateBackButton: () => void;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onLoading: boolean;
  navigateNextStepButton: () => void;
  firstLogin?:boolean
};

type PasswordRecoveryNextStepBooleanProps = {
  navigateBackButton: () => void;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onLoading: boolean;
  navigateNextStepButton: (value: boolean) => void;
};

function PasswordRecoveryPart1Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton, firstLogin }: PasswordRecoveryProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text= {
        firstLogin?
        "Bem vindo à Carterinha Digital da Fatec":
        "Recuperação de senha"
      } size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira seu e-mail institucional para enviarmos um código de segurança
      </TextInfoComp>
      <InputComp label="E-mail institucional" placeholder="Ex: fulano@fatec.sp.gov.br" value={value} onChangeText={setValue} />
      <SpacerComp vertical={50} />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp text="Enviar E-mail" action={navigateNextStepButton} color={backgroundColor} />
      )}
      <SpacerComp vertical={20} />
    </>
  );
}

function PasswordRecoveryPart2Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: PasswordRecoveryProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira o código de segurança que enviamos no seu e-mail institucional
      </TextInfoComp>
      <InputCodeComp label="Insira o código" onChangeText={setValue} />
      <SpacerComp vertical={50} />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp text="Enviar código" action={navigateNextStepButton} color={backgroundColor} />
      )}
      <SpacerComp vertical={20} />
    </>
  );
}

function PasswordRecoveryPart3Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: PasswordRecoveryNextStepBooleanProps) {
  const [repeatPassword, setRepeatPassword] = useState("");
  return (
    <>
      <SpacerComp />
      <TitleComp text="Recuperação de senha" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Código validado com sucesso! Redefina sua senha
      </TextInfoComp>
      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />
      <SpacerComp vertical={50} />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp
          text="Redefinir"
          action={() => navigateNextStepButton(value === repeatPassword)}
          color={backgroundColor}
        />
      )}
      <SpacerComp vertical={20} />
    </>
  );
}
