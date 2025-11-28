import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Importamos React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Creamos el Cliente (El cerebro que maneja la caché)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recargas molestas al cambiar de pestaña
      retry: 1, // Si falla, reintenta 1 vez antes de mostrar error
      staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 minutos
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 3. Envolvemos la App con el Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();