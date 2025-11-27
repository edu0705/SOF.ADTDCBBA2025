import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deportistaService from '../services/deportistaService';
import { FaUserPlus, FaSearch, FaEye, FaUser, FaIdCard, FaFilter } from 'react-icons/fa';

const ManageDeportistas = () => {
  const [deportistas, setDeportistas] = useState([]);
  const [filteredDeportistas, setFilteredDeportistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');

  useEffect(() => {
    const fetchDeportistas = async () => {
      try {
        // Asumimos que el servicio tiene un método para listar (ajusta si se llama diferente, ej: getDeportistas)
        const res = await deportistaService.getDeportistas(); 
        setDeportistas(res.data.results || res.data);
      } catch (error) {
        console.error("Error cargando deportistas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeportistas();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let temp = deportistas;

      // Filtro por Texto
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        temp = temp.filter(d => 
          (d.first_name && d.first_name.toLowerCase().includes(lowerTerm)) ||
          (d.apellido_paterno && d.apellido_paterno.toLowerCase().includes(lowerTerm)) ||
          (d.ci && d.ci.includes(searchTerm))
        );
      }

      // Filtro por Estado
      if (filterStatus !== 'TODOS') {
        temp = temp.filter(d => d.status === filterStatus);
      }

      setFilteredDeportistas(temp);
    };

    filterData();
  }, [searchTerm, filterStatus, deportistas]);

  // --- RENDERIZADO ---

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
            <h2 className="fw-bold text-primary mb-0">Directorio de Deportistas</h2>
            <p className="text-muted small mb-0">Gestión del padrón oficial de tiradores.</p>
        </div>
        <Link to="/register-deportista" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm hover-lift fw-bold d-flex align-items-center justify-content-center">
            <FaUserPlus className="me-2"/> Registrar Nuevo
        </Link>
      </div>

      {/* BARRA DE HERRAMIENTAS (BUSCADOR Y FILTROS) */}
      <div className="card-modern border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
            <div className="col-md-6">
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                    <input 
                        type="text" 
                        className="form-control border-start-0 bg-light shadow-none" 
                        placeholder="Buscar por Nombre, Apellido o CI..." 
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
                        <option value="TODOS">Todos</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="SUSPENDIDO">Suspendidos</option>
                    </select>
                </div>
            </div>
            <div className="col-md-2 text-end text-muted small">
                <strong>{filteredDeportistas.length}</strong> registros
            </div>
        </div>
      </div>

      {/* LISTADO (TABLA MODERNA) */}
      <div className="card-modern border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light text-secondary text-uppercase small">
                    <tr>
                        <th className="ps-4 py-3 border-0">Deportista</th>
                        <th className="py-3 border-0">Identificación</th>
                        <th className="py-3 border-0">Club</th>
                        <th className="py-3 border-0">Categoría</th>
                        <th className="py-3 border-0 text-center">Estado</th>
                        <th className="pe-4 py-3 border-0 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDeportistas.length > 0 ? (
                        filteredDeportistas.map(d => (
                            <tr key={d.id} className="transition-colors">
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3 text-primary fw-bold overflow-hidden" style={{width: '40px', height: '40px'}}>
                                            {d.foto ? <img src={d.foto} alt="" className="w-100 h-100 object-fit-cover"/> : (d.first_name?.[0] || <FaUser/>)}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{d.first_name} {d.apellido_paterno}</div>
                                            <div className="small text-muted">{d.apellido_materno}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center text-dark">
                                        <FaIdCard className="text-muted me-2"/> {d.ci}
                                    </div>
                                </td>
                                <td>
                                    <span className="badge bg-light text-dark border border-light-subtle">{d.club_nombre || d.club?.name || 'Sin Club'}</span>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill ${d.tipo_modalidad === 'FUEGO' ? 'bg-danger bg-opacity-10 text-danger' : d.tipo_modalidad === 'AIRE' ? 'bg-info bg-opacity-10 text-info' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                        {d.tipo_modalidad || 'N/A'}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill border ${
                                        d.status === 'ACTIVO' ? 'bg-success-subtle text-success border-success-subtle' : 
                                        d.status === 'PENDIENTE' ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 
                                        'bg-danger-subtle text-danger border-danger-subtle'
                                    }`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="pe-4 text-end">
                                    <Link to={`/deportistas/${d.id}`} className="btn btn-sm btn-light text-primary hover-scale shadow-sm rounded-circle p-2" title="Ver Perfil">
                                        <FaEye size={16}/>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                                <div className="opacity-50 mb-2"><FaSearch size={30}/></div>
                                <p className="mb-0">No se encontraron deportistas con ese criterio.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default ManageDeportistas;