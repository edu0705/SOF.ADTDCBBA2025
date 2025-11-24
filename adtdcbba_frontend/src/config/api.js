// src/config/api.js
import axios from 'axios';

// 1. Definimos la URL base.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 2. Creamos una instancia de Axios centralizada
const api = axios.create({
    baseURL: API_BASE_URL,
    // ¡CRÍTICO! Esto permite que el navegador envíe y reciba cookies (HttpOnly)
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// (Opcional) URL de WebSockets
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export { api, API_BASE_URL, WS_BASE_URL };
export default api;