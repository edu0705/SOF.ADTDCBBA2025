import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import competenciaService from '../services/competenciaService';
import { 
  FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash 
} from 'react-icons/fa';

const ManageCompetitions = () => {
  const [competencias, setCompetencias] = useState([]);
  const [filteredCompetencias, setFilteredCompetencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  // --- Carga de Datos ---
  useEffect(() => {
    const fetchCompetencias = async () => {
      try {
        const res = await competenciaService.getCompetencias();
        // Ajuste para DRF (results si hay paginación, data si no)
        setCompetencias(res.data.results || res.data);
      } catch (error) {
        console.error("Error al cargar competencias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetencias();
  }, []);

  // --- Filtros en Tiempo Real ---
  useEffect(() => {
    const filterData = () => {
      let temp = competencias;

      // Filtro Texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        temp = temp.filter(c => 
          c.name.toLowerCase().includes(term) || 
          (c.poligono_nombre && c.poligono_nombre.toLowerCase().includes(term))
        );
      }

      // Filtro Estado
      if (filterStatus !== 'TODOS') {
        temp = temp.filter(c => c.status === filterStatus);
      }

      setFilteredCompetencias(temp);
    };
    filterData();
  }, [competencias, searchTerm, filterStatus]);

  // --- Acciones ---
  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta competencia? Esta acción no se puede deshacer.")) {
      try {
        await competenciaService.deleteCompetencia(id);
        setCompetencias(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        // CORRECCIÓN: Usamos la variable 'error' para loguear el problema real
        console.error("Error eliminando competencia:", error);
        alert("Error al eliminar. Verifique que no tenga inscripciones activas.");
      }
    }
  };

  // --- Renderizado ---
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}></div>
    </div>
  );

  return (
    <div className="container-fluid py-4 fade-in">
      
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-primary mb-0">Gestión de Competencias</h2>
          <p className="text-muted small mb-0">Administre los eventos, calendarios y resultados.</p>
        </div>
        <Link to="/create-competencia" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm hover-lift fw-bold d-flex align-items-center justify-content-center">
          <FaPlus className="me-2"/> Nueva Competencia
        </Link>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="card-modern border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
              <input 
                type="text" 
                className="form-control border-start-0 bg-light shadow-none" 
                placeholder="Buscar competencia..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 fw-bold text-secondary"><FaFilter className="me-2"/> Estado:</span>
              <select 
                className="form-select border-start-0 shadow-none" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="TODOS">Todas</option>
                <option value="Próxima">Próximas</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Finalizada">Finalizadas</option>
              </select>
            </div>
          </div>
          <div className="col-md-2 text-end text-muted small">
            <strong>{filteredCompetencias.length}</strong> eventos
          </div>
        </div>
      </div>

      {/* GRID DE TARJETAS (Mejor que tabla para eventos) */}
      <div className="row g-4">
        {filteredCompetencias.length > 0 ? (
          filteredCompetencias.map(comp => (
            <div key={comp.id} className="col-md-6 col-lg-4">
              <div className="card-modern h-100 border-0 shadow-sm hover-shadow-md transition-all position-relative overflow-hidden">
                {/* Indicador Visual de Estado */}
                <div className={`position-absolute top-0 start-0 w-1 h-100 ${
                  comp.status === 'En Progreso' ? 'bg-success' : 
                  comp.status === 'Finalizada' ? 'bg-secondary' : 'bg-warning'
                }`}></div>

                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge rounded-pill px-3 py-1 border ${
                      comp.status === 'En Progreso' ? 'bg-success-subtle text-success border-success-subtle' : 
                      comp.status === 'Finalizada' ? 'bg-secondary-subtle text-secondary border-secondary-subtle' : 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
                    }`}>
                      {comp.status}
                    </span>
                    <small className="text-muted fw-bold">{comp.type}</small>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 text-truncate" title={comp.name}>
                    <FaTrophy className="text-warning me-2"/> {comp.name}
                  </h5>
                  
                  <div className="text-muted small mb-3">
                    <div className="d-flex align-items-center mb-1">
                      <FaCalendarAlt className="me-2 text-primary opacity-50"/> 
                      {comp.start_date} al {comp.end_date}
                    </div>
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-danger opacity-50"/> 
                      {comp.poligono_nombre || 'Polígono no asignado'}
                    </div>
                  </div>

                  <hr className="border-light"/>

                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/competencias/${comp.id}/results`} className="btn btn-sm btn-outline-primary rounded-pill px-3 hover-lift">
                      <FaEye className="me-1"/> Resultados
                    </Link>
                    <div className="btn-group">
                      <Link to={`/competencias/edit/${comp.id}`} className="btn btn-sm btn-light text-secondary rounded-start hover-bg-light" title="Editar">
                        <FaEdit/>
                      </Link>
                      <button onClick={() => handleDelete(comp.id)} className="btn btn-sm btn-light text-danger rounded-end hover-bg-light" title="Eliminar">
                        <FaTrash/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="opacity-25 mb-3"><FaTrophy size={50}/></div>
            <h5 className="text-muted">No se encontraron competencias.</h5>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageCompetitions;