import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import competenciaService from '../services/competenciaService';
import { FaPlus, FaCalendarAlt, FaLock, FaCheckCircle, FaEdit, FaSearch, FaSpinner } from 'react-icons/fa';

const ManageCompetitions = () => {
  const [filter, setFilter] = useState('');
  const queryClient = useQueryClient();

  // 1. Obtener Datos (Automático)
  const { data: competencias = [], isLoading } = useQuery({
    queryKey: ['competencias'],
    queryFn: async () => {
      const res = await competenciaService.getCompetencias();
      // Normalizamos la respuesta (si viene paginada o lista directa)
      return (res.data.results) ? res.data.results : res.data;
    }
  });

  // 2. Mutación para Cerrar Competencia
  const closeMutation = useMutation({
    mutationFn: async (id) => {
      return await competenciaService.api.post(`competencias/${id}/close_competition/`);
    },
    onSuccess: () => {
      // ¡Magia! Refresca la lista automáticamente sin recargar página
      queryClient.invalidateQueries(['competencias']);
      alert("Competencia finalizada correctamente.");
    },
    onError: () => {
      alert("Error al cerrar la competencia. Verifica tu conexión.");
    }
  });

  const handleClose = (id, name) => {
    if(window.confirm(`¿Estás seguro de FINALIZAR la competencia "${name}"?\n\nEsto congelará los puntajes y habilitará los Rankings Oficiales.`)) {
        closeMutation.mutate(id);
    }
  };

  // Filtrado en cliente
  const filtered = competencias.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Gestión de Competencias</h2>
        <Link to="/admin/competencias/crear" className="btn btn-primary rounded-pill px-4 shadow-sm">
            <FaPlus className="me-2"/> Nueva Competencia
        </Link>
      </div>

      {/* Buscador */}
      <div className="card mb-4 p-3 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="input-group border-0 bg-light rounded-pill overflow-hidden">
              <span className="input-group-text border-0 bg-transparent ps-3"><FaSearch className="text-muted"/></span>
              <input 
                type="text" 
                className="form-control border-0 bg-transparent" 
                placeholder="Buscar competencia..." 
                value={filter} 
                onChange={e => setFilter(e.target.value)}
              />
          </div>
      </div>

      <div className="row">
          {filtered.map(comp => (
              <div key={comp.id} className="col-md-6 col-xl-4 mb-4">
                  <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${comp.status === 'Finalizada' ? 'opacity-75' : ''}`}>
                      {/* Header con color dinámico */}
                      <div className={`card-header border-0 py-3 px-4 d-flex justify-content-between align-items-center 
                          ${comp.status === 'Próxima' ? 'bg-primary text-white' : 
                            comp.status === 'En Progreso' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                          <span className="fw-bold small text-uppercase letter-spacing-1">{comp.type}</span>
                          <span className="badge bg-white text-dark bg-opacity-75 rounded-pill">{comp.status}</span>
                      </div>

                      <div className="card-body p-4">
                          <h5 className="fw-bold text-dark mb-2">{comp.name}</h5>
                          <div className="text-muted small mb-3">
                              <FaCalendarAlt className="me-2"/> {comp.start_date} al {comp.end_date}
                          </div>
                          
                          <hr className="opacity-10"/>
                          
                          <div className="d-flex justify-content-between align-items-center mt-3">
                              {comp.status !== 'Finalizada' ? (
                                  <div className="d-flex gap-2 w-100">
                                      {/* Usamos 'grow' en lugar de 'flex-grow-1' para ser modernos */}
                                      <button className="btn btn-outline-secondary btn-sm rounded-pill grow" title="Editar">
                                          <FaEdit/> Editar
                                      </button>
                                      <button 
                                        className="btn btn-danger btn-sm rounded-pill grow fw-bold" 
                                        onClick={() => handleClose(comp.id, comp.name)}
                                        disabled={closeMutation.isPending}
                                      >
                                          {closeMutation.isPending ? <FaSpinner className="spinner-border-sm"/> : <><FaLock className="me-1"/> Cerrar</>}
                                      </button>
                                  </div>
                              ) : (
                                  <div className="text-center w-100 text-success fw-bold small">
                                      <FaCheckCircle className="me-1"/> Resultados Oficiales
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-12 text-center p-5 text-muted">
              No se encontraron competencias que coincidan con tu búsqueda.
            </div>
          )}
      </div>
    </div>
  );
};

export default ManageCompetitions;