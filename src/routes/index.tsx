import { NavigationContainer } from "@react-navigation/native";

import StackRoute from "./stack.route";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    SignUp: undefined;
    PasswordRecovery: undefined;
    MainMenu: undefined;
    DigitalStudentCard: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function Routes() {
  return (
    <NavigationContainer>
      <StackRoute/>
    </NavigationContainer>
  )
}