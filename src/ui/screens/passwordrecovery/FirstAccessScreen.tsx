import { useState } from 'react';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp'; 
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import { apiClient } from '../../../api/config/apiClient';

import styles from './style.module.css';

export default function FirstAccessScreen() {
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  // Tipagem corrigida para bater com o Dispatch do React esperado pelo InputComp
  const handleCpfChange: React.Dispatch<React.SetStateAction<string>> = (valueOrFn) => {
    const text = typeof valueOrFn === 'function' ? (valueOrFn as Function)(cpf) : valueOrFn;
    const raw = text.replace(/\D/g, "");
    let formatted = raw;

    if (raw.length > 3) formatted = `${raw.substring(0, 3)}.${raw.substring(3)}`;
    if (raw.length > 6) formatted = `${formatted.substring(0, 7)}.${raw.substring(6)}`;
    if (raw.length > 9) formatted = `${formatted.substring(0, 11)}-${raw.substring(9, 11)}`;

    setCpf(formatted);
  };

  // Tipagem corrigida para bater com o Dispatch do React esperado pelo InputComp
  const handleBirthDateChange: React.Dispatch<React.SetStateAction<string>> = (valueOrFn) => {
    const text = typeof valueOrFn === 'function' ? (valueOrFn as Function)(birthDate) : valueOrFn;
    const raw = text.replace(/\D/g, "");
    let formatted = raw;

    if (raw.length > 2) formatted = `${raw.substring(0, 2)}/${raw.substring(2)}`;
    if (raw.length > 4) formatted = `${formatted.substring(0, 5)}/${raw.substring(4, 8)}`;

    setBirthDate(formatted);
  };

  const handleFirstAccessSubmit = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    const cleanBirthDate = birthDate.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
      setMessage("Por favor, insira um CPF válido com 11 dígitos.");
      setModalErrorVisible(true);
      return;
    }

    if (cleanBirthDate.length !== 8) {
      setMessage("Por favor, insira sua data de nascimento completa (DD/MM/AAAA).");
      setModalErrorVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem. Digite novamente.");
      setModalErrorVisible(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Sua nova senha deve ter pelo menos 6 caracteres.");
      setModalErrorVisible(true);
      return;
    }

    setOnLoading(true);
    try {
      console.log(cleanBirthDate)
      const response = await apiClient('/autenticacao/first-access-setup', {
        method: 'POST',
        body: { 
          cpf: cleanCpf,
          birthDate: cleanBirthDate, 
          newPassword: newPassword 
        },
        authenticated: true
      });

      if (response.ok) {
        alert("Dados registrados com sucesso! Bem-vindo(a).");
        // localStorage.setItem("mustChangePassword", "true");
        localStorage.removeItem("mustChangePassword")
        window.location.href = "/MainMenu";
      } else {
        const data = await response.json();
        setMessage(data.message || "Erro ao atualizar seus dados de primeiro acesso.");
        setModalErrorVisible(true);
      }
    } catch (error) {
      setMessage("Erro de conexão com o servidor.");
      setModalErrorVisible(true);
    }
    setOnLoading(false);
  };

  return (
    <div className={styles.container}>
      <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
      
      <div className={styles.subcontainer}>
        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={[]}
          onClose={() => setModalErrorVisible(false)}
        />

        <div className={styles.stepContainer}>
          <TitleComp text="Primeiro Acesso" size={20} />
          <SpacerComp />
          
          <p className={styles.infoText}>
            Insira suas informações abaixo para concluir a ativação do seu perfil e a emissão da carteirinha digital.
          </p>
          
          <SpacerComp vertical={20} />
          
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: 15 }}>
            <InputComp 
              label="Confirme seu CPF" 
              placeholder="Ex: 000.000.000-00" 
              value={cpf} 
              onChangeText={handleCpfChange} 
            />
            
            <InputComp 
              label="Data de Nascimento" 
              placeholder="Ex: DD/MM/AAAA" 
              value={birthDate} 
              onChangeText={handleBirthDateChange} 
            />
            
            <InputPasswordComp 
              label="Crie sua nova senha" 
              placeholder="Mínimo de 6 caracteres" 
              value={newPassword} 
              onChangeText={setNewPassword} 
            />
            
            <InputPasswordComp 
              label="Repita a nova senha" 
              placeholder="Confirme a senha" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
            />
          </div>
          
          <SpacerComp vertical={35} />
          
          <button className={styles.button} onClick={handleFirstAccessSubmit} disabled={onLoading}>
            {onLoading ? "Salvando..." : "Concluir Cadastro e Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}


// import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';

// import { TitleComp } from '../../components/title/TitleComp';
// import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
// import { SpacerComp } from '../../components/spacer/SpacerComp';
// import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';

// import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
// import { apiClient } from '../../../api/config/apiClient';

// import styles from './style.module.css';

// export default function FirstAccessScreen() {
//   // const navigate = useNavigate();

//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [message, setMessage] = useState("");
//   const [modalErrorVisible, setModalErrorVisible] = useState(false);
//   const [onLoading, setOnLoading] = useState(false);

//   const handleCreatePassword = async () => {
//     if (newPassword !== confirmPassword) {
//       setMessage("As senhas não coincidem. Digite novamente.");
//       setModalErrorVisible(true);
//       return;
//     }

//     if (newPassword.length < 6) {
//       setMessage("Sua nova senha deve ter pelo menos 6 caracteres.");
//       setModalErrorVisible(true);
//       return;
//     }

//     setOnLoading(true);
//     try {
//       const response = await apiClient('/autenticacao/reset-password', {
//         method: 'POST',
//         body: { newPassword: newPassword },
//         authenticated: true 
//       });

//       if (response.ok) {
//         alert("Senha criada com sucesso! Bem-vindo(a).");
//         // navigate('/MainMenu'); 
//         localStorage.setItem("mustChangePassword", "true");
//         window.location.href = "/MainMenu"
//       } else {
//         const data = await response.json();
//         setMessage(data.message || "Erro ao atualizar a senha.");
//         setModalErrorVisible(true);
//       }
//     } catch (error) {
//       setMessage("Erro de conexão com o servidor.");
//       setModalErrorVisible(true);
//     }
//     setOnLoading(false);
//   };

//   return (
//     <div className={styles.container}>
//       <img src={logoFatec} className={styles.logo} alt="Logo Fatec" />
      
//       <div className={styles.subcontainer}>
//         <ErrorModalComp
//           visible={modalErrorVisible}
//           error={message}
//           fields={[]}
//           onClose={() => setModalErrorVisible(false)}
//         />

//         <div className={styles.stepContainer}>
//           <TitleComp text="Primeiro Acesso" size={20} />
//           <SpacerComp />
          
//           <p className={styles.infoText}>
//             Bem-vindo! Para garantir a segurança da sua conta, crie uma senha definitiva antes de prosseguir.
//           </p>
          
//           <SpacerComp vertical={20} />
          
//           <InputPasswordComp 
//             label="Crie sua nova senha" 
//             placeholder="Mínimo de 6 caracteres" 
//             value={newPassword} 
//             onChangeText={setNewPassword} 
//           />
//           <SpacerComp vertical={10} />
//           <InputPasswordComp 
//             label="Repita a nova senha" 
//             placeholder="Confirme a senha" 
//             value={confirmPassword} 
//             onChangeText={setConfirmPassword} 
//           />
//           <SpacerComp vertical={40} />
          
//           <button className={styles.button} onClick={handleCreatePassword} disabled={onLoading}>
//             {onLoading ? "Salvando..." : "Salvar Senha e Entrar"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }