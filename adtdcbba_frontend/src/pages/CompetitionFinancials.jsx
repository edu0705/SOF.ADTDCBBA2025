/* eslint-disable */
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, Wallet, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinancialCard = ({ title, amount, type, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${type === 'income' ? 'bg-emerald-100 text-emerald-600' : type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
        <Icon size={24} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${type === 'income' ? 'bg-emerald-50 text-emerald-700' : type === 'expense' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
        {type === 'income' ? '+ INGRESOS' : type === 'expense' ? '- GASTOS' : '= BALANCE'}
      </span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-3xl font-bold text-slate-800 mt-1">{amount}</h3>
  </div>
);

const CompetitionFinancials = () => {
  const { id } = useParams();

  // Mock Data
  const data = {
    ingresos: "12,450 Bs",
    gastos: "4,200 Bs",
    balance: "8,250 Bs",
    movimientos: [
      { id: 1, desc: "Inscripciones (45 atletas)", tipo: "ingreso", monto: 12450, fecha: "27/11/2025" },
      { id: 2, desc: "Alquiler Polígono", tipo: "gasto", monto: 1500, fecha: "26/11/2025" },
      { id: 3, desc: "Refrigerios Staff", tipo: "gasto", monto: 500, fecha: "27/11/2025" },
      { id: 4, desc: "Trofeos y Medallas", tipo: "gasto", monto: 2200, fecha: "25/11/2025" },
    ]
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link to="/admin/competencias" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Balance Financiero</h1>
          <p className="text-slate-500">Campeonato Apertura 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard title="Total Recaudado" amount={data.ingresos} type="income" icon={TrendingUp} />
        <FinancialCard title="Gastos Operativos" amount={data.gastos} type="expense" icon={TrendingDown} />
        <FinancialCard title="Utilidad Neta" amount={data.balance} type="balance" icon={Wallet} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Detalle de Movimientos</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Concepto</th>
              <th className="px-6 py-4 text-left">Fecha</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.movimientos.map((mov) => (
              <tr key={mov.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-700">{mov.desc}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{mov.fecha}</td>
                <td className={`px-6 py-4 text-right font-mono font-bold ${mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {mov.tipo === 'ingreso' ? '+' : '-'} {mov.monto} Bs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitionFinancials;