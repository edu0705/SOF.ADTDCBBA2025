/* eslint-disable */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, MapPin, Search } from 'lucide-react';
import api from '../config/api';

const ManageClubs = () => {
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => (await api.get('/clubs/')).data // Asegúrate de tener esta ruta en backend
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clubes Afiliados</h1>
          <p className="text-slate-500 mt-1">Asociaciones deportivas registradas.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Buscar club..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-64 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p className="col-span-3 text-center text-slate-400 py-10">Cargando...</p> : clubs.map((club, i) => (
          <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                {club.logo ? <img src={club.logo} className="w-full h-full object-cover rounded-2xl" /> : <Shield size={32} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{club.name}</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">{club.sigla || 'S/N'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Users size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500 font-medium">Miembros</p>
                <p className="text-lg font-bold text-slate-800">{club.num_miembros || 0}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <MapPin size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500 font-medium">Ubicación</p>
                <p className="text-sm font-bold text-slate-800 truncate">{club.ciudad || 'CBA'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ManageClubs;