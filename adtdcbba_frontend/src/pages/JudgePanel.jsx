/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Save, RotateCcw, CheckCircle, AlertTriangle, ChevronRight, User } from 'lucide-react';

const JudgePanel = () => {
  // Estado simulado (Debería venir de React Query / WebSocket)
  const [competidor, setCompetidor] = useState({ id: 1, nombre: "Juan Pérez", dorsal: "104" });
  const [serie, setSerie] = useState([0, 0, 0, 0, 0]);
  const [ronda, setRonda] = useState(1);

  const updateImpacto = (index, valor) => {
    const newSerie = [...serie];
    newSerie[index] = valor;
    setSerie(newSerie);
  };

  const total = serie.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 pb-20">
      {/* Header Juez */}
      <header className="flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Target size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Panel de Juez</h1>
            <p className="text-xs text-slate-400">Puesto de Tiro #4</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> ONLINE
        </div>
      </header>

      {/* Tarjeta del Tirador */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-white/5 shadow-2xl mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {competidor.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{competidor.nombre}</h2>
              <p className="text-slate-400">Dorsal: <span className="text-white font-mono">{competidor.dorsal}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 uppercase tracking-wider">Ronda</p>
            <p className="text-3xl font-black text-blue-400">{ronda}<span className="text-base text-slate-500">/5</span></p>
          </div>
        </div>

        {/* Inputs de Impactos (Botones Grandes para Tocar) */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {serie.map((val, idx) => (
            <div key={idx} className="space-y-2">
              <label className="text-center block text-xs text-slate-500">Disp {idx + 1}</label>
              <input 
                type="number" 
                inputMode="numeric"
                min="0" max="10"
                value={val}
                onChange={(e) => updateImpacto(idx, parseInt(e.target.value) || 0)}
                className="w-full aspect-square bg-slate-950 border-2 border-slate-700 rounded-xl text-center text-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          ))}
        </div>

        {/* Totalizador */}
        <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5">
          <span className="text-slate-400 font-medium">Total Serie</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">{total} pts</span>
        </div>
      </motion.div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setSerie([0,0,0,0,0])}
          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-slate-300 flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw size={20} /> Limpiar
        </button>
        <button 
          className="p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Save size={20} /> Enviar Ronda
        </button>
      </div>

      {/* Lista de Espera */}
      <div className="mt-10">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Siguiente en línea</h3>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User size={18} className="text-slate-400" />
            <span className="text-slate-300">Ana Torrez (Dorsal 105)</span>
          </div>
          <ChevronRight size={18} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;