/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, FileText, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '../config/api';

const VerificationPortal = () => {
  const { codigo } = useParams();
  const [searchCode, setSearchCode] = useState(codigo || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (codigo) handleSearch(codigo);
  }, [codigo]);

  const handleSearch = async (codeToSearch = searchCode) => {
    if (!codeToSearch) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.get(`/public/verificar/${codeToSearch}/`);
      setResult(data);
    } catch {
      setError("Documento no encontrado o código inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20 shadow-2xl">
            <ShieldCheck className="text-blue-400 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Verificación Oficial</h1>
          <p className="text-slate-400 mt-2 text-lg">Sistema de Validación de Certificados</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="CÓDIGO DEL CERTIFICADO"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all uppercase tracking-widest placeholder-slate-400 font-mono text-center font-bold text-slate-800"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          </div>

          <button 
            onClick={() => handleSearch()}
            disabled={loading || !searchCode}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Validar Documento"}
          </button>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                <XCircle className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-center gap-2 mb-6 text-emerald-700 bg-emerald-50 px-6 py-2 rounded-full w-fit mx-auto border border-emerald-200 shadow-sm">
                  <CheckCircle size={20} />
                  <span className="text-sm font-bold uppercase tracking-wide">Auténtico y Válido</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Deportista</p>
                    <p className="text-xl font-bold text-slate-900">{result.deportista}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Competencia</p>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{result.competencia}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Puntaje</p>
                      <p className="text-2xl font-black text-blue-600">{result.puntaje}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                   <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} /> Certificado Digitalmente por ADT System
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 group">
            Acceso Administrativo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;