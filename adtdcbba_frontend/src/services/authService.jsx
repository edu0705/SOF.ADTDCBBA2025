// src/services/authService.jsx
import api from '../config/api';

const authService = {
    // Login: Envía usuario y contraseña.
    // El servidor responde con 'Set-Cookie' (HttpOnly) que el navegador guarda automáticamente.
    login: async (username, password) => {
        const response = await api.post('/token/', { username, password });
        return response.data;
    },

    // Logout: Llama al endpoint para que el servidor elimine las cookies.
    logout: async () => {
        try {
            await api.post('/token/logout/');
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        }
        // No borramos localStorage porque ya no guardamos tokens ahí.
    },

    // GET CURRENT USER: Verifica si la cookie de sesión es válida.
    getCurrentUser: async () => {
        // Esta llamada fallará (401) si no hay cookies o son inválidas
        const response = await api.get('/users/user-info/');
        return response.data;
    },
    
    // Exponemos la instancia de api para uso externo
    api
};

// --- INTERCEPTOR DE RESPUESTA (CON PROTECCIÓN ANTI-BUCLE) ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // --- 1. BLOQUEO DE BUCLE INFINITO ---
        // Si la petición que falló YA ERA un intento de refresh, 
        // NO intentamos refrescar de nuevo. Rechazamos el error y dejamos que AuthContext cierre sesión.
        if (originalRequest.url.includes('/token/refresh/')) {
            return Promise.reject(error);
        }

        // --- 2. Lógica de Refresh Automático ---
        // Si el servidor dice "No autorizado" (401) y NO es un reintento...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Intentamos refrescar el token enviando un post vacío.
                // El backend leerá la cookie 'refresh' automáticamente.
                await api.post('/token/refresh/', {});
                
                // Si el refresh funciona (200 OK), las cookies se han actualizado.
                // Reintentamos la petición original que falló.
                return api(originalRequest);
            } catch (refreshError) {
                // Si el refresh falla (token expirado o inválido),
                // dejamos que el error se propague.
                return Promise.reject(refreshError);
            }
        }
        
        // Si es otro error o ya reintentamos, devolvemos el error.
        return Promise.reject(error);
    }
);

export default authService;