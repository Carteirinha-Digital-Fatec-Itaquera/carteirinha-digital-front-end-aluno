import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../ui/screens/login/LoginScreen"
import SignUpScreen from "../ui/screens/signup/SignUpScreen"
import PasswordRecoveryScreen from "../ui/screens/passwordrecovery/PasswordRecoveryScreen"
import MainMenuScreen from "../ui/screens/mainmenu/MainMenuScreen"
import DigitalStudentCardScreen from "../ui/screens/digitalstudent/DigitalStudentCardScreen"
import UploadImageScreen from "../ui/screens/uploadimage/UploadImageScreen"

const Stack = createNativeStackNavigator()

export default function StackRoute() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PasswordRecovery"
        component={PasswordRecoveryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="UploadImage"
        component={UploadImageScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DigitalStudentCard"
        component={DigitalStudentCardScreen}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  )
}