// import { useState } from 'react'

import AppRoutes from './routes';
import { InstallPWAButton } from './components/installpwa/InstallPWAButton';
// import './App.css'
import { registerSW } from 'virtual:pwa-register';
import { useEffect } from 'react';
registerSW({ immediate: true });


function App() {
  useEffect(() => {
    // const savedPrimary = localStorage.getItem('theme-primary');
    // const savedSecondary = localStorage.getItem('theme-secondary');
    const savedFilter = localStorage.getItem('@Carteirinha:accessibility') || 'normal';
    const savedTheme = localStorage.getItem('@Carteirinha:theme') || 'light';
    if (savedFilter && savedTheme) {
      document.documentElement.style.setProperty('--primary-color', savedFilter);
      document.documentElement.style.setProperty('--secondary-color', savedTheme);
    }
  }, []);
  return (
    <>
    <AppRoutes />
    <InstallPWAButton/>
    </>

  );
}

export default App
