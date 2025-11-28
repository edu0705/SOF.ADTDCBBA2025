/* eslint-disable */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Users, Target, Activity, Printer, Download } from 'lucide-react';
import api from '../config/api';

const StatBox = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

const CompetitionStats = () => {
  const { id } = useParams();
  
  // Mockup temporal, reemplazar con llamada real
  const stats = {
    inscritos: 45,
    participaron: 42,
    promedio: 88.5,
    mejor_puntaje: 99
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Estadísticas del Evento</h1>
          <p className="text-slate-500 mt-1">Análisis de rendimiento y participación.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <Printer size={18} /> Imprimir Informe
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl shadow-lg hover:bg-slate-800 flex items-center gap-2">
            <Download size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Grid KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Inscritos" value={stats.inscritos} icon={Users} color="bg-blue-500" />
        <StatBox label="Asistencia" value={`${Math.round((stats.participaron/stats.inscritos)*100)}%`} icon={Activity} color="bg-emerald-500" />
        <StatBox label="Promedio General" value={stats.promedio} icon={Target} color="bg-purple-500" />
        <StatBox label="Mejor Puntaje" value={stats.mejor_puntaje} icon={Trophy} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Participación por Club</h3>
          <div className="flex items-center justify-center h-64 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            Gráfico Circular Aquí
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top 5 Atletas</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((pos) => (
              <div key={pos} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${pos===1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                    {pos}
                  </div>
                  <span className="font-medium text-slate-700">Deportista {pos}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{100 - pos * 2} pts</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionStats;