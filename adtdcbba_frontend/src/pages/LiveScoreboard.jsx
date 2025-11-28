/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Clock, Activity, Wifi } from 'lucide-react';
import { WS_BASE_URL } from '../config/api';

const LiveScoreboard = () => {
  const { competenciaId } = useParams();
  const [scores, setScores] = useState([]);
  
  // Datos simulados para visualización inmediata
  useEffect(() => {
    setScores([
      { id: 1, atleta: "Carlos Mamani", club: "CTT", score: 98, series: [10, 10, 9, 10, 9], totalX: 4 },
      { id: 2, atleta: "Jorge Vargas", club: "CTI", score: 96, series: [9, 9, 10, 10, 8], totalX: 2 },
      { id: 3, atleta: "Luis Fernández", club: "CTT", score: 94, series: [9, 8, 9, 10, 8], totalX: 1 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden p-6 md:p-12 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-slate-800 pb-8 relative z-10">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)] animate-pulse">
            <Activity size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic">LIVE SCORE</h1>
            <p className="text-slate-400 text-lg flex items-center gap-3 font-medium mt-1">
              <span className="flex items-center gap-1.5 text-red-500"><span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"/> EN VIVO</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-emerald-500"><Wifi size={16} /> Conectado</span>
            </p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <h2 className="text-3xl font-bold text-white mb-1">Campeonato Apertura</h2>
          <div className="inline-block bg-slate-800 px-4 py-1 rounded-lg border border-slate-700">
            <p className="text-blue-400 font-mono text-xl tracking-widest font-bold">PISTOLA 9MM</p>
          </div>
        </div>
      </header>

      {/* Tabla de Posiciones */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid gap-4">
          <AnimatePresence>
            {scores.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center justify-between p-6 rounded-3xl border backdrop-blur-sm transition-all
                  ${index === 0 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-slate-900/80 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
                    : index === 1 
                    ? 'bg-gradient-to-r from-slate-500/20 to-slate-900/80 border-slate-500/40' 
                    : 'bg-slate-900/60 border-slate-800'}`}
              >
                {/* Posición */}
                <div className="flex items-center gap-8 w-1/3">
                  <div className={`w-14 h-14 flex items-center justify-center text-3xl font-black rounded-xl
                    ${index === 0 ? 'bg-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/50' : 
                      index === 1 ? 'bg-slate-300 text-slate-900 shadow-lg shadow-slate-300/50' : 
                      index === 2 ? 'bg-orange-700 text-orange-100 shadow-lg shadow-orange-700/50' : 
                      'bg-slate-800 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white truncate">{item.atleta}</h3>
                    <span className="px-3 py-1 rounded-md bg-slate-800 text-xs font-bold text-slate-300 tracking-wider border border-slate-700">
                      {item.club}
                    </span>
                  </div>
                </div>

                {/* Series Visuales */}
                <div className="hidden md:flex gap-3">
                  {item.series.map((s, i) => (
                    <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl shadow-inner
                      ${s === 10 ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
                        s >= 9 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 
                        'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                      {s}
                    </div>
                  ))}
                </div>

                {/* Puntaje Total */}
                <div className="text-right w-1/4">
                  <div className="text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-2xl">
                    {item.score}
                  </div>
                  <div className="text-sm text-slate-400 font-mono font-medium tracking-wide">
                    {item.totalX}<span className="text-xs">x</span> CENTROS
                  </div>
                </div>

                {/* Trofeo para el líder */}
                {index === 0 && (
                  <div className="absolute -right-3 -top-3 bg-yellow-500 rounded-full p-2 shadow-lg shadow-yellow-500/40 animate-bounce">
                    <Trophy className="text-yellow-950 w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LiveScoreboard;