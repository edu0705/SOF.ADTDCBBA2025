/* eslint-disable */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Fondo abstracto */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-400 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 max-w-md"
      >
        <div className="mb-8 relative inline-block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-slate-200"
          >
            <Compass size={180} strokeWidth={1} />
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-slate-800">
            404
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">Página no encontrada</h1>
        <p className="text-slate-500 text-lg mb-8">
          Parece que el blanco que buscas no existe o ha sido movido.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => window.history.back()} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Regresar
          </button>
          
          <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2">
            <Home size={18} /> Ir al Inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;