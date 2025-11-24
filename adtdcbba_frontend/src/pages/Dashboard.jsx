import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // React Query
import { useAuth } from '../context/AuthContext';
import deportistaService from '../services/deportistaService';
import { FaUserPlus, FaClipboardList, FaUsers, FaMedal, FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();

  // Consulta automática de estadísticas (Caché activo por 5 minutos)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Usamos el servicio existente para traer stats del club/usuario
      const res = await deportistaService.getStats(); 
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const options = [
    { 
      title: 'Registrar Deportista', 
      desc: 'Afilia a un nuevo atleta a tu club.', 
      link: '/register-deportista', 
      icon: <FaUserPlus />,
      color: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' 
    },
    { 
      title: 'Nueva Inscripción', 
      desc: 'Inscribe atletas a competencias activas.', 
      link: '/register-inscripcion', 
      icon: <FaClipboardList />,
      color: 'linear-gradient(135deg, #1cc88a 0%, #13855c 100%)' 
    },
  ];

  return (
    <div className="container-fluid fade-in">
      {/* Encabezado */}
      <div className="mb-5">
        <span className="text-uppercase text-muted small fw-bold tracking-wide">Vista General</span>
        <h2 className="fw-bold text-dark mt-1">
            Hola, {user?.username || 'Club'}
        </h2>
        <p className="text-muted">Bienvenido al panel de gestión de tu club.</p>
      </div>

      {/* Tarjetas de Acción */}
      <div className="row mb-5">
        {options.map((opt, i) => (
          <div key={i} className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100 hover-scale transition-transform" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div 
                  className="rounded-4 d-flex align-items-center justify-content-center me-4 text-white shadow-sm"
                  style={{ width: '70px', height: '70px', background: opt.color, fontSize: '1.8rem' }}
                >
                  {opt.icon}
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-1">{opt.title}</h5>
                  <p className="text-muted small mb-3">{opt.desc}</p>
                  <Link to={opt.link} className="btn btn-sm rounded-pill fw-bold px-4 btn-outline-primary">
                    Acceder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de Estadísticas (Conectado a API) */}
      <div className="row">
          <div className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '20px' }}>
                  <div className="d-flex align-items-center">
                      <FaUsers className="text-primary mb-0 me-3" style={{ fontSize: '2rem', opacity: 0.2 }} />
                      <div>
                          {isLoading ? (
                            <FaSpinner className="spinner-border spinner-border-sm text-muted" />
                          ) : (
                            <h3 className="fw-bold text-dark mb-0">{stats?.total_deportistas || 0}</h3>
                          )}
                          <p className="text-muted small mb-0">Deportistas Activos</p>
                      </div>
                  </div>
              </div>
          </div>
          <div className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '20px' }}>
                   <div className="d-flex align-items-center">
                      <FaMedal className="text-warning mb-0 me-3" style={{ fontSize: '2rem', opacity: 0.2 }} />
                      <div>
                          {isLoading ? (
                             <FaSpinner className="spinner-border spinner-border-sm text-muted" />
                          ) : (
                             <h3 className="fw-bold text-dark mb-0">{stats?.podios || 0}</h3>
                          )}
                          <p className="text-muted small mb-0">Podios obtenidos</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;