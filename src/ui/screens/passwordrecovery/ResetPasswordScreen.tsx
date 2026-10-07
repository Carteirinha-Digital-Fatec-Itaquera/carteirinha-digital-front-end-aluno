import AuthLayout from '../../components/page/AuthLayout';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { TitleComp } from '../../components/title/TitleComp';
import { InputPasswordComp } from '../../components/inputpassword/InputPasswordComp';
import { SpacerComp } from '../../components/spacer/SpacerComp';
import { ErrorModalComp } from '../../components/ErrorModal/ErrorModalComp';
import MessageModal from '../../components/MessageModal/MessageModal';

import { apiClient } from '../../../api/config/apiClient';

import styles from './style.module.css';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  // Pega os parâmetros da URL mágica que você gerou no backend
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'student' | 'secretary';

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [onLoading, setOnLoading] = useState(false);

  // Trava de segurança caso abram o link errado
  if (!token || !id || !type) {
    return (
      <AuthLayout title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta institucional.">
        <div className={styles.subcontainer} style={{ textAlign: 'center', paddingTop: '50px' }}>
          <h2>Link Inválido</h2>
          <p className={styles.infoText}>Este link de recuperação está incompleto ou inválido.</p>
          <SpacerComp />
          <button className={styles.button} onClick={() => navigate('/login')}>Ir para o Login</button>
        </div>
    </AuthLayout>
  );
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem. Digite novamente.");
      setModalErrorVisible(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("A nova senha deve ter pelo menos 6 caracteres.");
      setModalErrorVisible(true);
      return;
    }

    setOnLoading(true);
    try {
      // Bate no endpoint @Post('reset') do seu NestJS
      const response = await apiClient('/autenticacao/reset', {
        method: 'POST',
        body: { token, id, type, newPass: newPassword }
      });

      if (response.ok) {
        setSuccessVisible(true);
      } else {
        const data = await response.json();
        setMessage(data.message || "Erro ao redefinir. O link pode ter expirado.");
        setModalErrorVisible(true);
      }
    } catch {
      setMessage("Erro de conexão com o servidor.");
      setModalErrorVisible(true);
    }
    setOnLoading(false);
  };

  return (
    <AuthLayout title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta institucional.">
      
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
          title="Senha redefinida com sucesso"
          message="Sua nova senha já está ativa. Agora você pode entrar novamente na sua conta."
          confirmText="Ir para o login"
          onConfirm={() => {
            setSuccessVisible(false);
            navigate('/login');
          }}
        />

        <div className={styles.stepContainer}>
          <TitleComp text="Criar Nova Senha" size={28} />
          <SpacerComp />
          <p className={styles.infoText}>Seu link foi validado. Digite sua nova senha de acesso abaixo.</p>
          <SpacerComp vertical={20} />
          
          <InputPasswordComp 
            label="Nova senha" 
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
          
          <button className={styles.button} onClick={handleResetPassword} disabled={onLoading}>
            {onLoading ? "Salvando..." : "Redefinir Senha"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}