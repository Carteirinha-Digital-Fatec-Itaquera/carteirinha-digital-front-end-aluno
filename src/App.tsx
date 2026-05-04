// import { useState } from 'react'

import AppRoutes from './routes';
import { InstallPWAButton } from './components/installpwa/InstallPWAButton';
// import './App.css'
import { registerSW } from 'virtual:pwa-register';
import { useEffect } from 'react';
registerSW({ immediate: true });


function App() {
  useEffect(() => {
    const savedPrimary = localStorage.getItem('theme-primary');
    const savedSecondary = localStorage.getItem('theme-secondary');
    
    if (savedPrimary) {
      document.documentElement.style.setProperty('--primary-color', savedPrimary);
    }
    if (savedSecondary) {
      document.documentElement.style.setProperty('--secondary-color', savedSecondary);
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
