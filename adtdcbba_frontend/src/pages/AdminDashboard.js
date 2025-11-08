// src/pages/AdminDashboard.js

import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container-fluid mt-4">
      <h2 className="text-primary mb-4">Panel de Administración de ADTDCBBA</h2>
      <p className="lead">Bienvenido, Presidente/Administrador. Utiliza el menú lateral para gestionar los datos maestros y el flujo de competencias.</p>

      <div className="row g-4 mt-3">
        {/* Card de Gestión de Datos */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white fw-bold">
              Datos Maestros (CRUD)
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><Link to="/admin/poligonos">Gestionar Polígonos</Link></li>
                <li className="list-group-item"><Link to="/admin/jueces">Gestionar Jueces</Link></li>
                <li className="list-group-item"><Link to="/admin/modalidades">Gestionar Modalidades/Categorías</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card de Flujo de Competencia */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white fw-bold">
              Flujo y Cierre de Competencias
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><Link to="/admin/competencias">Cierre / Reportes Oficiales</Link></li>
                <li className="list-group-item"><Link to="/admin/inscripciones">Aprobar Inscripciones (Tesorero)</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card de Visibilidad de Resultados */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white fw-bold">
              Visibilidad Pública
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><Link to="/live-score">Marcador en Vivo</Link></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;