/* eslint-disable */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, ArrowLeft, Printer } from 'lucide-react';

const StartList = () => {
  const navigate = useNavigate();
  // Mock Data
  const turnos = [
    { hora: "08:00", atletas: ["Juan Pérez", "Ana Silva", "Mario Cruz", "Sofia L."] },
    { hora: "09:00", atletas: ["Pedro M.", "Luisa K.", "Roberto B.", "Carla T."] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={18} /> Volver
          </button>
          <button className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            <Printer size={18} /> Imprimir Lista
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Lista de Salida</h1>
          <p className="text-slate-500 mt-2">Turnos asignados para el Campeonato Apertura</p>
        </div>

        <div className="grid gap-6">
          {turnos.map((turno, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Clock className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800 text-lg">Turno {turno.hora} AM</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {turno.atletas.map((atleta, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm">
                      {j + 1}
                    </div>
                    <span className="text-slate-700 font-medium">{atleta}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartList;