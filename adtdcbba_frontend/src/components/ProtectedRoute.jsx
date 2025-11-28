import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isLoggedIn, user, userRoles, loading } = useAuth();
    const location = useLocation();

    // 1. Pantalla de carga mientras verifica
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            </div>
        );
    }

    // 2. Si no está logueado -> Login
    if (!isLoggedIn || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. VERIFICACIÓN DE PERMISOS
    // Si es Superusuario, lo dejamos pasar SIEMPRE.
    if (user.is_superuser) {
        return children;
    }

    // Si requiere un rol específico, verificamos
    if (requiredRole) {
        const hasRole = userRoles.some(role => 
            role.toLowerCase() === requiredRole.toLowerCase() || 
            (requiredRole === 'admin' && role.toLowerCase() === 'administrador')
        );

        if (!hasRole) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;