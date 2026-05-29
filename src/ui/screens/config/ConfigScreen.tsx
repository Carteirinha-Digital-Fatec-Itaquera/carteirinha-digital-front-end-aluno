import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, ShieldCheck, Moon, Check } from 'lucide-react';
import { apiClient } from '../../../api/config/apiClient';
import styles from './style.module.css';

export default function ConfigScreen() {
  const navigate = useNavigate();

  // Estados dos Modais
  const [modalDaltonismo, setModalDaltonismo] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);

  // Estados de Preferência (buscam o que já está salvo no navegador)
  const [currentFilter, setCurrentFilter] = useState(localStorage.getItem('@Carteirinha:accessibility') || 'normal');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('@Carteirinha:theme') === 'dark');

  // Estados do Formulário de Senha
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

  const toggleTheme = () => {
    const nextTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('@Carteirinha:theme', nextTheme);
  };

  const applyAccessibilityFilter = (filterId: string) => {
    setCurrentFilter(filterId);
    document.documentElement.setAttribute('data-accessibility', filterId);
    localStorage.setItem('@Carteirinha:accessibility', filterId);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setOnLoading(true);
    try {
      // O apiClient envia automaticamente o token via "authenticated: true"
      const response = await apiClient('/autenticacao/reset-password', {
        method: 'POST',
        body: { newPassword }, 
        authenticated: true
      });

      if (response.ok) {
        alert("Senha atualizada com sucesso!");
        setModalSenha(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        if (response.status === 401) {
          alert("A tua sessão expirou. Por favor, faz login novamente.");
          localStorage.clear();
          navigate('/login');
        } else {
          alert("Erro ao atualizar a senha. Tenta novamente.");
        }
      }
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    } finally {
      setOnLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft color="white" size={24} />
        </button>
        <h1 className={styles.title}>Configurações</h1>
      </header>

      <main className={styles.main}>
        
        {/* Futura feature para aplicação do modo noturno */}
        {/* <div className={styles.menuRow} onClick={toggleTheme}>
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

        <div className={styles.menuRow} onClick={() => setModalDaltonismo(true)}>
          <div className={styles.menuRowLeft}>
            <Eye className={styles.iconRed} />
            <div>
              <h3>Acessibilidade Visual</h3>
              <p>Ajustar cores para daltonismo</p>
            </div>
          </div>
        </div>

        <div className={styles.menuRow} onClick={() => setModalSenha(true)}>
          <div className={styles.menuRowLeft}>
            <ShieldCheck className={styles.iconRed} />
            <div>
              <h3>Alterar Senha de Acesso</h3>
              <p>Modificar as credenciais de entrada</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: DALTONISMO */}
      {modalDaltonismo && (
        <div className={styles.modalOverlay} onClick={() => setModalDaltonismo(false)}>
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
        </div>
      )}

      {/* MODAL: ALTERAR SENHA */}
      {modalSenha && (
        <div className={styles.modalOverlay} onClick={() => setModalSenha(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Criar Nova Senha</h3>
            <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
              <div className={styles.inputGroup}>
                <label>Nova Senha</label>
                <input 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Confirme a Nova Senha</label>
                <input 
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
        </div>
      )}
    </div>
  );
}