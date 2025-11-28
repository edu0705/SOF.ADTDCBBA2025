/* eslint-disable */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, User, CheckCircle, Clock, FileText, Filter, MoreHorizontal } from 'lucide-react';
import api from '../config/api';

const ManageInscripciones = () => {
  const { data: inscripciones = [], isLoading } = useQuery({
    queryKey: ['inscripciones'],
    queryFn: async () => (await api.get('/competencias/inscripciones/')).data
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inscripciones</h1>
          <p className="text-slate-500 mt-1">Control de participantes y pagos.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-64 shadow-sm" />
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 flex items-center gap-2"><Filter size={18} /> Filtros</button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Deportista</th>
                <th className="px-6 py-4 text-left">Competencia</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">Costo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Cargando...</td></tr>
              ) : inscripciones.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Sin registros.</td></tr>
              ) : inscripciones.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold"><User size={18} /></div>
                      <div>
                        <p className="font-semibold text-slate-800">{ins.deportista_nombre || 'Desconocido'}</p>
                        <p className="text-xs text-slate-400">{ins.club_nombre || 'Particular'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{ins.competencia_nombre || 'Evento Principal'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${ins.estado === 'CONFIRMADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {ins.estado === 'CONFIRMADA' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {ins.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">Bs. {ins.costo || '0.00'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FileText size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageInscripciones;