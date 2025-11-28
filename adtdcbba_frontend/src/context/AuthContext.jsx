import React, { 
    createContext, 
    useState, 
    useEffect, 
    useContext, 
    useMemo, 
    useCallback 
} from 'react';
import authService from '../services/authService';
import api from '../config/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRoles, setUserRoles] = useState([]); 
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);

    /**
     * checkAuth: Función central de seguridad.
     * 1. Obtiene el token CSRF (Cookie) del backend.
     * 2. Verifica si la sesión de usuario es válida.
     */
    const checkAuth = useCallback(async () => {
        try {
            // PASO 1: Obtener Cookie CSRF (Vital para seguridad contra ataques)
            await api.get('/auth/csrf/');

            // PASO 2: Intentar obtener el usuario actual
            const userData = await authService.getCurrentUser();
            
            // Si llegamos aquí, el usuario está autenticado
            setIsLoggedIn(true);
            setUser(userData);
            setUserRoles(userData.groups || []); 
        } catch { 
            // CORRECCIÓN: Eliminamos "(error)" porque no lo usamos.
            // Si falla (401 Unauthorized o Error de Red), simplemente asumimos usuario anónimo.
            setIsLoggedIn(false);
            setUser(null);
            setUserRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Ejecutar checkAuth al cargar la aplicación
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (username, password) => {
        await authService.login(username, password);
        await checkAuth(); // Actualizamos el estado global después del login
        return true;
    }, [checkAuth]);

    const logout = useCallback(async () => {
        try {
            await authService.logout(); 
        } catch (error) {
            // Aquí SI usamos la variable error para loguear, así que se deja.
            console.error("Error al cerrar sesión en servidor", error);
        } finally {
            // Limpiamos el estado local SIEMPRE, incluso si falla el backend
            setIsLoggedIn(false);
            setUser(null);
            setUserRoles([]);
        }
    }, []);

    const hasRole = useCallback(
        (role) => userRoles.includes(role),
        [userRoles] 
    );

    // Memorizamos el valor del contexto para evitar re-renders innecesarios
    const value = useMemo(
        () => ({
            isLoggedIn,
            user,
            userRoles,
            loading,
            login,
            logout,
            hasRole
        }), 
        [isLoggedIn, user, userRoles, loading, login, logout, hasRole]
    );

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);