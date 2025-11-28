/* eslint-disable */
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Trophy, ArrowRight, Target, 
  LogOut, Loader2 
} from 'lucide-react';

const Dashboard = () => {
  // Obtenemos 'loading' para esperar a que el usuario cargue bien
  const { user, userRoles, logout, loading } = useAuth(); 
  const navigate = useNavigate();

  // --- Lógica de Redirección ---
  useEffect(() => {
    // Solo ejecutamos si ya terminó de cargar la sesión (loading === false)
    if (!loading && user) {
      console.log("Verificando permisos...", { roles: userRoles, is_superuser: user.is_superuser });
      
      // Verificamos si es Admin, Superusuario o Juez
      const isAdmin = 
        user.is_superuser || 
        userRoles.some(role => ['admin', 'administrador', 'juez'].includes(role.toLowerCase()));

      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [userRoles, user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 1. PANTALLA DE CARGA (Para evitar mostrar el dashboard equivocado)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD DE DEPORTISTA (Solo se muestra si NO fuiste redirigido)
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <Target size={18} />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">ADT<span className="text-blue-600">Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{user?.first_name || user?.username}</p>
            <p className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full inline-block">Deportista</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Bienvenida */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Hola, {user?.first_name || 'Atleta'} 👋</h1>
            <p className="text-blue-100 max-w-lg text-lg">Bienvenido a tu panel personal. Gestiona tus competencias y resultados.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        </motion.div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link to="/inscripcion/nueva" className="block group">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all h-full"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Inscripciones</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                Ver calendario <ArrowRight size={14} />
              </p>
            </motion.div>
          </Link>

          <Link to="/perfil" className="block group">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all h-full"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Resultados</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                Ver historial <ArrowRight size={14} />
              </p>
            </motion.div>
          </Link>

          <Link to="/perfil" className="block group">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-all h-full"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Mi Perfil</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1 group-hover:text-purple-600 transition-colors">
                Editar datos <ArrowRight size={14} />
              </p>
            </motion.div>
          </Link>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;