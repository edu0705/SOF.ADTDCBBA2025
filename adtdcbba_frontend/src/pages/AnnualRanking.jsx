/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, TrendingUp } from 'lucide-react';

const AnnualRanking = () => {
  const ranking = [
    { id: 1, nombre: "Carlos Mamani", club: "CTT", puntos: 450, competencias: 5 },
    { id: 2, nombre: "Jorge Vargas", club: "CTI", puntos: 420, competencias: 5 },
    { id: 3, nombre: "Ana Torrez", club: "CTI", puntos: 380, competencias: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center py-10">
          <div className="inline-block p-4 bg-yellow-100 rounded-full text-yellow-600 mb-4 shadow-lg shadow-yellow-500/20">
            <Trophy size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ranking Anual 2025</h1>
          <p className="text-slate-500 mt-2 text-lg">Mejores tiradores de la gestión</p>
        </div>

        <div className="grid gap-4">
          {ranking.map((atleta, i) => (
            <motion.div 
              key={atleta.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md
                ${i === 0 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200' : 'bg-white border-slate-100'}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl mr-6
                ${i === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40' : 
                  i === 1 ? 'bg-slate-400 text-white' : 
                  i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {i + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">{atleta.nombre}</h3>
                  {i === 0 && <Crown size={18} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-slate-500 text-sm font-medium">{atleta.club}</p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-slate-900">{atleta.puntos}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Puntos</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnualRanking;