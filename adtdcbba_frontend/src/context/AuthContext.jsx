// src/context/AuthContext.jsx
import React, { 
    createContext, 
    useState, 
    useEffect, 
    useContext, 
    useMemo, 
    useCallback 
} from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRoles, setUserRoles] = useState([]); 
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);

    // checkAuth memorizado
    const checkAuth = useCallback(async () => {
        try {
            const userData = await authService.getCurrentUser();
            setIsLoggedIn(true);
            setUser(userData);
            setUserRoles(userData.groups || []); 
        } catch {
            // CORRECCIÓN 1: Eliminamos la variable (error) no usada
            setIsLoggedIn(false);
            setUser(null);
            setUserRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // CORRECCIÓN 2: Envolver login en useCallback
    const login = useCallback(async (username, password) => {
        await authService.login(username, password);
        await checkAuth();
        return true;
    }, [checkAuth]);

    // CORRECCIÓN 2: Envolver logout en useCallback
    const logout = useCallback(async () => {
        await authService.logout(); 
        setIsLoggedIn(false);
        setUser(null);
        setUserRoles([]);
    }, []);

    const hasRole = useCallback(
        (role) => userRoles.includes(role),
        [userRoles] 
    );

    // CORRECCIÓN 3: Agregar login y logout a las dependencias
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

// CORRECCIÓN 4: Desactivar regla de fast-refresh solo para este export
// Esto es estándar para archivos de Contexto en Vite.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);