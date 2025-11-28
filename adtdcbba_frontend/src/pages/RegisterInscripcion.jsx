/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const RegisterInscripcion = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Inscripción</h1>
        <p className="text-slate-500 mt-1">Completa los pasos para inscribirte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold text-lg text-slate-800">Seleccionar Evento</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer transition-all">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-800">Campeonato Apertura 2025</span>
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-500">
              Torneo Nacional (Próximamente)
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold text-lg text-slate-800">Confirmación</h3>
          </div>
          <div className="space-y-4 text-center py-8">
            <User size={48} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 text-sm">Selecciona una competencia para continuar.</p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2">
          Siguiente Paso <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RegisterInscripcion;