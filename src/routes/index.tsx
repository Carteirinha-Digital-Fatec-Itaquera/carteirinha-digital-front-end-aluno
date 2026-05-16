import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "../ui/screens/login/LoginScreen";
import MainMenuScreen from "../ui/screens/mainmenu/MainMenuScreen";
import PasswordRecoveryScreen from "../ui/screens/passwordrecovery/PasswordRecoveryScreen";
import FirstAccessScreen from "../ui/screens/passwordrecovery/FirstAccessScreen";
// import DigitalStudentCardScreen from "../ui/screens/digitalstudent/DigitalStudentCardScreen";

import DigitalStudentQrCode from "../ui/screens/digitalStudentScan/DigitalStudentQrCode";

import DigitalStudentCardScreen from "../ui/screens/digitalstudent/DigitalStudentCardScreen";
import UploadImageScreen from "../ui/screens/uploadimage/UploadImageScreen";
import ResetPasswordScreen from "../ui/screens/passwordrecovery/ResetPasswordScreen";
import HelpScreen from "../ui/screens/help/HelpScreen";
import TelaQrcode from "../ui/screens/validacao/TelaQrcode";
import ConfigScreen from "../ui/screens/config/ConfigScreen";



const Home = () => <div style={{ padding: 20 }}>Tela Home</div>;
const SignUp = () => <div style={{ padding: 20 }}>Tela SignUp</div>;
// const PasswordRecovery = () => <div style={{ padding: 20 }}>Tela PasswordRecovery</div>;
// const MainMenu = () => <div style={{ padding: 20 }}>Tela MainMenu</div>;
// const DigitalStudentCard = () => <div style={{ padding: 20 }}>Tela Carteirinha Digital</div>;
// const UploadImage = () => <div style={{ padding: 20 }}>Tela Upload Image</div>;

const checkAuth = () => {
  const token = !!localStorage.getItem('token');
  const profile = !!localStorage.getItem('@Carteirinha:profile');
  return token || profile;
};


export default function AppRoutes() {
  // const isAuthenticated = !!localStorage.getItem('token');
  // const hasCachedProfile = !!localStorage.getItem('@Carteirinha:profile');

  return (
    
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" />} /> */}
        <Route 
          path="/" 
          element={
            checkAuth()
              ? <Navigate to="/MainMenu" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        {/* <Route path="/login" element={<LoginScreen />} /> */}
        <Route 
          path="/login" 
          element={
            checkAuth()
              ? <Navigate to="/MainMenu" replace /> 
              : <LoginScreen />
          } 
        />


        
        <Route path="/home" element={<Home />} />
        <Route path="/config" element={<ConfigScreen />} />
        
        <Route path="/Help" element={<HelpScreen />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/PasswordRecovery" element={<PasswordRecoveryScreen />} />
        <Route path="/first-access" element={<FirstAccessScreen />} />
        
        {/* <Route path="/TelaQrcode" element={<TelaQrcode />} /> */}

        <Route path="/valida/:qrcodeToken" element={<TelaQrcode />} />

        <Route 
          path="/MainMenu" 
          element={
            checkAuth() ? <MainMenuScreen /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/DigitalStudentCard" element={<DigitalStudentCardScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        <Route path="/UploadImage" element={<UploadImageScreen />} />

        <Route path="/qrCodeScan" element={<DigitalStudentQrCode />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}