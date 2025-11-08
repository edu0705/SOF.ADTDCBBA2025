import React from 'react';
import { createRoot } from 'react-dom/client'; // Importación moderna de createRoot
import './index.css'; // Asumo que tienes el archivo CSS básico
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Busca el elemento DOM con el ID 'root'
const container = document.getElementById('root'); 

// Crea la raíz de React
if (container) {
  const root = createRoot(container);
  
  // Renderiza la aplicación
root.render(
  <React.StrictMode>
    {/* ENVOLVEMOS LA APP CON EL PROVEEDOR DE AUTENTICACIÓN */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
);
}