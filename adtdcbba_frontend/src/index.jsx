import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 1. Estilos Globales
import 'bootstrap/dist/css/bootstrap.min.css';

import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';

// 2. Importamos React Query (El estándar 2025 para datos)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 3. Creamos el cliente
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();