import axios from 'axios';

// 1. URL Base para la API REST
// CAMBIO CLAVE: Usamos '/api' como default. 
// Esto hace que la petición vaya al mismo dominio/puerto que la web (http://localhost/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 2. URL Base para WebSockets
// En local usa ws://localhost/ws, en prod usa wss://midominio/ws
const WS_BASE_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

// 3. Instancia de Axios Segura
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Permite cookies (Session y CSRF)
    headers: {
        'Content-Type': 'application/json',
    },
    xsrfCookieName: 'csrftoken', 
    xsrfHeaderName: 'X-CSRFToken',
});

// 4. Interceptor de Respuesta (Manejo de Errores Global)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Intentamos refrescar el token
                await axios.post(`${API_BASE_URL}/auth/refresh/`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export { api, API_BASE_URL, WS_BASE_URL };
export default api;