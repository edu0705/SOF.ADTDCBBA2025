import api from '../config/api';

const authService = {
    // 1. LOGIN
    // Antes: /users/token/
    // Ahora: /auth/login/ (Definido en users/urls.py)
    login: async (username, password) => {
        const response = await api.post('/auth/login/', { username, password });
        return response.data;
    },

    // 2. LOGOUT
    // Antes: /users/token/logout/
    // Ahora: /auth/logout/
    logout: async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        }
    },

    // 3. OBTENER USUARIO ACTUAL
    // Antes: /users/user-info/
    // Ahora: /auth/me/
    getCurrentUser: async () => {
        const response = await api.get('/auth/me/');
        return response.data;
    },
    
    // (Opcional) Si necesitas acceder a la instancia de axios desde fuera
    api
};

// NOTA: El interceptor de respuesta (refresh token) se ha movido a 
// src/config/api.js para mantener el código centralizado y evitar duplicados.

export default authService;