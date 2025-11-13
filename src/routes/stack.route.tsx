import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../ui/screens/home/HomeScreen"
import LoginScreen from "../ui/screens/login/LoginScreen"
import SignUpScreen from "../ui/screens/signup/SignUpScreen"
import PasswordRecoveryScreen from "../ui/screens/passwordrecovery/PasswordRecoveryScreen"

const Stack = createNativeStackNavigator()

export default function StackRoute() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

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
    </Stack.Navigator>
  )
}