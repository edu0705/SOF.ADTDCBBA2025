/* eslint-disable */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Shield, BadgeCheck, Mail, Phone, Trash2, X, Save } from 'lucide-react';
import api from '../config/api';

const ManageJueces = () => {
  const { data: jueces = [], isLoading, refetch } = useQuery({
    queryKey: ['jueces'],
    queryFn: async () => (await api.get('/competencias/jueces/')).data
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', license_number: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/competencias/jueces/', formData);
      setShowModal(false);
      setFormData({ full_name: '', license_number: '' });
      refetch();
    } catch { alert('Error al registrar juez'); }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar juez?')) {
      try { await api.delete(`/competencias/jueces/${id}/`); refetch(); } catch { alert('No se puede eliminar'); }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cuerpo de Jueces</h1>
          <p className="text-slate-500 mt-1">Autoridades oficiales de competencia.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all active:scale-95">
          <UserPlus size={20} /> Registrar Juez
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? <p className="col-span-4 text-center text-slate-400 py-10">Cargando...</p> : jueces.map((juez, i) => (
          <motion.div key={juez.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-20 bg-slate-900/5 z-0" />
            <div className="relative z-10 -mt-2">
              <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg mb-3">
                <Shield size={32} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{juez.full_name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Juez Oficial</p>
              
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm">
                <p className="text-slate-400 text-xs uppercase font-bold mb-1">Licencia</p>
                <p className="font-mono font-medium text-slate-700">{juez.license_number || 'N/A'}</p>
              </div>
              
              <button onClick={() => handleDelete(juez.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Nuevo Juez</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500/20 outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Número de Licencia</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500/20 outline-none" value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} required />
                </div>
                <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex justify-center gap-2"><Save size={20} /> Registrar</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageJueces;