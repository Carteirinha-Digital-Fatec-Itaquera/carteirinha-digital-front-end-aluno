import { NavigationContainer } from "@react-navigation/native";

import StackRoute from "./stack.route";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    SignUp: undefined;
    // PasswordRecovery: undefined;
    PasswordRecovery: {
      firstLogin?: boolean;
      email?: string;
    };
    MainMenu: undefined;
    DigitalStudentCard: undefined;
    UploadImage: undefined;
};

// export type NavigationProps = NativeStackNavigationProp<RootStackParamList, "Login">;

//    A
//    | Comentado acima por erro na passagem de valores entre views Login-> LOginScreen -> PasswordRecoveryScreeen

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;


export default function Routes() {
  return (
    <NavigationContainer>
      <StackRoute/>
    </NavigationContainer>
  )
}