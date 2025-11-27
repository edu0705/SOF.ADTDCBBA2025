// src/services/authService.jsx
import api from '../config/api';

const authService = {
    // Login: Envía usuario y contraseña.
    // ACTUALIZADO: Apunta a /users/token/ para coincidir con el backend
    login: async (username, password) => {
        const response = await api.post('/users/token/', { username, password });
        return response.data;
    },

    // Logout: Llama al endpoint para que el servidor elimine las cookies.
    // ACTUALIZADO: Apunta a /users/token/logout/
    logout: async () => {
        try {
            await api.post('/users/token/logout/');
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        }
    },

    // GET CURRENT USER: Verifica si la cookie de sesión es válida.
    // Este ya estaba correcto (/users/user-info/)
    getCurrentUser: async () => {
        const response = await api.get('/users/user-info/');
        return response.data;
    },
    
    api
};

// --- INTERCEPTOR DE RESPUESTA ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/users/token/refresh/')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // ACTUALIZADO: Ruta de refresh correcta
                await api.post('/users/token/refresh/', {});
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default authService;