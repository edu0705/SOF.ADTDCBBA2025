/* eslint-disable */
import React, { useState } from 'react';
import { useCompetencias } from '../hooks/useCompetencias';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Calendar, MapPin, MoreVertical, 
  Trash2, Eye, Filter, Trophy 
} from 'lucide-react';

const ManageCompetitions = () => {
  const { competencias, isLoading, eliminarCompetencia } = useCompetencias();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado simple
  const filtered = competencias.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(confirm('¿Eliminar competencia?')) eliminarCompetencia.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Competencias</h1>
          <p className="text-slate-500 mt-1">Gestiona el calendario deportivo anual.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar evento..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Link 
            to="/admin/competencias/crear" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> Crear Nueva
          </Link>
        </div>
      </div>

      {/* Grid de Tarjetas (Mobile) / Tabla (Desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Evento</th>
                <th className="px-6 py-4 text-left">Fecha & Lugar</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <Trophy size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No se encontraron competencias.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{comp.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: #{comp.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(comp.start_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {comp.poligono_name || 'Sin asignar'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${comp.status === 'Abierta' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          comp.status === 'Finalizada' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                          'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${comp.status === 'Abierta' ? 'bg-emerald-500' : comp.status === 'Finalizada' ? 'bg-slate-400' : 'bg-amber-500'}`}></span>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/admin/competencias/${comp.id}/stats`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(comp.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageCompetitions;