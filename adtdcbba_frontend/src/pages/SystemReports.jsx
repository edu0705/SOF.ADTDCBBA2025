// src/pages/SystemReports.jsx
import React, { useState, useEffect } from 'react';
import clubService from '../services/clubService';
import competenciaService from '../services/competenciaService';
import { FaShieldAlt, FaBullseye, FaPrint, FaSpinner } from 'react-icons/fa';

const SystemReports = () => {
  const [clubs, setClubs] = useState([]);
  const [poligonos, setPoligonos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
     const load = async () => {
         try {
            setLoading(true);
            // Ejecutamos ambas peticiones en paralelo para mayor velocidad
            const [resC, resP] = await Promise.all([
                clubService.getAllClubs(),
                competenciaService.api.get('poligonos/')
            ]);

            setClubs(resC.data.results || resC.data);
            setPoligonos(resP.data.results || resP.data);
         } catch(e) { 
             console.error("Error cargando reportes:", e); 
         } finally {
             setLoading(false);
         }
     };
     load();
  }, []);

  if (loading) {
      return (
          <div className="d-flex justify-content-center align-items-center min-vh-50">
              <div className="text-center">
                  <FaSpinner className="spinner-border text-primary mb-2" />
                  <p>Generando reporte institucional...</p>
              </div>
          </div>
      );
  }

  return (
      <div className="container fade-in mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                  <h2 className="fw-bold mb-0">Reporte Institucional</h2>
                  <p className="text-muted small">Vista general de afiliados e infraestructura</p>
              </div>
              <button className="btn btn-dark rounded-pill px-4" onClick={() => window.print()}>
                  <FaPrint className="me-2"/> Imprimir
              </button>
          </div>
          
          <div className="row printable-area">
              {/* Sección Clubes */}
              <div className="col-md-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-primary text-white d-flex align-items-center">
                          <FaShieldAlt className="me-2"/> 
                          <span className="fw-bold">Clubes Afiliados ({clubs.length})</span>
                      </div>
                      <ul className="list-group list-group-flush">
                          {clubs.length > 0 ? (
                              clubs.map(c => (
                                  <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                                      <div>
                                          <strong>{c.name}</strong>
                                          <div className="small text-muted">Pres: {c.presidente_club || 'N/A'}</div>
                                      </div>
                                  </li>
                              ))
                          ) : (
                              <li className="list-group-item text-center text-muted">No hay clubes registrados.</li>
                          )}
                      </ul>
                  </div>
              </div>

              {/* Sección Polígonos */}
              <div className="col-md-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-danger text-white d-flex align-items-center">
                          <FaBullseye className="me-2"/> 
                          <span className="fw-bold">Polígonos ({poligonos.length})</span>
                      </div>
                      <ul className="list-group list-group-flush">
                          {poligonos.length > 0 ? (
                              poligonos.map(p => (
                                  <li key={p.id} className="list-group-item">
                                      <strong>{p.name}</strong>
                                      <div className="small text-muted">{p.address}</div>
                                  </li>
                              ))
                          ) : (
                              <li className="list-group-item text-center text-muted">No hay polígonos registrados.</li>
                          )}
                      </ul>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default SystemReports;