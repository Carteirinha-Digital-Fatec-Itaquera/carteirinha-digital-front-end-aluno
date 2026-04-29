import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "../ui/screens/login/LoginScreen";
import MainMenuScreen from "../ui/screens/mainmenu/MainMenuScreen";
import PasswordRecoveryScreen from "../ui/screens/passwordrecovery/PasswordRecoveryScreen";
import FirstAccessScreen from "../ui/screens/passwordrecovery/FirstAccessScreen";
import DigitalStudentCardScreen from "../ui/screens/digitalstudent/DigitalStudentCardScreen";
import UploadImageScreen from "../ui/screens/uploadimage/UploadImageScreen";


const Home = () => <div style={{ padding: 20 }}>Tela Home</div>;
const SignUp = () => <div style={{ padding: 20 }}>Tela SignUp</div>;
const PasswordRecovery = () => <div style={{ padding: 20 }}>Tela PasswordRecovery</div>;
const MainMenu = () => <div style={{ padding: 20 }}>Tela MainMenu</div>;
const DigitalStudentCard = () => <div style={{ padding: 20 }}>Tela Carteirinha Digital</div>;
const UploadImage = () => <div style={{ padding: 20 }}>Tela Upload Image</div>;

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/home" element={<Home />} />
        
        {/* 2. CHAMA O COMPONENTE VERDADEIRO AQUI */}
        <Route path="/login" element={<LoginScreen />} />
        
        <Route path="/signup" element={<SignUp />} />
        <Route path="/password-recovery" element={<PasswordRecoveryScreen />} />
        <Route path="/first-access" element={<FirstAccessScreen />} />
        
        <Route path="/MainMenu" element={<MainMenuScreen />} />
        <Route path="/student-card" element={<DigitalStudentCardScreen />} />
        <Route path="/upload-image" element={<UploadImage />} />
      </Routes>
    </BrowserRouter>
  );
}