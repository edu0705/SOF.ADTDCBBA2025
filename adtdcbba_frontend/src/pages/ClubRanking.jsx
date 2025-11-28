/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award } from 'lucide-react';

const ClubRanking = () => {
  const clubs = [
    { nombre: "Club de Tiro Tunari", sigla: "CTT", puntos: 1250, miembros: 24 },
    { nombre: "Club Illimani", sigla: "CTI", puntos: 980, miembros: 18 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Copa de Clubes</h1>
            <p className="text-slate-500">Clasificación por equipos temporada 2025</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {clubs.map((club, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden"
            >
              {i === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10" />}
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="text-5xl font-black text-slate-200">0{i + 1}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{club.nombre}</h2>
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider">{club.miembros} Atletas</span>
                </div>
              </div>

              <div className="text-right relative z-10">
                <p className="text-4xl font-black text-blue-600">{club.puntos}</p>
                <p className="text-sm text-slate-400 font-medium">Puntos Totales</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubRanking;