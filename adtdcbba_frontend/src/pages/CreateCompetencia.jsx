/* eslint-disable */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Save, ArrowLeft, Loader2, Target, DollarSign } from 'lucide-react';
import competenciaService from '../services/competenciaService';

const CreateCompetencia = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({ 
    name: '', 
    start_date: '', 
    poligono: '', 
    status: 'Abierta',
    costo_inscripcion_base: 0
  });

  // 1. Cargar Polígonos desde la BD
  const { data: poligonos = [], isLoading: loadingPoly } = useQuery({
    queryKey: ['poligonos'],
    queryFn: competenciaService.getPoligonos
  });

  // 2. Mutación de guardado
  const crearCompetencia = useMutation({
    mutationFn: competenciaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['competencias']);
      navigate('/admin/competencias');
    },
    onError: () => alert("Error al crear la competencia. Verifique los datos.")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    crearCompetencia.mutate(form);
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <motion.button 
        whileHover={{ x: -5 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Volver
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Target size={28} /></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nueva Convocatoria</h2>
            <p className="text-slate-500 text-sm">Configura el evento oficial.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Nombre del Evento</label>
            <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej. Campeonato Nacional Apertura" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Fecha de Inicio</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="date" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-600" 
                  value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Sede / Polígono</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-600 appearance-none" 
                  value={form.poligono} onChange={e => setForm({...form, poligono: e.target.value})}>
                  <option value="">Seleccionar Sede...</option>
                  {poligonos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {loadingPoly && <p className="text-xs text-blue-500 ml-1">Cargando sedes...</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Costo de Inscripción (Base)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="number" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none" 
                value={form.costo_inscripcion_base} onChange={e => setForm({...form, costo_inscripcion_base: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={crearCompetencia.isPending} className="flex-1 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex justify-center gap-2">
              {crearCompetencia.isPending ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Publicar Convocatoria</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCompetencia;