import { Dispatch, SetStateAction, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { InputComp } from '../../components/input/InputComp';
import { ButtonComp } from '../../components/button/ButtonComp';
import { TitleComp } from '../../components/title/TitleComp';
import { TextClickableComp } from '../../components/textclickable/TextClickableComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { InputCodeComp } from '../../components/inputCode/InputCodeComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { TextInfoComp } from '../../components/textinfo/TextInfoComp';
import { ErrorModalComp } from '../../components/ErrorModal';
import { InternetWatcher } from '../../components/internetwatcher/InternetWatcher';

import { ErrorField } from '../../../utils/Types';

import { backgroundColor } from '../../themes/Color';

import { NavigationProps } from '../../../routes';

import { FirstAccess } from '../../../domains/FirstAccess';

import { sendCpf } from '../../../api/firstaccess/sendCpf';
import { sendCode } from '../../../api/firstaccess/sendCode';
import { sendPassword } from '../../../api/firstaccess/sendPassword';

import { styles } from './style';

type Step = 1 | 2 | 3 | 4;

export default function SignUpScreen() {
  const { navigate } = useNavigation<NavigationProps>();

  const [step, setStep] = useState<Step>(1);

  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("faluno@fatec.sp.gov.br");
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
          <SignUpPart1Comp
            navigateBackButton={() => navigate("Login")}
            navigateNextStepButton={async () => {
              setOnLoading(true);
              const result = await sendCpf(new FirstAccess({ cpf, code: null, password: null }));
              if ('email' in result) {
                if (result.email !== "") {
                  setEmail(result.email);
                  setStep(2);
                }
              } else {
                showError(result.message, result.errorFields);
              }
              setOnLoading(false);
            }}
            value={cpf}
            setValue={setCpf}
            onLoading={onLoading}
          />
        )}

        {step === 2 && (
          <SignUpPart2Comp
            navigateBackButton={() => setStep(1)}
            navigateNextStepButton={() => setStep(3)}
            value={email}
            setValue={setEmail}
            onLoading={onLoading}
          />
        )}

        {step === 3 && (
          <SignUpPart3Comp
            navigateBackButton={() => setStep(2)}
            navigateNextStepButton={async () => {
              setOnLoading(true);
              const result = await sendCode(new FirstAccess({ cpf, code, password: null }));
              if ('ok' in result) {
                setStep(4);
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

        {step === 4 && (
          <SignUpPart4Comp
            navigateBackButton={() => setStep(3)}
            navigateNextStepButton={async (passwordEquals: boolean) => {
              setOnLoading(true);

              if (!passwordEquals) {
                showError("As senhas não são iguais.");
                setOnLoading(false);
                return;
              }

              const result = await sendPassword(new FirstAccess({ cpf, code, password }));
              if ('ok' in result) {
                navigate("Login");
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

type SignupCompProps = {
  navigateBackButton: () => void;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onLoading: boolean;
  navigateNextStepButton: () => void;
};

type SignupCompNextStepBooleanProps = {
  navigateBackButton: () => void;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onLoading: boolean;
  navigateNextStepButton: (x: boolean) => void;
};

function SignUpPart1Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <TitleComp text="Primeiro Acesso" size={20} />
      <InputComp label="CPF" placeholder="Ex: 000.000.000-00" value={value} onChangeText={setValue} />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp text="Enviar CPF" action={navigateNextStepButton} color={backgroundColor} />
      )}
      <TextClickableComp text="Este não é seu primeiro acesso? Clique aqui" action={navigateBackButton} />
    </>
  );
}

function SignUpPart2Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Enviamos um código no seu e-mail institucional para definição da senha!
      </TextInfoComp>
      <View style={styles.containertext}>
        <Text style={styles.textLabel}> E-mail: </Text>
        <Text style={styles.textValue}> {value} </Text>
      </View>
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      <ButtonComp text="Prosseguir" action={navigateNextStepButton} color={backgroundColor} />
    </>
  );
}

function SignUpPart3Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompProps) {
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Insira o código de segurança que enviamos no seu e-mail institucional
      </TextInfoComp>
      <InputCodeComp label="Insira o código" onChangeText={setValue} />
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp text="Enviar código" action={navigateNextStepButton} color={backgroundColor} />
      )}
    </>
  );
}

function SignUpPart4Comp({ navigateBackButton, value, setValue, onLoading, navigateNextStepButton }: SignupCompNextStepBooleanProps) {
  const [repeatPassword, setRepeatPassword] = useState("");
  return (
    <>
      <SpacerComp />
      <TitleComp text="Primeiro Acesso" size={20} showButton={true} actionButton={navigateBackButton} />
      <TextInfoComp>
        Código validado com sucesso!
        Defina sua senha
      </TextInfoComp>
      <InputPasswordComp label="Insira a nova senha" placeholder="Ex: ********" value={value} onChangeText={setValue} />
      <InputPasswordComp label="Repita a senha" placeholder="Ex: ********" value={repeatPassword} onChangeText={setRepeatPassword} />
      <SpacerComp />
      <SpacerComp />
      <SpacerComp />
      {onLoading ? (
        <ActivityIndicator size="large" style={{ transform: [{ scale: 1.5 }] }} />
      ) : (
        <ButtonComp
          text="Definir senha"
          action={() => navigateNextStepButton(value === repeatPassword)}
          color={backgroundColor}
        />
      )}
    </>
  );
}
