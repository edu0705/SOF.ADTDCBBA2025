/* eslint-disable */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Trophy, Target, Shield, 
  LogOut, Menu, X, ChevronRight, Bell, Search 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/competencias', icon: Trophy, label: 'Competencias' },
    { path: '/admin/inscripciones', icon: Users, label: 'Inscripciones' },
    { path: '/admin/poligonos', icon: Target, label: 'Polígonos' },
    { path: '/admin/jueces', icon: Shield, label: 'Staff & Jueces' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <motion.aside 
        initial={{ width: 260 }}
        animate={{ width: isOpen ? 260 : 80 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        className="bg-slate-900 text-white flex flex-col shadow-2xl z-50 relative h-full"
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div whileHover={{ rotate: 10 }} className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Target className="text-white" size={24} />
            </motion.div>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-xl tracking-tight whitespace-nowrap"
                >
                  ADT<span className="text-blue-400">System</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="absolute -right-3 top-24 bg-blue-600 p-1.5 rounded-full text-white shadow-lg hover:bg-blue-500 transition-all border-2 border-slate-50 z-50 cursor-pointer">
          {isOpen ? <X size={14} /> : <Menu size={14} />}
        </button>

        <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className="block">
                <div className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-blue-200'}`}>
                  <item.icon size={22} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {isOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                  {!isOpen && isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 border-2 border-slate-700 shadow-sm">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {isOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.first_name || 'Administrador'}</p>
                <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-0.5 transition-colors">
                  <LogOut size={12} /> Cerrar Sesión
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        <header className="h-16 px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-10">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="hover:text-blue-600 transition-colors cursor-pointer">Admin</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-slate-800 capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-sm text-slate-600 placeholder-slate-400 focus:ring-0 w-32 focus:w-48 transition-all duration-300 outline-none" />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3, ease: "easeOut" }} className="max-w-7xl mx-auto">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;