import PageLayout from '../../components/page/PageLayout';
import Modal from '../../components/modal/Modal';
import MessageModal, { type MessageTone } from '../../components/MessageModal/MessageModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldCheck, Check,Settings} from 'lucide-react';
import { apiClient } from '../../../api/config/apiClient';
import styles from './style.module.css';

type FeedbackMessage = {
  tone: MessageTone;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
};

export default function ConfigScreen() {
  const navigate = useNavigate();

  const [modalDaltonismo, setModalDaltonismo] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const [currentFilter, setCurrentFilter] = useState(localStorage.getItem('@Carteirinha:accessibility') || 'normal');
  //const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('@Carteirinha:theme') === 'dark');

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onLoading, setOnLoading] = useState(false);

  // Tipos baseados nos graus clínicos reais de daltonismo
  const daltonismoTypes = [
    { id: 'normal', name: 'Visão Padrão', desc: 'Sem alterações de filtros' },
    { id: 'deuteranomaly', name: 'Deuteranomalia (Parcial)', desc: 'Verde fraco ou atenuado (Incidência mais comum)' },
    { id: 'deuteranopia', name: 'Deuteranopia (Total)', desc: 'Ausência de fotorreceptores verdes' },
    { id: 'protanomaly', name: 'Protanomalia (Parcial)', desc: 'Vermelho fraco ou atenuado' },
    { id: 'protanopia', name: 'Protanopia (Total)', desc: 'Ausência de fotorreceptores vermelhos' },
    { id: 'tritanopia', name: 'Tritanopia', desc: 'Dificuldade com azul e amarelo (Raro)' },
  ];
/*
  const toggleTheme = () => {
    const nextTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('@Carteirinha:theme', nextTheme);
  };*/

  const applyAccessibilityFilter = (filterId: string) => {
    setCurrentFilter(filterId);
    document.documentElement.setAttribute('data-accessibility', filterId);
    localStorage.setItem('@Carteirinha:accessibility', filterId);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({
        tone: 'warning',
        title: 'As senhas não coincidem',
        message: 'Digite a mesma senha nos dois campos para continuar.',
      });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({
        tone: 'warning',
        title: 'Senha muito curta',
        message: 'A senha deve ter no mínimo 6 caracteres.',
      });
      return;
    }

    setOnLoading(true);
    try {
      const response = await apiClient('/autenticacao/reset-password', {
        method: 'POST',
        body: { newPassword }, 
        authenticated: true
      });

      if (response.ok) {
        setModalSenha(false);
        setNewPassword("");
        setConfirmPassword("");
        setFeedback({
          tone: 'success',
          title: 'Senha alterada com sucesso',
          message: 'Sua nova senha já está ativa e será utilizada nos próximos acessos.',
        });
      } else {
        if (response.status === 401) {
          setModalSenha(false);
          setFeedback({
            tone: 'warning',
            title: 'Sessão expirada',
            message: 'Sua sessão expirou. Faça login novamente para continuar.',
            confirmText: 'Ir para o login',
            onConfirm: () => {
              localStorage.clear();
              navigate('/login');
            },
          });
        } else {
          setFeedback({
            tone: 'error',
            title: 'Não foi possível alterar a senha',
            message: 'O servidor não conseguiu concluir a alteração. Tente novamente.',
          });
        }
      }
    } catch {
      setFeedback({
        tone: 'error',
        title: 'Falha de conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      });
    } finally {
      setOnLoading(false);
    }
  };

  return (
    <PageLayout title="Configurações" subtitle="Personalize sua experiência e gerencie suas preferências de acesso." backTo="/MainMenu" icon={<Settings size={22} />}>


      <div className={styles.main}>
        
        {/* Futura feature para aplicação do modo noturno */}
        {/* <button type="button" className={styles.menuRow} onClick={toggleTheme}>
          <div className={styles.menuRowLeft}>
            <Moon className={styles.iconRed} />
            <div>
              <h3>Modo Noturno</h3>
              <p>Alterar tema claro/escuro</p>
            </div>
          </div>
          <div className={`${styles.toggleSwitch} ${isDarkMode ? styles.toggleActive : ''}`}>
            <div className={styles.toggleThumb} />
          </div>
        </div> */}

        <button type="button" className={styles.menuRow} onClick={() => setModalDaltonismo(true)}>
          <div className={styles.menuRowLeft}>
            <Eye className={styles.iconRed} />
            <div>
              <h3>Acessibilidade Visual</h3>
              <p>Ajustar cores para daltonismo</p>
            </div>
          </div>
        </button>

        <button type="button" className={styles.menuRow} onClick={() => setModalSenha(true)}>
          <div className={styles.menuRowLeft}>
            <ShieldCheck className={styles.iconRed} />
            <div>
              <h3>Alterar Senha de Acesso</h3>
              <p>Modificar as credenciais de entrada</p>
            </div>
          </div>
        </button>
      </div>

      {/* MODAL: DALTONISMO */}
      {modalDaltonismo && (
        <Modal label="Acessibilidade visual" onClose={() => setModalDaltonismo(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Selecione o Grau de Daltonismo</h3>
            <div className={styles.optionsList}>
              {daltonismoTypes.map((type) => (
                <button 
                  key={type.id} 
                  className={`${styles.optionButton} ${currentFilter === type.id ? styles.activeOption : ''}`}
                  onClick={() => applyAccessibilityFilter(type.id)}
                >
                  <div style={{ textAlign: 'left' }}>
                    <strong>{type.name}</strong>
                    <p className={styles.optionDesc}>{type.desc}</p>
                  </div>
                  {currentFilter === type.id && <Check size={18} color="var(--primary-fatec)" />}
                </button>
              ))}
            </div>
            <button className={styles.closeButton} onClick={() => setModalDaltonismo(false)}>Concluir</button>
          </div>
        </Modal>
      )}

      {/* MODAL: ALTERAR SENHA */}
      {modalSenha && (
        <Modal label="Alterar senha" onClose={() => setModalSenha(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Criar Nova Senha</h3>
            <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="config-new-password">Nova Senha</label>
                <input id="config-new-password"
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="config-confirm-password">Confirme a Nova Senha</label>
                <input id="config-confirm-password"
                  type="password" 
                  placeholder="Digite novamente" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setModalSenha(false)}>Cancelar</button>
                <button type="submit" className={styles.submitButton} disabled={onLoading}>
                  {onLoading ? "A guardar..." : "Guardar Senha"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {feedback && (
        <MessageModal
          visible
          tone={feedback.tone}
          title={feedback.title}
          message={feedback.message}
          confirmText={feedback.confirmText ?? 'OK'}
          onConfirm={() => {
            const action = feedback.onConfirm;
            setFeedback(null);
            action?.();
          }}
        />
      )}
    </PageLayout>
  );
}
