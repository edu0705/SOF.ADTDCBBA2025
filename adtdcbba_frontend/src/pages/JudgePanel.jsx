import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import competenciaService from '../services/competenciaService';
import { useAuth } from '../context/AuthContext';
import { 
  FaTrophy, FaUser, FaSave, FaBullseye, FaRedo, FaListOl, FaMapMarkerAlt 
} from 'react-icons/fa';

const JudgePanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados de Flujo
  const [selectedCompetencia, setSelectedCompetencia] = useState('');
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  
  // Estado del Formulario Actual (Puntajes)
  const [serieData, setSerieData] = useState({}); 

  // 1. Cargar Competencias Activas (En Progreso)
  const { data: competencias = [], isLoading: loadingComp } = useQuery({
    queryKey: ['competencias_juez'],
    queryFn: async () => {
      const res = await competenciaService.getCompetencias();
      const all = res.data.results || res.data;
      return all.filter(c => c.status === 'En Progreso');
    }
  });

  // 2. Cargar Inscripciones de la competencia seleccionada
  const { data: inscripciones = [], isLoading: loadingIns } = useQuery({
    queryKey: ['inscripciones_comp', selectedCompetencia],
    queryFn: async () => {
      if (!selectedCompetencia) return [];
      const res = await competenciaService.getInscripciones(selectedCompetencia);
      return res.data.results || res.data;
    },
    enabled: !!selectedCompetencia
  });

  // 3. Mutación para Enviar Puntaje
  const submitScoreMutation = useMutation({
    mutationFn: async (payload) => {
      return await competenciaService.submitScore(payload);
    },
    onSuccess: () => {
      alert("✅ Puntaje registrado correctamente");
      // Limpiar formulario para el siguiente deportista
      setSelectedInscripcion(null);
      setSerieData({});
      queryClient.invalidateQueries(['resultados']);
    },
    onError: (err) => {
      console.error("Error enviando puntaje:", err);
      alert("❌ Error al enviar. Verifique los datos.");
    }
  });

  // --- LÓGICA DE UI ---

  const handleSelectDeportista = (inscripcion) => {
    setSelectedInscripcion(inscripcion);
    // Reiniciamos el formulario
    setSerieData({});
  };

  const handleScoreInput = (field, value) => {
    setSerieData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSubmitFinal = () => {
    if (!selectedInscripcion) return;
    
    // Construimos el payload esperado por el Backend
    const payload = {
      inscripcion: selectedInscripcion.id,
      ronda_o_serie: "Final",
      series: [serieData], // Enviamos la serie única dentro de un array
      juez_que_registro: user.id 
    };

    if (window.confirm(`¿Confirmar puntaje de ${serieData.puntaje_total_ronda || 0} para ${selectedInscripcion.deportista_nombre}?`)) {
        submitScoreMutation.mutate(payload);
    }
  };

  // --- RENDERIZADO ---

  return (
    <div className="container-fluid py-3 fade-in" style={{ maxWidth: '800px' }}>
      
      {/* HEADER DEL JUEZ */}
      <div className="d-flex align-items-center justify-content-between mb-4 bg-white p-3 rounded-4 shadow-sm border-bottom border-warning border-4">
        <div className="d-flex align-items-center">
            <div className="bg-warning bg-opacity-25 p-3 rounded-circle me-3 text-warning">
                <FaTrophy size={24}/>
            </div>
            <div>
                <h5 className="fw-bold m-0 text-dark">Panel de Juez</h5>
                <small className="text-muted">Hola, {user.first_name || user.username}</small>
            </div>
        </div>
        {selectedCompetencia && (
            <button onClick={() => setSelectedCompetencia('')} className="btn btn-light text-muted btn-sm rounded-pill">
                Cambiar Evento
            </button>
        )}
      </div>

      {/* PASO 1: SELECCIONAR COMPETENCIA */}
      {!selectedCompetencia && (
        <div className="animate-slide-up">
            <h6 className="text-muted fw-bold mb-3 ps-2">EVENTOS ACTIVOS</h6>
            {loadingComp ? <div className="text-center py-4"><div className="spinner-border text-warning"/></div> : (
                <div className="row g-3">
                    {competencias.length > 0 ? competencias.map(comp => (
                        <div key={comp.id} className="col-12">
                            <button 
                                onClick={() => setSelectedCompetencia(comp.id)}
                                className="btn btn-white w-100 text-start p-4 shadow-sm border-0 rounded-4 position-relative overflow-hidden hover-scale"
                            >
                                <div className="position-absolute top-0 start-0 h-100 w-2 bg-success"></div>
                                <h5 className="fw-bold text-dark mb-1">{comp.name}</h5>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted"><FaMapMarkerAlt className="me-1"/> {comp.poligono_nombre || 'Polígono Principal'}</small>
                                    <span className="badge bg-success rounded-pill px-3">En Curso</span>
                                </div>
                            </button>
                        </div>
                    )) : (
                        <div className="col-12">
                            <div className="alert alert-info text-center rounded-4 shadow-sm border-0">
                                No hay competencias en curso asignadas a ti en este momento.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}

      {/* PASO 2: SELECCIONAR DEPORTISTA */}
      {selectedCompetencia && !selectedInscripcion && (
        <div className="animate-slide-up">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted fw-bold m-0 ps-2">TIRADORES DISPONIBLES</h6>
                <span className="badge bg-primary rounded-pill">{inscripciones.length} Inscritos</span>
            </div>
            
            {loadingIns ? <div className="text-center py-4"><div className="spinner-border text-primary"/></div> : (
                <div className="list-group shadow-sm rounded-4 border-0 overflow-hidden">
                    {inscripciones.map(ins => (
                        <button 
                            key={ins.id} 
                            onClick={() => handleSelectDeportista(ins)}
                            className="list-group-item list-group-item-action p-4 border-0 border-bottom d-flex align-items-center justify-content-between hover-bg-light"
                        >
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-3 me-3 text-secondary">
                                    <FaUser size={20}/>
                                </div>
                                <div>
                                    <h6 className="fw-bold m-0 text-dark">{ins.deportista_nombre}</h6>
                                    <small className="text-muted">{ins.club_nombre}</small>
                                </div>
                            </div>
                            <FaBullseye className="text-danger opacity-50" size={24}/>
                        </button>
                    ))}
                    {inscripciones.length === 0 && (
                        <div className="p-4 text-center text-muted">No hay deportistas inscritos aún.</div>
                    )}
                </div>
            )}
        </div>
      )}

      {/* PASO 3: INGRESO DE PUNTAJES (INTERFAZ TÁCTIL) */}
      {selectedInscripcion && (
        <div className="animate-slide-up">
            {/* Cabecera del Deportista */}
            <div className="card-modern bg-dark text-white p-4 mb-4 border-0 text-center position-relative overflow-hidden shadow-lg">
                <div className="position-absolute top-0 end-0 p-3 opacity-10"><FaUser size={100}/></div>
                <h3 className="fw-bold mb-1 text-warning">{selectedInscripcion.deportista_nombre}</h3>
                <p className="mb-0 opacity-75">{selectedInscripcion.club_nombre}</p>
                <button 
                    onClick={() => setSelectedInscripcion(null)} 
                    className="btn btn-sm btn-outline-light rounded-pill position-absolute top-0 start-0 m-3 hover-scale"
                >
                    <FaRedo className="me-1"/> Cambiar
                </button>
            </div>

            {/* Formulario Grande */}
            <div className="card-modern p-4 border-0 shadow-lg bg-white">
                <h5 className="fw-bold text-center mb-4 text-primary d-flex align-items-center justify-content-center">
                    <FaListOl className="me-2"/> Registro de Impactos
                </h5>

                {/* Input Gigante para Puntaje Total */}
                <div className="mb-4">
                    <label className="form-label text-center w-100 text-muted small fw-bold text-uppercase">Puntaje Total</label>
                    <input 
                        type="number" 
                        inputMode="decimal" 
                        className="form-control form-control-lg text-center fw-bold text-dark border-2 border-primary bg-light rounded-3" 
                        style={{fontSize: '3.5rem', height: '120px'}}
                        placeholder="0.0"
                        value={serieData.puntaje_total_ronda || ''}
                        onChange={(e) => handleScoreInput('puntaje_total_ronda', e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Contador de X (Switch Grande) */}
                <div className="d-flex justify-content-center gap-3 mb-5 p-3 bg-light rounded-4 border">
                    <div className="form-check form-switch custom-switch-lg d-flex align-items-center gap-3">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="esX" 
                            style={{width: '60px', height: '30px', cursor: 'pointer'}}
                            checked={serieData.es_x || false}
                            onChange={(e) => setSerieData({...serieData, es_x: e.target.checked})}
                        />
                        <label className="form-check-label fw-bold pt-1 cursor-pointer select-none" htmlFor="esX" style={{fontSize: '1.1rem'}}>Es Centro (X)</label>
                    </div>
                </div>

                <button 
                    onClick={handleSubmitFinal}
                    disabled={submitScoreMutation.isLoading || !serieData.puntaje_total_ronda}
                    className="btn btn-success w-100 py-3 rounded-4 shadow-lg fw-bold fs-4 hover-lift d-flex align-items-center justify-content-center transition-all"
                >
                    {submitScoreMutation.isLoading ? (
                        <div className="spinner-border text-white"/>
                    ) : (
                        <><FaSave className="me-3"/> ENVIAR RESULTADO</>
                    )}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default JudgePanel;