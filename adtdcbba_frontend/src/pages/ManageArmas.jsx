/* eslint-disable */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Crosshair, Plus, FileText, Shield } from 'lucide-react';
import api from '../config/api';

const ManageArmas = () => {
  const { data: armas = [], isLoading } = useQuery({
    queryKey: ['armas'],
    queryFn: async () => (await api.get('/deportistas/armas/')).data
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Armas</h1>
          <p className="text-slate-500 mt-1">Control de matrícula y asignación de equipamiento.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar matrícula..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Arma / Modelo</th>
                <th className="px-6 py-4 text-left">Matrícula</th>
                <th className="px-6 py-4 text-left">Calibre</th>
                <th className="px-6 py-4 text-left">Propietario</th>
                <th className="px-6 py-4 text-right">Documentos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Cargando inventario...</td></tr>
              ) : armas.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No hay armas registradas en el sistema.</td></tr>
              ) : armas.map((arma) => (
                <tr key={arma.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{arma.marca}</div>
                    <div className="text-xs text-slate-500">{arma.modelo}</div>
                  </td>
                  
                  {/* CORRECCIÓN AQUÍ: Separamos el TD del SPAN para evitar conflicto de paddings */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-sm">
                      {arma.matricula}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {arma.calibre}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="p-1 bg-blue-50 rounded text-blue-600">
                        <Shield size={14} />
                      </div>
                      <span className="text-sm font-medium">{arma.deportista_nombre}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg" title="Ver Tenencia">
                      <FileText size={18} />
                    </button>
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

export default ManageArmas;