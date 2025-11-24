// src/pages/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService'; // Necesario para obtener roles en la redirección
import { FaUser, FaLock, FaExclamationCircle } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  // Importamos 'login' desde el contexto. 
  // Nota: Este 'login' ya maneja la llamada a la API y la actualización del estado.
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }) => {
      // 1. Llamamos a la función login del AuthContext.
      // Esto hace el POST a /token/, setea las cookies y actualiza el estado "isLoggedIn".
      await login(username, password);

      // 2. Obtenemos los datos del usuario para saber a dónde redirigir.
      // (Hacemos esto aquí porque necesitamos los roles específicos para la lógica de navegación)
      const currentUser = await authService.getCurrentUser();
      return currentUser;
    },
    onSuccess: (userData) => {
      // --- LÓGICA DE REDIRECCIÓN ---
      const roles = userData.groups || []; // Aseguramos que sea un array
      
      // Nota: Ya no llamamos a login(roles) aquí porque mutationFn ya lo hizo.

      if (userData.force_password_change) {
        navigate('/change-password');
      } else if (roles.includes('Presidente') || roles.includes('Tesorero')) {
        navigate('/admin');
      } else if (roles.includes('Club')) {
        navigate('/dashboard');
      } else if (roles.includes('Juez')) {
        navigate('/juez');
      } else if (roles.includes('Deportista')) {
        navigate('/mi-perfil');
      } else {
        // Si no tiene rol específico, al dashboard por defecto
        navigate('/dashboard'); 
      }
    }
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" 
         style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
      
      <div className="card border-0 shadow-lg p-5 text-center fade-in" 
           style={{ maxWidth: '400px', width: '90%', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px' }}>
        
        <div className="mb-4">
          <img src={logo} alt="ADT" style={{ width: '100px', marginBottom: '15px' }} />
          <h3 className="fw-bold text-dark">Bienvenido</h3>
          <p className="text-muted small">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* CAMPO USUARIO */}
          <div className="mb-3">
            <div className={`input-group shadow-sm rounded-pill overflow-hidden border ${errors.username ? 'border-danger' : ''}`}>
              <span className="input-group-text bg-white border-0 ps-3"><FaUser className="text-primary"/></span>
              <input 
                type="text" 
                className="form-control border-0 py-2" 
                placeholder="Usuario" 
                {...register("username", { required: "El usuario es obligatorio" })} 
              />
            </div>
            {errors.username && (
              <div className="text-danger small text-start ps-3 mt-1">{errors.username.message}</div>
            )}
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="mb-4">
            <div className={`input-group shadow-sm rounded-pill overflow-hidden border ${errors.password ? 'border-danger' : ''}`}>
              <span className="input-group-text bg-white border-0 ps-3"><FaLock className="text-primary"/></span>
              <input 
                type="password" 
                className="form-control border-0 py-2" 
                placeholder="Contraseña" 
                {...register("password", { required: "La contraseña es obligatoria" })} 
              />
            </div>
            {errors.password && (
              <div className="text-danger small text-start ps-3 mt-1">{errors.password.message}</div>
            )}
          </div>

          {/* ERRORES DE API */}
          {loginMutation.isError && (
            <div className="alert alert-danger py-2 small rounded-3 mb-3 d-flex align-items-center justify-content-center">
              <FaExclamationCircle className="me-2"/>
              {loginMutation.error?.response?.status === 401 
                ? 'Usuario o contraseña incorrectos.' 
                : 'Error al iniciar sesión. Intente nuevamente.'}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm transition-all" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;