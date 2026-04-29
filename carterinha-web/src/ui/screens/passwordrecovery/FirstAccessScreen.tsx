import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TitleComp } from '../../components/title/TitleComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';

import logoFatec from "../../../assets/images/fatec_itaquera_logo.png";
import { apiClient } from '../../../api/config/apiClient';

import styles from './style.module.css';

export default function FirstAccessScreen() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  const handleCreatePassword = async () => {
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
      // Bate no endpoint @Post('reset-password') do seu NestJS que exige Autenticação
      const response = await apiClient('/autenticacao/reset-password', {
        method: 'POST',
        body: { newPassword: newPassword },
        authenticated: true // Manda o token que já está no localStorage
      });

      if (response.ok) {
        alert("Senha criada com sucesso! Bem-vindo(a).");
        navigate('/MainMenu'); 
      } else {
        const data = await response.json();
        setMessage(data.message || "Erro ao atualizar a senha.");
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
            Bem-vindo! Para garantir a segurança da sua conta, crie uma senha definitiva antes de prosseguir.
          </p>
          
          <SpacerComp vertical={20} />
          
          <InputPasswordComp 
            label="Crie sua nova senha" 
            placeholder="Mínimo de 6 caracteres" 
            value={newPassword} 
            onChangeText={setNewPassword} 
          />
          <SpacerComp vertical={10} />
          <InputPasswordComp 
            label="Repita a nova senha" 
            placeholder="Confirme a senha" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
          />
          <SpacerComp vertical={40} />
          
          <button className={styles.button} onClick={handleCreatePassword} disabled={onLoading}>
            {onLoading ? "Salvando..." : "Salvar Senha e Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}