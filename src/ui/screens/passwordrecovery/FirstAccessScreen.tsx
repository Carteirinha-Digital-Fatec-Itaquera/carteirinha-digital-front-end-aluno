import AuthLayout from '../../components/page/AuthLayout';
import { useState } from 'react';
import { TitleComp } from '../../components/title/TitleComp';
import { InputComp } from '../../components/input/InputComp'; 
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';
import MessageModal from '../../components/MessageModal/MessageModal';

import { apiClient } from '../../../api/config/apiClient';

import styles from './style.module.css';

export default function FirstAccessScreen() {
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  const handleCpfChange: React.Dispatch<React.SetStateAction<string>> = (valueOrFn) => {
    const text = typeof valueOrFn === 'function' ? valueOrFn(cpf) : valueOrFn;
    const raw = text.replace(/\D/g, "");
    let formatted = raw;

    if (raw.length > 3) formatted = `${raw.substring(0, 3)}.${raw.substring(3)}`;
    if (raw.length > 6) formatted = `${formatted.substring(0, 7)}.${raw.substring(6)}`;
    if (raw.length > 9) formatted = `${formatted.substring(0, 11)}-${raw.substring(9, 11)}`;

    setCpf(formatted);
  };

  const handleBirthDateChange: React.Dispatch<React.SetStateAction<string>> = (valueOrFn) => {
    const text = typeof valueOrFn === 'function' ? valueOrFn(birthDate) : valueOrFn;
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
        // localStorage.setItem("mustChangePassword", "true");
        localStorage.removeItem("mustChangePassword");
        setSuccessVisible(true);
      } else {
        const data = await response.json();
        setMessage(data.message || "Erro ao atualizar seus dados de primeiro acesso.");
        setModalErrorVisible(true);
      }
    } catch {
      setMessage("Erro de conexão com o servidor.");
      setModalErrorVisible(true);
    }
    setOnLoading(false);
  };

  return (
    <AuthLayout title="Primeiro acesso" subtitle="Complete seus dados e crie uma senha para começar.">
      
      <div className={styles.subcontainer}>
        <ErrorModalComp
          visible={modalErrorVisible}
          error={message}
          fields={[]}
          onClose={() => setModalErrorVisible(false)}
        />

        <MessageModal
          visible={successVisible}
          tone="success"
          title="Cadastro concluído"
          message="Seus dados foram registrados com sucesso. Bem-vindo(a) à Carteirinha Digital."
          confirmText="Continuar"
          onConfirm={() => {
            setSuccessVisible(false);
            const returnUrl = sessionStorage.getItem("returnUrl");
            if (returnUrl && returnUrl.startsWith("/p/")) {
              sessionStorage.removeItem("returnUrl");
              window.location.href = returnUrl;
            } else {
              window.location.href = "/MainMenu";
            }
          }}
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
    </AuthLayout>
  );
}


