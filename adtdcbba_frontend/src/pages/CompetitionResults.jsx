/* eslint-disable */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Target, Medal, Calendar } from 'lucide-react';

const CompetitionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mockup data
  const results = [
    { id: 1, puesto: 1, atleta: "Carlos Mamani", club: "CTT", puntaje: 98, x: 4 },
    { id: 2, puesto: 2, atleta: "Jorge Vargas", club: "CTI", puntaje: 96, x: 2 },
    { id: 3, puesto: 3, atleta: "Luis Fernández", club: "CTT", puntaje: 94, x: 1 },
    { id: 4, puesto: 4, atleta: "Ana Torrez", club: "CTI", puntaje: 91, x: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">Finalizada</span>
              <span className="flex items-center gap-1 text-slate-500 text-sm"><Calendar size={14} /> 27 Nov 2025</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Campeonato Apertura</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Target size={16} /> Pistola 9mm • Polígono Central
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Mejor Marca</p>
              <p className="text-xl font-bold text-slate-800">98 pts</p>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4 text-center w-20">#</th>
                  <th className="px-6 py-4 text-left">Atleta</th>
                  <th className="px-6 py-4 text-left">Club</th>
                  <th className="px-6 py-4 text-center">Centros (X)</th>
                  <th className="px-6 py-4 text-right">Puntaje Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full font-bold ${
                        res.puesto === 1 ? 'bg-yellow-100 text-yellow-700' :
                        res.puesto === 2 ? 'bg-slate-200 text-slate-600' :
                        res.puesto === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                      }`}>
                        {res.puesto}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                      {res.puesto <= 3 && <Medal size={16} className={
                        res.puesto === 1 ? 'text-yellow-500' :
                        res.puesto === 2 ? 'text-slate-400' : 'text-orange-500'
                      } />}
                      {res.atleta}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{res.club}</td>
                    <td className="px-6 py-4 text-center font-mono text-slate-600">{res.x}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-bold text-slate-900">{res.puntaje}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionResults;