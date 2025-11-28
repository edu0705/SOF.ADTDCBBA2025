/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Target } from 'lucide-react';

const RecordCard = ({ disciplina, atleta, puntaje, fecha }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200 to-yellow-500 opacity-20 rounded-full -mr-8 -mt-8 blur-xl group-hover:opacity-30 transition-opacity" />
    
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-xl text-slate-600 group-hover:text-amber-600 transition-colors">
        <Target size={24} />
      </div>
      <Star className="text-yellow-400 fill-yellow-400" size={20} />
    </div>
    
    <h3 className="text-lg font-bold text-slate-800 mb-1">{disciplina}</h3>
    <p className="text-4xl font-black text-slate-900 mb-4">{puntaje} <span className="text-lg text-slate-400 font-medium">pts</span></p>
    
    <div className="border-t border-slate-100 pt-4">
      <p className="font-semibold text-slate-700">{atleta}</p>
      <p className="text-xs text-slate-400">{fecha}</p>
    </div>
  </motion.div>
);

const RecordsView = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Hall of Fame</h1>
          <p className="text-slate-500 text-lg">Récords Departamentales Vigentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecordCard disciplina="Pistola 9mm" atleta="Carlos Mamani" puntaje="99" fecha="Oct 2024" />
          <RecordCard disciplina="Rifle Aire 10m" atleta="Ana Torrez" puntaje="295" fecha="Ago 2023" />
          <RecordCard disciplina="Pistola Standard" atleta="Jorge Vargas" puntaje="560" fecha="Dic 2024" />
        </div>
      </div>
    </div>
  );
};

export default RecordsView;