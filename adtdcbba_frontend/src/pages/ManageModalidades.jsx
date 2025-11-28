/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Search, Save, X, Flame, Wind } from 'lucide-react';
import api from '../config/api';

const ManageModalidades = () => {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', es_fuego: false });

  const fetchModalidades = async () => {
    try {
      const response = await api.get('/competencias/modalidades/');
      setModalidades(response.data);
    } catch {
      console.log("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModalidades(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/competencias/modalidades/', formData);
      setShowModal(false);
      setFormData({ name: '', es_fuego: false });
      fetchModalidades();
    } catch {
      alert('Error al guardar.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar?')) {
      try {
        await api.delete(`/competencias/modalidades/${id}/`);
        fetchModalidades();
      } catch {
        alert('No se puede eliminar.');
      }
    }
  };

  const filtered = modalidades.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Modalidades</h1>
          <p className="text-slate-500 mt-1">Catálogo de disciplinas oficiales.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-64 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> Nueva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="col-span-3 text-center text-slate-400">Cargando...</p> : filtered.map((mod, i) => (
          <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -mr-8 -mt-8 transition-transform group-hover:scale-150 ${mod.es_fuego ? 'bg-orange-500' : 'bg-blue-500'}`} />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl ${mod.es_fuego ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                {mod.es_fuego ? <Flame size={24} /> : <Wind size={24} />}
              </div>
              <button onClick={() => handleDelete(mod.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{mod.name}</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${mod.es_fuego ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
              {mod.es_fuego ? 'Fuego Central' : 'Aire Comprimido'}
            </span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Nueva Modalidad</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
                  <input autoFocus type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.es_fuego ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`} onClick={() => setFormData({...formData, es_fuego: !formData.es_fuego})}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.es_fuego ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>{formData.es_fuego ? <Flame size={20} /> : <Wind size={20} />}</div>
                    <span className="font-semibold text-slate-700">{formData.es_fuego ? 'Arma de Fuego' : 'Aire Comprimido'}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.es_fuego ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>{formData.es_fuego && <div className="w-2.5 h-2.5 bg-white rounded-full" />}</div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 flex justify-center gap-2"><Save size={20} /> Guardar</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageModalidades;