// import { useState } from 'react'

import AppRoutes from './routes';
import { InstallPWAButton } from './components/installpwa/InstallPWAButton';
// import './App.css'
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });
function App() {

  return (
    <>
    <AppRoutes />
    <InstallPWAButton/>
    </>

  );
}

export default App
