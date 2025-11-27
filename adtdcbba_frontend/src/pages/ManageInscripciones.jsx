import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import inscripcionService from '../services/inscripcionService'; // Asegúrate de tener este servicio o usar api.js
import competenciaService from '../services/competenciaService';
import { 
  FaUserPlus, FaSearch, FaFilter, FaPrint, FaCheckCircle, FaTimesCircle, FaClock, FaMoneyBillWave 
} from 'react-icons/fa';

const ManageInscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompetencia, setFilterCompetencia] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resIns, resComp] = await Promise.all([
          inscripcionService.getAll(), // Ajusta según tu servicio real
          competenciaService.getCompetencias()
        ]);
        
        setInscripciones(resIns.data.results || resIns.data);
        setCompetencias(resComp.data.results || resComp.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Lógica de Filtrado ---
  useEffect(() => {
    let temp = inscripciones;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(i => 
        i.deportista_nombre.toLowerCase().includes(term) ||
        i.club_nombre.toLowerCase().includes(term)
      );
    }

    if (filterCompetencia) {
      temp = temp.filter(i => i.competencia.toString() === filterCompetencia);
    }

    if (filterEstado !== 'TODOS') {
      temp = temp.filter(i => i.estado === filterEstado);
    }

    setFilteredData(temp);
  }, [inscripciones, searchTerm, filterCompetencia, filterEstado]);

  // --- Acciones ---
  const handlePrintReceipt = async (id) => {
    try {
      // Asumiendo que el backend devuelve un blob PDF
      await inscripcionService.printReceipt(id);
    } catch (error) {
      console.error("Error imprimiendo recibo:", error);
      alert("No se pudo generar el recibo.");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div>
    </div>
  );

  return (
    <div className="container-fluid py-4 fade-in">
      
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
            <h2 className="fw-bold text-primary mb-0">Gestión de Inscripciones</h2>
            <p className="text-muted small mb-0">Control de participantes y estado de pagos.</p>
        </div>
        <Link to="/register-inscripcion" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm hover-lift fw-bold d-flex align-items-center justify-content-center">
            <FaUserPlus className="me-2"/> Nueva Inscripción
        </Link>
      </div>

      {/* FILTROS */}
      <div className="card-modern border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3">
            <div className="col-md-4">
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                    <input 
                        className="form-control border-start-0 bg-light shadow-none" 
                        placeholder="Buscar deportista..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-4">
                <select className="form-select shadow-none" value={filterCompetencia} onChange={e => setFilterCompetencia(e.target.value)}>
                    <option value="">Todas las Competencias</option>
                    {competencias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="col-md-4">
                <div className="input-group">
                    <span className="input-group-text bg-white fw-bold text-secondary"><FaFilter className="me-2"/> Estado:</span>
                    <select className="form-select shadow-none" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="TODOS">Todos</option>
                        <option value="PENDIENTE">Pendientes de Pago</option>
                        <option value="APROBADA">Aprobadas</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* TABLA MODERNA */}
      <div className="card-modern border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light text-secondary text-uppercase small">
                    <tr>
                        <th className="ps-4 border-0">Deportista</th>
                        <th className="border-0">Competencia</th>
                        <th className="border-0 text-center">Estado</th>
                        <th className="border-0 text-end">Monto</th>
                        <th className="pe-4 border-0 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(ins => (
                        <tr key={ins.id}>
                            <td className="ps-4 fw-bold text-dark">
                                {ins.deportista_nombre}
                                <div className="small text-muted fw-normal">{ins.club_nombre}</div>
                            </td>
                            <td>
                                {ins.competencia_nombre}
                                <div className="small text-muted">{new Date(ins.fecha_inscripcion).toLocaleDateString()}</div>
                            </td>
                            <td className="text-center">
                                {ins.estado === 'APROBADA' && <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill"><FaCheckCircle className="me-1"/> Aprobada</span>}
                                {ins.estado === 'PENDIENTE' && <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill"><FaClock className="me-1"/> Pendiente</span>}
                                {ins.estado === 'RECHAZADA' && <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill"><FaTimesCircle className="me-1"/> Rechazada</span>}
                            </td>
                            <td className="text-end fw-bold text-dark">
                                {ins.monto_pagado} Bs
                                {parseFloat(ins.monto_pagado) < parseFloat(ins.costo_inscripcion) && (
                                    <div className="small text-danger" title="Deuda pendiente">Debe: {ins.costo_inscripcion - ins.monto_pagado}</div>
                                )}
                            </td>
                            <td className="pe-4 text-end">
                                <button 
                                    onClick={() => handlePrintReceipt(ins.id)} 
                                    className="btn btn-sm btn-outline-secondary rounded-pill hover-scale"
                                    title="Imprimir Recibo"
                                >
                                    <FaPrint/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">No se encontraron inscripciones.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInscripciones;