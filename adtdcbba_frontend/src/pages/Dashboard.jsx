import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- COMPONENTE EXTRAÍDO (FUERA DEL COMPONENTE PRINCIPAL) ---
// Al definirlo aquí, React lo trata como un componente estable.
const QuickActionCard = ({ title, icon, link, color, desc }) => (
  <div className="col-md-4 mb-4">
    <Link to={link} className="text-decoration-none">
      <div className="card-modern h-100 p-4 position-relative overflow-hidden">
        <div className={`position-absolute top-0 end-0 p-3 opacity-10 text-${color}`}>
          <i className={`bi ${icon}`} style={{ fontSize: '5rem' }}></i>
        </div>
        <div className="position-relative z-1">
          <div className={`icon-box bg-${color} bg-opacity-10 text-${color} rounded-circle d-inline-flex p-3 mb-3`}>
            <i className={`bi ${icon} fs-3`}></i>
          </div>
          <h5 className="fw-bold text-dark mb-2">{title}</h5>
          <p className="text-muted small mb-0">{desc}</p>
        </div>
      </div>
    </Link>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container-fluid py-4">
      {/* Bienvenida */}
      <div className="row mb-5 align-items-center">
        <div className="col-md-8">
          <h1 className="fw-bold text-primary-dark mb-1">
            Hola, {user?.first_name || 'Usuario'} 👋
          </h1>
          <p className="text-muted">Bienvenido al Sistema de Gestión Deportiva ADTCBBA.</p>
        </div>
        <div className="col-md-4 text-end">
          <span className="badge bg-primary p-2 rounded-pill">
            <i className="bi bi-calendar-event me-1"></i> Gestión 2025
          </span>
        </div>
      </div>

      {/* Métricas Rápidas (Mockup visual) */}
      <div className="row mb-5">
        <div className="col-md-3">
          <div className="card-modern p-3 border-start border-4 border-primary">
            <small className="text-muted text-uppercase fw-bold">Competencias Activas</small>
            <h2 className="fw-bold mt-2 mb-0">3</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-modern p-3 border-start border-4 border-success">
            <small className="text-muted text-uppercase fw-bold">Inscripciones Hoy</small>
            <h2 className="fw-bold mt-2 mb-0">12</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-modern p-3 border-start border-4 border-warning">
            <small className="text-muted text-uppercase fw-bold">Próximo Evento</small>
            <h6 className="fw-bold mt-2 mb-0 text-truncate">Nacional FBI 9mm</h6>
          </div>
        </div>
      </div>

      {/* Accesos Directos por Rol */}
      <h5 className="fw-bold text-secondary mb-3">Accesos Directos</h5>
      <div className="row">
        <QuickActionCard 
          title="Marcador en Vivo" 
          desc="Ver resultados de competencias en tiempo real."
          icon="bi-broadcast" 
          link="/live-score" 
          color="danger"
        />
        
        {(user?.role === 'admin' || user?.is_superuser) && (
          <>
            <QuickActionCard 
              title="Gestión de Competencias" 
              desc="Crear eventos, definir costos y fechas."
              icon="bi-trophy" 
              link="/competencias" 
              color="primary"
            />
            <QuickActionCard 
              title="Base de Deportistas" 
              desc="Administrar padrón, credenciales y armas."
              icon="bi-people" 
              link="/deportistas" 
              color="success"
            />
            <QuickActionCard 
              title="Reportes y REAFUC" 
              desc="Generar informes oficiales y trazabilidad."
              icon="bi-file-earmark-bar-graph" 
              link="/reports" 
              color="info"
            />
          </>
        )}

        {(user?.role === 'juez') && (
          <QuickActionCard 
            title="Panel de Juez" 
            desc="Registrar puntajes y validar series."
            icon="bi-pencil-square" 
            link="/judge-panel" 
            color="warning"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;