/* eslint-disable */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Phone, Mail, Award, Target, Calendar, 
  ArrowLeft, FileText, ShieldCheck 
} from 'lucide-react';
import api from '../config/api';

const DeportistaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: deportista, isLoading } = useQuery({
    queryKey: ['deportista', id],
    queryFn: async () => (await api.get(`/deportistas/${id}/`)).data
  });

  if (isLoading) return <div className="p-10 text-center text-slate-400">Cargando perfil...</div>;
  if (!deportista) return <div className="p-10 text-center text-red-500">Deportista no encontrado</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <ArrowLeft size={18} /> Volver al directorio
      </button>

      {/* Tarjeta Principal */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20" />
          <div className="absolute bottom-4 right-8 flex gap-3">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 uppercase tracking-wide">
              {deportista.club_nombre || 'Sin Club'}
            </span>
            <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-full text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={12} /> Habilitado
            </span>
          </div>
        </div>

        <div className="px-10 pb-10 relative">
          {/* Avatar Flotante */}
          <div className="-mt-20 mb-6 inline-block relative">
            <div className="w-40 h-40 rounded-3xl bg-white p-2 shadow-2xl">
              <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
                {deportista.foto ? (
                  <img src={deportista.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info Personal */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">{deportista.first_name} {deportista.last_name}</h1>
                <p className="text-slate-500 text-lg">Atleta Federado • {deportista.categoria_nombre || 'Categoría General'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cédula de Identidad</p>
                  <p className="text-lg font-semibold text-slate-800">{deportista.ci}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fecha Nacimiento</p>
                  <p className="text-lg font-semibold text-slate-800">{deportista.fecha_nacimiento || '--/--/----'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={18} className="text-slate-400" />
                  <span>{deportista.ciudad}, Bolivia</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span>{deportista.email || 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={18} className="text-slate-400" />
                  <span>{deportista.telefono || '--'}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas (Bento) */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-900">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Target size={20} /></div>
                  <h3 className="font-bold">Participaciones</h3>
                </div>
                <p className="text-3xl font-black">12</p>
                <p className="text-sm text-blue-600/80">Competencias oficiales</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-amber-900">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Award size={20} /></div>
                  <h3 className="font-bold">Ranking</h3>
                </div>
                <p className="text-3xl font-black">#5</p>
                <p className="text-sm text-amber-600/80">Posición Nacional</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeportistaDetail;