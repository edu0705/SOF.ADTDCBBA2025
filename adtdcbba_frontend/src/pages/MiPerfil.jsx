/* eslint-disable */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Edit3 } from 'lucide-react';

const MiPerfil = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition backdrop-blur-sm"><Edit3 size={18} /></button>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
              <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-bold text-slate-400">{user?.username?.charAt(0).toUpperCase()}</div>
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h1>
              <p className="text-slate-500 font-medium">@{user?.username} • Usuario Activo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-1 text-sm text-slate-500 font-medium"><Mail size={16} /> Email</div>
              <p className="text-lg font-semibold text-slate-800">{user?.email || 'No registrado'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-1 text-sm text-slate-500 font-medium"><Shield size={16} /> Rol</div>
              <p className="text-lg font-semibold text-slate-800 capitalize">{user?.is_superuser ? 'Super Administrador' : 'Usuario'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MiPerfil;