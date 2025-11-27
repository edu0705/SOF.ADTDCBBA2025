import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api'; // Usamos tu cliente axios configurado
// Se eliminó el import de useAuth porque no se estaba usando

const SystemReports = () => {
  // Se eliminó const { user } = useAuth(); para corregir el linter
  const [activeTab, setActiveTab] = useState('poligono'); // poligono | reafuc_arma | reafuc_dep | trimestral
  
  // Filtros de estado
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [matriculaQuery, setMatriculaQuery] = useState('');

  // --- CONSULTAS API ---

  // 1. Reporte Polígono (Solo carga si el tab está activo)
  const { data: poligonoData, isLoading: loadingPoligono, error: errorPoligono } = useQuery({
    queryKey: ['report_poligono', year],
    queryFn: async () => {
      const res = await api.get(`/reports/poligono_stats/?year=${year}`);
      return res.data;
    },
    enabled: activeTab === 'poligono',
    retry: false
  });

  // 2. Reporte Trimestral
  const { data: quarterlyData, isLoading: loadingQuarterly, refetch: fetchQuarterly } = useQuery({
    queryKey: ['report_quarterly', year, quarter],
    queryFn: async () => {
      const res = await api.get(`/reports/trimestral/?year=${year}&quarter=${quarter}`);
      return res.data;
    },
    enabled: activeTab === 'trimestral',
  });

  // 3. Búsqueda REAFUC Arma (Manual)
  const [armaData, setArmaData] = useState(null);
  const [loadingArma, setLoadingArma] = useState(false);
  const [errorArma, setErrorArma] = useState(null);

  const handleSearchArma = async (e) => {
    e.preventDefault();
    setLoadingArma(true);
    setErrorArma(null);
    try {
        const res = await api.get(`/reports/reafuc_arma/?matricula=${matriculaQuery}`);
        setArmaData(res.data);
    } catch (err) {
        setArmaData(null);
        setErrorArma(err.response?.data?.detail || "Error al buscar arma.");
    } finally {
        setLoadingArma(false);
    }
  };

  // 4. Búsqueda REAFUC Deportista (Manual)
  const [depData, setDepData] = useState(null);
  const [loadingDep, setLoadingDep] = useState(false);
  const [errorDep, setErrorDep] = useState(null);

  const handleSearchDep = async (e) => {
    e.preventDefault();
    setLoadingDep(true);
    setErrorDep(null);
    try {
        const res = await api.get(`/reports/reafuc_deportista/?q=${searchQuery}`);
        setDepData(res.data);
    } catch (err) {
        setDepData(null);
        setErrorDep(err.response?.data?.detail || "Error al buscar deportista.");
    } finally {
        setLoadingDep(false);
    }
  };

  // --- RENDERIZADO ---

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Centro de Reportes e Inteligencia</h2>

      {/* Navegación de Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'poligono' ? 'active' : ''}`} 
            onClick={() => setActiveTab('poligono')}
          >
            🏢 Gestión de Polígono
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'trimestral' ? 'active' : ''}`} 
            onClick={() => setActiveTab('trimestral')}
          >
            📈 Balance Trimestral
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reafuc_arma' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reafuc_arma')}
          >
            🔫 Trazabilidad Arma (REAFUC)
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reafuc_dep' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reafuc_dep')}
          >
            👤 Kardex Deportista (REAFUC)
          </button>
        </li>
      </ul>

      <div className="tab-content p-3 border border-top-0 rounded-bottom bg-light">
        
        {/* --- TAB 1: POLÍGONO --- */}
        {activeTab === 'poligono' && (
          <div>
            <div className="d-flex align-items-center mb-4 gap-3">
                <label className="fw-bold">Año de Gestión:</label>
                <input 
                    type="number" 
                    className="form-control w-auto" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                />
            </div>

            {loadingPoligono && <div className="spinner-border text-primary" />}
            
            {errorPoligono && (
                <div className="alert alert-warning">
                    {errorPoligono.response?.status === 403 
                        ? "No tienes permisos de administrador de polígono." 
                        : "Error cargando datos."}
                </div>
            )}

            {poligonoData && (
                <>
                    <h4 className="text-primary">{poligonoData.poligono} - {poligonoData.anio}</h4>
                    <div className="row mt-3 text-center">
                        <div className="col-md-3">
                            <div className="card bg-white shadow-sm p-3">
                                <h3 className="text-success">{poligonoData.stats.total_competencias}</h3>
                                <small className="text-muted">Eventos Realizados</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white shadow-sm p-3">
                                <h3 className="text-info">{poligonoData.stats.total_inscritos}</h3>
                                <small className="text-muted">Tiradores Atendidos</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white shadow-sm p-3">
                                <h3 className="text-warning">{poligonoData.stats.armas_utilizadas}</h3>
                                <small className="text-muted">Armas en Línea</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-white shadow-sm p-3">
                                <h3 className="text-dark">{poligonoData.stats.ingresos_generados} Bs</h3>
                                <small className="text-muted">Ingresos Generados</small>
                            </div>
                        </div>
                    </div>

                    <h5 className="mt-4">Detalle de Actividades</h5>
                    <table className="table table-sm table-hover mt-2 bg-white">
                        <thead className="table-dark">
                            <tr><th>Fecha</th><th>Evento</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            {poligonoData.detalle_competencias.map(comp => (
                                <tr key={comp.id}>
                                    <td>{comp.start_date}</td>
                                    <td>{comp.name}</td>
                                    <td><span className="badge bg-secondary">{comp.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
          </div>
        )}

        {/* --- TAB 2: TRIMESTRAL --- */}
        {activeTab === 'trimestral' && (
          <div>
            <div className="d-flex gap-3 mb-4">
                <select className="form-select w-auto" value={year} onChange={(e) => setYear(e.target.value)}>
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="form-select w-auto" value={quarter} onChange={(e) => setQuarter(e.target.value)}>
                    <option value="1">Q1 (Ene-Mar)</option>
                    <option value="2">Q2 (Abr-Jun)</option>
                    <option value="3">Q3 (Jul-Sep)</option>
                    <option value="4">Q4 (Oct-Dic)</option>
                </select>
                <button className="btn btn-primary" onClick={() => fetchQuarterly()}>Actualizar</button>
            </div>

            {loadingQuarterly && <div className="spinner-border" />}
            
            {quarterlyData && (
                <div className="card p-4 border-0 shadow-sm">
                    <h4 className="text-center mb-4 text-uppercase">Balance Ejecutivo - {quarterlyData.periodo}</h4>
                    
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <ul className="list-group">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Competencias Ejecutadas
                                    <span className="badge bg-primary rounded-pill">{quarterlyData.competencias_realizadas}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Ingresos Brutos
                                    <span className="fw-bold text-success">+{quarterlyData.resumen_financiero.ingresos_brutos} Bs</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Gastos Operativos
                                    <span className="fw-bold text-danger">-{quarterlyData.resumen_financiero.gastos_registrados} Bs</span>
                                </li>
                                <li className="list-group-item list-group-item-secondary d-flex justify-content-between align-items-center fw-bold">
                                    BALANCE NETO
                                    <span>{quarterlyData.resumen_financiero.balance_neto} Bs</span>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-6">
                            {/* Aquí podrías poner un gráfico con Chart.js en el futuro */}
                            <div className="alert alert-info h-100">
                                <h5>Resumen de Actividad</h5>
                                <small>Eventos registrados en este periodo:</small>
                                <ul className="mt-2">
                                    {quarterlyData.actividad.map((a, i) => (
                                        <li key={i}>{a.name} ({a.type})</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* --- TAB 3: REAFUC ARMA --- */}
        {activeTab === 'reafuc_arma' && (
          <div>
            <form onSubmit={handleSearchArma} className="d-flex gap-2 mb-4">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ingrese Matrícula del Arma (ej: ABC-123)" 
                    value={matriculaQuery}
                    onChange={(e) => setMatriculaQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-dark" disabled={!matriculaQuery}>
                    🔍 Consultar Trazabilidad
                </button>
            </form>

            {loadingArma && <div className="spinner-border" />}
            {errorArma && <div className="alert alert-danger">{errorArma}</div>}

            {armaData && (
                <div className="border rounded p-3 bg-white">
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                        <div>
                            <h4 className="mb-0">{armaData.arma}</h4>
                            <small className="text-muted">Matrícula: {armaData.matricula}</small>
                        </div>
                        <div className="text-end">
                            <div className="badge bg-warning text-dark">Total Usos: {armaData.total_usos_registrados}</div>
                            <div className="small mt-1">Propietario: {armaData.propietario_actual}</div>
                        </div>
                    </div>

                    <table className="table table-striped">
                        <thead>
                            <tr><th>Fecha</th><th>Evento</th><th>Polígono</th><th>Usuario</th><th>Modalidad</th></tr>
                        </thead>
                        <tbody>
                            {armaData.historial.map((h, i) => (
                                <tr key={i}>
                                    <td>{h.fecha}</td>
                                    <td>{h.competencia}</td>
                                    <td>{h.poligono}</td>
                                    <td>{h.usuario_arma}</td>
                                    <td>{h.modalidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        )}

        {/* --- TAB 4: REAFUC DEPORTISTA --- */}
        {activeTab === 'reafuc_dep' && (
          <div>
            <form onSubmit={handleSearchDep} className="d-flex gap-2 mb-4">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Buscar por CI o Código Único" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-dark" disabled={!searchQuery}>
                    🔍 Consultar Kardex
                </button>
            </form>

            {loadingDep && <div className="spinner-border" />}
            {errorDep && <div className="alert alert-danger">{errorDep}</div>}

            {depData && (
                <div className="border rounded p-3 bg-white">
                    <div className="row mb-4">
                        <div className="col-md-2 text-center">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width: '80px', height: '80px'}}>
                                <span className="fs-1">👤</span>
                            </div>
                        </div>
                        <div className="col-md-10">
                            <h3>{depData.nombre}</h3>
                            <span className="badge bg-info text-dark me-2">CI: {depData.ci}</span>
                            <span className="badge bg-secondary me-2">{depData.club}</span>
                            <span className={`badge ${depData.status === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>{depData.status}</span>
                        </div>
                    </div>

                    <h5 className="border-bottom pb-2">Historial de Competencias</h5>
                    <table className="table table-hover">
                        <thead>
                            <tr><th>Fecha</th><th>Competencia</th><th>Modalidades</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            {depData.historial.map((h, i) => (
                                <tr key={i}>
                                    <td>{h.fecha}</td>
                                    <td>{h.competencia}</td>
                                    <td>{h.modalidades.join(", ")}</td>
                                    <td>{h.estado_inscripcion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemReports;