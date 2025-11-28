/* eslint-disable */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, FileText, Camera } from 'lucide-react';

const RegisterDeportista = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { alert("Datos guardados"); setLoading(false); }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registro de Atleta</h1>
            <p className="text-slate-500 text-sm">Completa tu ficha técnica oficial.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">Cédula de Identidad</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="1234567 CBA" required />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">Fecha de Nacimiento</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">Club</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600">
              <option>Seleccionar Club...</option>
              <option>Club de Tiro Tunari</option>
              <option>Club Illimani</option>
              <option>Particular / Sin Club</option>
            </select>
          </div>

          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <Camera className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-medium text-slate-600">Subir Foto de Perfil</p>
            <p className="text-xs text-slate-400">JPG o PNG (Max 2MB)</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex justify-center gap-2 disabled:opacity-70">
            {loading ? 'Guardando...' : <><Save size={20} /> Guardar Ficha</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterDeportista;