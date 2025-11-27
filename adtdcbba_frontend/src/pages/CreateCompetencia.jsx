import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import competenciaService from '../services/competenciaService';
import { FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaSave, FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';

const CreateCompetencia = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estados para selectores
  const [poligonos, setPoligonos] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    hora_competencia: '08:00',
    poligono: '',
    type: 'Departamental',
    status: 'Próxima',
    costo_inscripcion_base: '0',
    costo_limite_global: '',
    numero_convocatoria: '',
    categorias: [], 
    jueces: [] 
  });

  useEffect(() => {
    const loadAuxData = async () => {
      try {
        // Mockup temporal (Aquí conectarías con tu API de polígonos)
        setPoligonos([{id: 1, name: 'Polígono Santiváñez'}, {id: 2, name: 'Polígono Escuela Naval'}]);
      } catch (err) {
        console.error("Error cargando datos auxiliares", err);
      }
    };
    loadAuxData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await competenciaService.createCompetencia(formData);
      alert("✅ Competencia creada exitosamente.");
      navigate('/competencias');
    } catch (err) {
      console.error(err);
      alert("Error al crear competencia. Revise los campos obligatorios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* HEADER */}
          <div className="d-flex align-items-center mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm me-3 hover-scale">
                <FaArrowLeft className="text-muted"/>
            </button>
            <div>
                <h2 className="fw-bold text-primary mb-0">Nueva Competencia</h2>
                <p className="text-muted small mb-0">Configure los parámetros del evento oficial.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
                
                {/* COLUMNA IZQUIERDA: DATOS PRINCIPALES */}
                <div className="col-md-8">
                    <div className="card-modern border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-bottom p-4">
                            <h6 className="text-primary fw-bold mb-0 d-flex align-items-center">
                                <FaTrophy className="me-2"/> Información del Evento
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Nombre del Evento *</label>
                                <input name="name" className="form-control form-control-lg bg-light border-0" placeholder="Ej: 3ra Fecha Departamental FBI" onChange={handleChange} required />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Tipo</label>
                                    <select name="type" className="form-select bg-light border-0" onChange={handleChange}>
                                        <option value="Departamental">Departamental</option>
                                        <option value="Nacional">Nacional</option>
                                        <option value="Interno">Interno</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Nro. Convocatoria</label>
                                    <input name="numero_convocatoria" className="form-control bg-light border-0" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Descripción / Notas</label>
                                <textarea name="description" className="form-control bg-light border-0" rows="3" onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="card-modern border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom p-4">
                            <h6 className="text-success fw-bold mb-0 d-flex align-items-center">
                                <FaMoneyBillWave className="me-2"/> Costos y Reglas
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-light border-start border-4 border-success small text-muted">
                                Defina los costos base. Si establece un <strong>Costo Máximo Global</strong>, el sistema ajustará automáticamente el total a pagar de los deportistas para no exceder ese monto.
                            </div>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Costo Inscripción Base (Bs)</label>
                                    <input type="number" name="costo_inscripcion_base" className="form-control bg-light border-0 fw-bold" defaultValue="0" onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-success">Costo Máximo Global (Bs)</label>
                                    <input type="number" name="costo_limite_global" className="form-control border-success bg-success bg-opacity-10 fw-bold text-success" placeholder="Opcional (Ej: 100)" onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: FECHAS Y UBICACIÓN */}
                <div className="col-md-4">
                    <div className="card-modern border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-bottom p-4">
                            <h6 className="text-warning fw-bold mb-0 d-flex align-items-center text-dark">
                                <FaCalendarAlt className="me-2 text-warning"/> Agenda
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Fecha Inicio *</label>
                                <input type="date" name="start_date" className="form-control bg-light border-0" onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Fecha Fin *</label>
                                <input type="date" name="end_date" className="form-control bg-light border-0" onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Hora Inicio</label>
                                <input type="time" name="hora_competencia" className="form-control bg-light border-0" defaultValue="08:00" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="card-modern border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-bottom p-4">
                            <h6 className="text-danger fw-bold mb-0 d-flex align-items-center">
                                <FaMapMarkerAlt className="me-2"/> Ubicación
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <label className="form-label small fw-bold text-muted">Polígono Oficial</label>
                            <select name="poligono" className="form-select bg-light border-0" onChange={handleChange} required>
                                <option value="">-- Seleccione --</option>
                                {poligonos.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg hover-lift" disabled={loading}>
                        {loading ? 'Guardando...' : <><FaSave className="me-2"/> Crear Competencia</>}
                    </button>
                </div>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default CreateCompetencia;