/* eslint-disable */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, ArrowRight, CheckCircle, Loader2, Shield } from 'lucide-react';
import api from '../config/api';
// Usa tu logo o el ícono por defecto
import logo from '../assets/logo.svg';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', first_name: '', last_name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Ajusta el endpoint según tu backend real
      await api.post('/users/register/', formData);
      navigate('/login');
    } catch (err) {
      setError("Error al registrar. Verifique los datos o intente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA (Visual) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-5/12 bg-slate-900 relative items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900 z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        
        <div className="relative z-20 px-12 text-center">
          <div className="mb-8 inline-flex p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <UserPlus size={48} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Únete a la Élite</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Crea tu cuenta para gestionar tus inscripciones, ver tu historial de tiro y recibir certificaciones oficiales.
          </p>
          
          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <CheckCircle className="text-emerald-500 shrink-0" />
              <span className="text-slate-300 text-sm">Historial de puntajes y ranking nacional</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <CheckCircle className="text-emerald-500 shrink-0" />
              <span className="text-slate-300 text-sm">Inscripciones rápidas a competencias</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECCIÓN DERECHA (Formulario) */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-white"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Crear Cuenta</h2>
            <p className="text-slate-500 mt-2">Completa tus datos personales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nombre</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Juan" required 
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Apellido</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Pérez" required 
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type="email" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="juan@ejemplo.com" required 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="juan.perez" required 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input type="password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="••••••" required 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Confirmar</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input type="password" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="••••••" required 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex justify-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" /> : <>Registrarme <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia Sesión</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;