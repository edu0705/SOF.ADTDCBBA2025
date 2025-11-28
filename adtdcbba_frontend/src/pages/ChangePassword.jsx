/* eslint-disable */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../config/api';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    
    try {
      await api.post('/users/change-password/', passwords);
      setStatus({ type: 'success', msg: 'Contraseña actualizada correctamente.' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch {
      setStatus({ type: 'error', msg: 'La contraseña actual es incorrecta.' });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Seguridad</h1>
            <p className="text-slate-500 text-sm">Actualiza tu clave de acceso.</p>
          </div>
        </div>

        {status.msg && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {status.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            <span className="text-sm font-medium">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña Actual</label>
            <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" 
              value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nueva Contraseña</label>
              <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" 
                value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar</label>
              <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" 
                value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex justify-center gap-2 mt-4">
            <Save size={20} /> Actualizar Contraseña
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;