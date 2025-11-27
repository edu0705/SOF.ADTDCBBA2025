import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg'; // Tu logo SVG

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas. Intente nuevamente.');
      }
    } catch (err) {
      // Lo usamos para loguear en consola y calmar al linter, o simplemente catch {}
      console.error("Login error:", err); 
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light position-relative overflow-hidden">
      {/* Decoración de Fondo (Círculos abstractos) */}
      <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-10" style={{width: '400px', height: '400px', filter: 'blur(80px)'}}></div>
      <div className="position-absolute bottom-0 end-0 translate-middle rounded-circle bg-warning opacity-10" style={{width: '300px', height: '300px', filter: 'blur(60px)'}}></div>

      <div className="card-modern p-5 shadow-lg border-0" style={{ maxWidth: '400px', width: '100%', zIndex: 1 }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo ADT" className="mb-3" style={{ height: '80px' }} />
          <h4 className="fw-bold text-primary">Bienvenido</h4>
          <p className="text-muted small">Ingrese sus credenciales para continuar</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-2 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Usuario</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-person text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="ej: juan.perez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock text-muted"></i></span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary-modern w-100 py-2 d-flex justify-content-center align-items-center"
            disabled={loading}
          >
            {loading ? (
                <div className="spinner-border spinner-border-sm text-white" role="status"></div>
            ) : (
                <>Ingresar <i className="bi bi-arrow-right ms-2"></i></>
            )}
          </button>
        </form>

        <div className="mt-4 text-center border-top pt-3">
          <small className="text-muted d-block mb-1">¿Problemas de acceso?</small>
          <a href="#" className="text-decoration-none small fw-bold">Contactar Soporte</a>
        </div>
      </div>
      
      <div className="position-absolute bottom-0 w-100 text-center pb-3 text-muted small opacity-50">
        &copy; 2025 ADTCBBA - Sistema de Gestión v2.0
      </div>
    </div>
  );
};

export default Login;