/* eslint-disable */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, Target, Trash2, Edit3, X, Save } from 'lucide-react';
import api from '../config/api';

const ManagePoligonos = () => {
  const { data: poligonos = [], isLoading, refetch } = useQuery({
    queryKey: ['poligonos'],
    queryFn: async () => (await api.get('/competencias/poligonos/')).data
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', numero_licencia: '' });

  const filtered = poligonos.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/competencias/poligonos/', formData);
      setShowModal(false);
      setFormData({ name: '', address: '', numero_licencia: '' });
      refetch();
    } catch {
      alert('Error al guardar polígono');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar polígono?')) {
      try {
        await api.delete(`/competencias/poligonos/${id}/`);
        refetch();
      } catch {
        alert('No se puede eliminar');
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Polígonos</h1>
          <p className="text-slate-500 mt-1">Sedes oficiales habilitadas para competencia.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar sede..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-64 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> Nuevo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p className="col-span-3 text-center text-slate-400 py-10">Cargando...</p> : filtered.map((poly, i) => (
          <motion.div key={poly.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Target size={24} />
              </div>
              <button onClick={() => handleDelete(poly.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">{poly.name}</h3>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> {poly.address}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-xs text-slate-400 font-bold uppercase">Licencia:</span>
                <span className="text-xs font-mono text-slate-700">{poly.numero_licencia || 'PENDIENTE'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Nuevo Polígono</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre de Sede</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nº Licencia</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.numero_licencia} onChange={e => setFormData({...formData, numero_licencia: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex justify-center gap-2"><Save size={20} /> Registrar Sede</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePoligonos;