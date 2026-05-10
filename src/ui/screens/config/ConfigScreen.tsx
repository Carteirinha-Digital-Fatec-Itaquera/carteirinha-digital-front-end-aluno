import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette } from 'lucide-react';
import styles from './style.module.css';

export default function ConfigScreen() {
  const navigate = useNavigate();

  const changeColor = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    
    // Salva a preferência
    localStorage.setItem('theme-primary', primary);
    localStorage.setItem('theme-secondary', secondary);
  };

  const themes = [
    { name: 'Padrão Fatec', primary: '#BA1A1A', secondary: '#8A1414' },
    { name: 'Ocean Blue', primary: '#1A56BA', secondary: '#14428A' },
    { name: 'Forest Green', primary: '#1A7A3A', secondary: '#125A2B' },
    { name: 'Dark Mode', primary: '#2D2D2D', secondary: '#1A1A1A' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={28} />
        </button>
        <h1 className={styles.title}>Configurações</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Palette size={20} />
            <h2>Personalização de Cores</h2>
          </div>
          
          <div className={styles.themeGrid}>
            {themes.map((theme) => (
              <button 
                key={theme.name}
                className={styles.themeCard}
                onClick={() => changeColor(theme.primary, theme.secondary)}
              >
                <div 
                  className={styles.colorCircle} 
                  style={{ backgroundColor: theme.primary }} 
                />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}