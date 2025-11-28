/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';

const ReportCard = ({ title, description, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
  >
    <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-6">{description}</p>
    <div className="flex items-center text-blue-600 font-semibold text-sm">
      Generar Reporte <TrendingUp size={16} className="ml-2" />
    </div>
  </motion.div>
);

const SystemReports = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reportes & Analítica</h1>
          <p className="text-slate-500 mt-1">Inteligencia de negocios y exportación de datos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Ranking Anual" 
          description="Consolidado de puntajes por atleta y categoría de la gestión 2025." 
          icon={Trophy} 
          color="bg-amber-500" 
        />
        <ReportCard 
          title="Uso de Polígonos" 
          description="Estadísticas de ocupación y frecuencia de uso de las sedes." 
          icon={BarChart3} 
          color="bg-blue-500" 
        />
        <ReportCard 
          title="Reporte Financiero" 
          description="Balance de ingresos por inscripciones y egresos operativos." 
          icon={PieChart} 
          color="bg-emerald-500" 
        />
        <ReportCard 
          title="Asistencia de Atletas" 
          description="Histórico de participación y ausentismo en competencias." 
          icon={Users} 
          color="bg-purple-500" 
        />
        <ReportCard 
          title="Reporte REAFUC" 
          description="Formato oficial para control de armas y municiones." 
          icon={FileText} 
          color="bg-slate-700" 
        />
      </div>

      {/* Sección de Exportación Rápida */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex items-center justify-between"
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Base de Datos Completa</h3>
          <p className="text-slate-400">Descarga un backup completo de inscripciones y resultados en formato CSV/Excel.</p>
        </div>
        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors z-10">
          <Download size={20} /> Descargar Data
        </button>
        
        {/* Decoración */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-16 -mt-16" />
      </motion.div>
    </div>
  );
};

// Iconos necesarios para este archivo (algunos ya importados, agrego los que faltan)
import { Trophy, Users, FileText } from 'lucide-react';

export default SystemReports;