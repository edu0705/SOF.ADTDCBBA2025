/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Search, ChevronRight } from 'lucide-react';

const ResultsList = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Público */}
      <header className="bg-slate-900 text-white py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
          <h1 className="text-4xl font-bold mb-2">Resultados Oficiales</h1>
          <p className="text-slate-400 text-lg">Consulta los puntajes y rankings de todas las competencias.</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 -mt-8 relative z-20">
        {/* Buscador Flotante */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center mb-10">
          <Search className="ml-4 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar competencia, atleta o club..." 
            className="w-full p-4 outline-none text-lg text-slate-700"
          />
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Buscar
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {2025}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Campeonato Nacional Apertura</h3>
                  <p className="text-slate-500 text-sm">Polígono Central • Pistola 9mm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 uppercase font-bold">Ganador</p>
                  <div className="flex items-center gap-1">
                    <Medal size={14} className="text-yellow-500" />
                    <span className="font-medium text-slate-700">Carlos Mamani (CTT)</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsList;