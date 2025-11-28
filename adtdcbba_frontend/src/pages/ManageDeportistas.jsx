/* eslint-disable */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, User, MapPin, ChevronRight, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const ManageDeportistas = () => {
  const { data: deportistas = [], isLoading } = useQuery({
    queryKey: ['deportistas'],
    queryFn: async () => (await api.get('/deportistas/')).data
  });

  const [searchTerm, setSearchTerm] = useState('');
  const filtered = deportistas.filter(d => `${d.first_name} ${d.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Deportistas</h1>
          <p className="text-slate-500 mt-1">Directorio oficial de atletas.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Nombre o CI..." className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Link to="/admin/deportistas/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap">
            <Plus size={20} /> Nuevo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? <p className="col-span-4 text-center text-slate-400 py-20">Cargando...</p> : filtered.map((dep, i) => (
          <motion.div key={dep.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50 z-0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center mt-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100">
                  {dep.foto ? <img src={dep.foto} alt="Foto" className="w-full h-full object-cover" /> : <User size={36} />}
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 text-center leading-tight">{dep.first_name} {dep.last_name}</h3>
              <div className="mt-2 mb-6 flex flex-wrap justify-center gap-2">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">{dep.club_nombre || 'Sin Club'}</span>
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/50">
                  <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400"><Hash size={14} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cédula</p><p className="text-sm font-medium text-slate-700">{dep.ci || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/50">
                  <div className="p-1.5 bg-white rounded-md shadow-sm text-slate-400"><MapPin size={14} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ciudad</p><p className="text-sm font-medium text-slate-700 truncate">{dep.ciudad || 'Cochabamba'}</p></div>
                </div>
              </div>
              <Link to={`/admin/deportistas/${dep.id}`} className="w-full mt-6 py-3 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-600 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 transition-all active:scale-95">
                Ver Perfil <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ManageDeportistas;