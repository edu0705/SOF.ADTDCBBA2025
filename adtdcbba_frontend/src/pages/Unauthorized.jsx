/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
        
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Restringido</h1>
        <p className="text-slate-500 mb-8">
          No tienes los permisos necesarios para ver esta sección. Si crees que es un error, contacta al administrador.
        </p>

        <div className="space-y-3">
          <Link to="/login" className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Cambiar de Cuenta
          </Link>
          <Link to="/dashboard" className="block w-full py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">
            Volver al Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;