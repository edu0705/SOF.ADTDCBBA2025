/* eslint-disable */
import React from 'react';
import { useCompetencias } from '../hooks/useCompetencias';
import { motion } from 'framer-motion';
import { 
  Users, Trophy, Calendar, TrendingUp, 
  ArrowRight, Activity, DollarSign, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
  const colors = {
    blue: "bg-blue-500 text-blue-600",
    green: "bg-emerald-500 text-emerald-600",
    orange: "bg-orange-500 text-orange-600",
    purple: "bg-purple-500 text-purple-600"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden"
    >
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { competencias, isLoading } = useCompetencias();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
          <p className="text-slate-500">Resumen de actividad del club.</p>
        </div>
        <Link to="/admin/competencias/crear" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all">
          <Plus size={20} /> Crear Competencia
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inscritos" value="142" icon={Users} color="blue" delay={1} />
        <StatCard title="Ingresos" value="Bs 12k" icon={DollarSign} color="green" delay={2} />
        <StatCard title="Activas" value={competencias?.length || 0} icon={Activity} color="orange" delay={3} />
        <StatCard title="Rendimiento" value="+24%" icon={TrendingUp} color="purple" delay={4} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Competencias Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Fecha</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Cargando...</td></tr>
              ) : competencias.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{comp.name}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(comp.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {comp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/competencias/${comp.id}/stats`} className="text-blue-600 hover:underline text-sm font-medium">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;