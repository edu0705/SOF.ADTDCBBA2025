import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deportistaService from '../services/deportistaService';
import competenciaService from '../services/competenciaService';
import { useAuth } from '../context/AuthContext';
import {
  FaUser, FaFilePdf, FaCrosshairs, FaCheckCircle, FaUpload,
  FaArrowLeft, FaTrash, FaCalendarCheck, FaImage, FaHandshake, FaSearch, FaPrint, FaKey,
  FaExclamationTriangle
} from 'react-icons/fa';

const DeportistaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deportista, setDeportista] = useState(null);
  const [activeTab, setActiveTab] = useState('docs');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // --- Estados de Formularios ---
  const [newDoc, setNewDoc] = useState({ type: 'Licencia B', file: null, expiry: '' });
  const [newArma, setNewArma] = useState({ tipo: 'Corta', marca: '', modelo: '', calibre: '', matricula: '', fecha_inspeccion: '', foto: null });

  // --- Estados de Préstamo ---
  const [competencias, setCompetencias] = useState([]);
  const [loanData, setLoanData] = useState({ arma_id: '', competencia_id: '', arma_detalle: '' });

  // --- Estados Buscador Modal ---
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Carga inicial de datos
  const fetchDetails = useCallback(async () => {
    try {
      const res = await deportistaService.getDeportistaById(id);
      setDeportista(res.data);
    } catch (err) {
      console.error("Error cargando deportista:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
    const loadComps = async () => {
      try {
        const res = await competenciaService.getCompetencias();
        // Filtramos competencias activas para el select
        const active = (res.data.results || res.data).filter(c => c.status !== 'Finalizada');
        setCompetencias(active);
      } catch (e) {
        console.error("Error cargando competencias:", e);
      }
    };
    loadComps();
  }, [fetchDetails]);

  // --- ACCIONES DEL PERFIL ---

  const handleActivate = async () => {
    if (window.confirm("¿Confirmas que la documentación está completa? Esto generará el usuario y contraseña del deportista.")) {
      try {
        // Endpoint de aprobación en backend
        const res = await deportistaService.api.post(`deportistas/${id}/approve/`);
        alert(`✅ DEPORTISTA ACTIVADO\n\nUsuario: ${res.data.username}\nContraseña: ${res.data.password}\n\n¡Entregue estos datos al deportista!`);
        fetchDetails();
      } catch (err) {
        console.error(err);
        alert("Error al activar deportista. Verifique los datos.");
      }
    }
  };

  // --- GESTIÓN DE ARMAS ---

  const handleDeleteArma = async (armaId) => {
    if (window.confirm("¿Eliminar esta arma del registro permanentemente?")) {
      try {
        await deportistaService.deleteArma(armaId);
        fetchDetails();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el arma.");
      }
    }
  };

  const handleArmaSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('deportista', id);
    formData.append('tipo', newArma.tipo);
    formData.append('marca', newArma.marca);
    formData.append('modelo', newArma.modelo);
    formData.append('calibre', newArma.calibre);
    // Corrección: nombre del campo debe coincidir con Django Model ('matricula')
    formData.append('matricula', newArma.matricula); 
    
    if (newArma.fecha_inspeccion) formData.append('fecha_inspeccion', newArma.fecha_inspeccion);
    // Corrección: nombre del campo para archivo ('foto' o 'file' según backend, asumo 'foto' si existe en Arma, si no se ignora)
    if (newArma.foto) formData.append('foto', newArma.foto);

    try {
      await deportistaService.registerArma(formData);
      alert("Arma registrada correctamente.");
      setNewArma({ tipo: 'Corta', marca: '', modelo: '', calibre: '', matricula: '', fecha_inspeccion: '', foto: null });
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert("Error al registrar arma. Verifique los campos.");
    } finally {
      setUploading(false);
    }
  };

  // --- GESTIÓN DE DOCUMENTOS ---

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!newDoc.file) return alert("Seleccione un archivo PDF o imagen.");
    setUploading(true);
    
    const formData = new FormData();
    formData.append('deportista', id);
    formData.append('document_type', newDoc.type);
    // Corrección: Django espera 'file' en DocumentoDeportista
    formData.append('file', newDoc.file); 
    if (newDoc.expiry) formData.append('expiration_date', newDoc.expiry);

    try {
      await deportistaService.uploadDocument(formData);
      alert("Documento subido correctamente.");
      setNewDoc({ ...newDoc, file: null, expiry: '' });
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert("Error al subir documento.");
    } finally {
      setUploading(false);
    }
  };

  // --- GESTIÓN DE PRÉSTAMOS ---

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    try {
      const res = await deportistaService.searchArmas(searchTerm);
      setSearchResults(res.data.results || res.data);
    } catch (err) {
      console.error("Error buscando armas:", err);
    }
  };

  const selectArma = (arma) => {
    setLoanData({
      ...loanData,
      arma_id: arma.id,
      arma_detalle: `${arma.marca} ${arma.modelo} (${arma.calibre}) - Prop: ${arma.deportista ? arma.deportista.first_name : 'S/D'}`
    });
    setShowSearch(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleCreateLoan = async () => {
    if (!loanData.arma_id || !loanData.competencia_id) return alert("Seleccione un arma y una competencia.");
    setUploading(true);
    try {
      const res = await deportistaService.createLoan({
        arma: loanData.arma_id,
        deportista_receptor: id,
        competencia: loanData.competencia_id
      });
      if (window.confirm("Préstamo registrado. ¿Desea imprimir el informe ahora?")) {
        deportistaService.downloadLoanReport(res.data.id);
      }
      setLoanData({ arma_id: '', competencia_id: '', arma_detalle: '' });
    } catch (err) {
      console.error(err);
      alert("Error al registrar préstamo: " + (err.response?.data?.detail || "Verifique los datos."));
    } finally {
      setUploading(false);
    }
  };

  // --- RENDERIZADO ---

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (!deportista) return (
    <div className="container py-5 text-center">
      <div className="alert alert-warning d-inline-block shadow-sm">
        <FaExclamationTriangle className="me-2"/> Deportista no encontrado o no tienes permisos.
      </div>
      <div className="mt-3">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">Volver</button>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4 position-relative fade-in">
      
      {/* --- MODAL BUSCADOR (Overlay con Backdrop Blur) --- */}
      {showSearch && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-4 p-4 shadow-lg w-100 animate-pop-in" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <h5 className="fw-bold m-0 text-primary"><FaSearch className="me-2"/> Buscar Arma Disponible</h5>
              <button className="btn-close" onClick={() => setShowSearch(false)}></button>
            </div>
            <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
              <input 
                autoFocus 
                type="text" 
                className="form-control shadow-none border-primary" 
                placeholder="Marca, Modelo o Matrícula..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <button type="submit" className="btn btn-primary px-4"><FaSearch /></button>
            </form>
            <div className="list-group overflow-auto custom-scrollbar" style={{ maxHeight: '300px' }}>
              {searchResults.map(arma => (
                <button key={arma.id} className="list-group-item list-group-item-action border-0 border-bottom" onClick={() => selectArma(arma)}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{arma.marca} {arma.modelo}</strong>
                      <div className="small text-muted mt-1">Mat: {arma.matricula || arma.numero_matricula}</div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-secondary rounded-pill mb-1">{arma.calibre}</span>
                      <div className="small text-muted">Prop: {arma.deportista ? arma.deportista.first_name : 'S/D'}</div>
                    </div>
                  </div>
                </button>
              ))}
              {searchResults.length === 0 && searchTerm && <div className="text-center p-4 text-muted">Sin resultados encontrados.</div>}
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER Y NAVEGACIÓN --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light text-muted fw-bold shadow-sm hover-scale">
          <FaArrowLeft className="me-2" /> Volver
        </button>

        {deportista.status !== 'ACTIVO' ? (
          <button onClick={handleActivate} className="btn btn-success rounded-pill px-4 shadow-lg fw-bold animate-pulse hover-lift">
            <FaCheckCircle className="me-2" /> Aprobar y Activar
          </button>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success px-4 py-2 rounded-pill fs-6 shadow-sm d-flex align-items-center">
              <FaCheckCircle className="me-2"/> Activo
            </span>
            {(user?.role === 'admin' || user?.is_superuser) && (
              <button onClick={handleActivate} className="btn btn-sm btn-warning rounded-circle shadow-sm text-white hover-rotate" title="Regenerar Acceso">
                <FaKey />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* --- TARJETA DE PERFIL (IZQUIERDA) --- */}
        <div className="col-lg-4 mb-4">
          <div className="card-modern text-center p-4 h-100 border-0 shadow-hover position-relative overflow-hidden">
            <div className="position-absolute top-0 start-0 w-100 h-25 bg-primary opacity-10"></div>
            
            <div className="position-relative">
              <div className="mx-auto bg-white p-1 rounded-circle shadow-lg mb-3" style={{ width: '130px', height: '130px' }}>
                <div className="w-100 h-100 rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center">
                  {deportista.foto ? (
                    <img src={deportista.foto} className="w-100 h-100 object-fit-cover" alt="Perfil" />
                  ) : (
                    <FaUser size={60} className="text-secondary opacity-50" />
                  )}
                </div>
              </div>
              
              <h3 className="fw-bold text-dark mb-1">{deportista.first_name} {deportista.apellido_paterno}</h3>
              <p className="text-muted mb-3"><span className="badge bg-light text-dark border">{deportista.club?.name || deportista.club_nombre || 'Sin Club'}</span></p>

              <div className="card bg-light border-0 p-3 text-start rounded-3 mt-4">
                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>Cédula</small> 
                    <span className="fw-bold text-dark">{deportista.ci}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>Estado</small> 
                    <span className={`badge ${deportista.status === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>{deportista.status}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>Categoría</small> 
                    <span className="fw-bold text-dark">{deportista.tipo_modalidad}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>Vencimiento</small> 
                    <span className={`fw-bold ${!deportista.vencimiento_credencial ? 'text-danger' : ''}`}>
                      {deportista.vencimiento_credencial || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- PESTAÑAS DE GESTIÓN (DERECHA) --- */}
        <div className="col-lg-8">
          <div className="card-modern h-100 border-0 overflow-hidden shadow-sm">
            <div className="card-header bg-white border-bottom px-4 pt-3 pb-0">
              <ul className="nav nav-tabs card-header-tabs border-0 gap-3">
                {['docs', 'armas', 'prestamos'].map(tab => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link border-0 bg-transparent py-3 px-1 transition-all ${activeTab === tab ? 'active border-bottom border-3 border-primary fw-bold text-primary' : 'text-muted hover-text-primary'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'docs' && <><FaFilePdf className="me-2" /> Documentos</>}
                      {tab === 'armas' && <><FaCrosshairs className="me-2" /> Armas</>}
                      {tab === 'prestamos' && <><FaHandshake className="me-2" /> Préstamos</>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-4 bg-light bg-opacity-10">
              
              {/* --- PESTAÑA 1: DOCUMENTOS --- */}
              {activeTab === 'docs' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0 text-secondary">Documentos Digitales</h6>
                    <span className="badge bg-primary rounded-pill">{deportista.documentos?.length || 0}</span>
                  </div>
                  
                  <div className="list-group mb-4 shadow-sm border-0 rounded-3 overflow-hidden">
                    {deportista.documentos?.map(doc => (
                      <div key={doc.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 border-bottom p-3 hover-bg-light">
                        <div className="d-flex align-items-center">
                            <div className="bg-danger bg-opacity-10 text-danger p-2 rounded me-3">
                                <FaFilePdf size={20}/>
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">{doc.document_type}</h6>
                                {doc.expiration_date && <span className="text-muted small"><FaCalendarCheck className="me-1"/>Vence: {doc.expiration_date}</span>}
                            </div>
                        </div>
                        <a href={doc.file} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3 hover-lift">Ver</a>
                      </div>
                    ))}
                    {(!deportista.documentos || deportista.documentos.length === 0) && 
                        <div className="p-5 text-center text-muted bg-white">
                            <FaFilePdf size={40} className="mb-2 opacity-25"/><p>No hay documentos cargados.</p>
                        </div>
                    }
                  </div>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <h6 className="text-primary fw-bold mb-3 d-flex align-items-center"><FaUpload className="me-2"/> Cargar Nuevo Documento</h6>
                        <form onSubmit={handleDocUpload}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <label className="small text-muted fw-bold mb-1">Tipo</label>
                                <select className="form-select form-select-sm shadow-none" onChange={e => setNewDoc({ ...newDoc, type: e.target.value })} value={newDoc.type}>
                                    <option>Licencia B</option>
                                    <option>CI</option>
                                    <option>Responsabilidad</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="small text-muted fw-bold mb-1">Vencimiento</label>
                                <input type="date" className="form-control form-control-sm shadow-none" onChange={e => setNewDoc({ ...newDoc, expiry: e.target.value })} value={newDoc.expiry} />
                            </div>
                            <div className="col-md-4">
                                <label className="small text-muted fw-bold mb-1">Archivo</label>
                                <input type="file" className="form-control form-control-sm shadow-none" onChange={e => setNewDoc({ ...newDoc, file: e.target.files[0] })} />
                            </div>
                            <div className="col-md-2">
                                <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold shadow-sm hover-lift" disabled={uploading}>
                                    {uploading ? <span className="spinner-border spinner-border-sm"></span> : 'Subir'}
                                </button>
                            </div>
                        </div>
                        </form>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PESTAÑA 2: ARMAS --- */}
              {activeTab === 'armas' && (
                <div className="fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0 text-secondary">Parque de Armas</h6>
                    <span className="badge bg-success rounded-pill">{deportista.armas?.length || 0}</span>
                  </div>

                  <div className="row g-3 mb-4">
                    {deportista.armas?.map(arma => (
                      <div key={arma.id} className="col-md-6">
                          <div className="card h-100 border-0 shadow-sm hover-shadow-md transition-all">
                            <div className="card-body d-flex justify-content-between align-items-center p-3">
                                <div>
                                <div className="fw-bold text-dark">{arma.marca} {arma.modelo}</div>
                                <div className="small text-muted text-uppercase badge bg-light text-dark border mt-1 mb-1">{arma.tipo} • {arma.calibre}</div>
                                <div className="small text-dark"><span className="fw-bold text-secondary">Mat:</span> {arma.matricula || arma.numero_matricula}</div>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                {arma.foto && <a href={arma.foto} target="_blank" rel="noreferrer" className="btn btn-sm btn-light text-primary rounded-circle" title="Ver Foto"><FaImage /></a>}
                                <button onClick={() => handleDeleteArma(arma.id)} className="btn btn-sm btn-light text-danger rounded-circle" title="Eliminar"><FaTrash /></button>
                                </div>
                            </div>
                            {arma.fecha_inspeccion && <div className="card-footer bg-success bg-opacity-10 border-0 py-1 px-3 small text-success fw-bold"><FaCheckCircle className="me-1"/> Insp: {arma.fecha_inspeccion}</div>}
                          </div>
                      </div>
                    ))}
                    {(!deportista.armas || deportista.armas.length === 0) && <div className="col-12"><div className="p-4 text-muted text-center bg-white rounded border border-dashed">No tiene armas registradas.</div></div>}
                  </div>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <h6 className="text-success fw-bold mb-3 d-flex align-items-center"><FaCrosshairs className="me-2"/> Registrar Nueva Arma</h6>
                        <form onSubmit={handleArmaSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm" placeholder="Marca" value={newArma.marca} onChange={e => setNewArma({ ...newArma, marca: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm" placeholder="Modelo" value={newArma.modelo} onChange={e => setNewArma({ ...newArma, modelo: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm" placeholder="Calibre" value={newArma.calibre} onChange={e => setNewArma({ ...newArma, calibre: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <select className="form-select form-select-sm" value={newArma.tipo} onChange={e => setNewArma({ ...newArma, tipo: e.target.value })}>
                                        <option value="Corta">Corta</option>
                                        <option value="Larga">Larga</option>
                                        <option value="Escopeta">Escopeta</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm" placeholder="Matrícula" value={newArma.matricula} onChange={e => setNewArma({ ...newArma, matricula: e.target.value })} required />
                                </div>
                                <div className="col-md-4">
                                    <input className="form-control form-control-sm" type="date" placeholder="Inspección" value={newArma.fecha_inspeccion} onChange={e => setNewArma({ ...newArma, fecha_inspeccion: e.target.value })} />
                                </div>
                                <div className="col-12 mt-3">
                                    <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm hover-lift" disabled={uploading}>
                                        {uploading ? 'Guardando...' : 'Guardar Arma'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PESTAÑA 3: PRÉSTAMOS --- */}
              {activeTab === 'prestamos' && (
                <div className="fade-in h-100 d-flex align-items-center justify-content-center">
                  <div className="card bg-white p-5 rounded-4 shadow-sm border-0 text-center w-100" style={{maxWidth: '500px'}}>
                    <div className="mb-3 text-primary opacity-75 mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{width:'80px', height:'80px'}}>
                        <FaHandshake size={40} />
                    </div>
                    <h5 className="fw-bold mb-2">Solicitud de Préstamo</h5>
                    <p className="text-muted small mb-4">Genere el formulario oficial para préstamo de arma en competencia.</p>
                    
                    <div className="text-start">
                        <label className="small text-muted fw-bold mb-1">1. Seleccione Competencia</label>
                        <select className="form-select mb-3 shadow-none" value={loanData.competencia_id} onChange={e => setLoanData({ ...loanData, competencia_id: e.target.value })}>
                            <option value="">-- Seleccionar --</option>
                            {competencias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        
                        <label className="small text-muted fw-bold mb-1">2. Seleccione Arma</label>
                        <div className="input-group mb-4">
                            <input type="text" className="form-control bg-light" readOnly value={loanData.arma_detalle || ''} placeholder="Ninguna seleccionada..." />
                            <button className="btn btn-outline-primary" type="button" onClick={() => setShowSearch(true)}><FaSearch /></button>
                        </div>

                        <button className="btn btn-primary w-100 rounded-pill fw-bold py-2 hover-lift shadow-sm" onClick={handleCreateLoan} disabled={uploading || !loanData.arma_id}>
                            <FaPrint className="me-2" /> Generar Informe
                        </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeportistaDetail;