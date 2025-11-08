import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';

// Rondas Estáticas de Muestra (Necesario para el selector)
const ROUND_OPTIONS = [
    'Ronda 1', 'Ronda 2', 'Semifinal', 'Final', 'Desempate', 'Serie 1', 'Serie 2'
];

const JudgePanel = () => {
    const [competencias, setCompetencias] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [selectedCompetencia, setSelectedCompetencia] = useState('');
    const [rondaSeleccionada, setRondaSeleccionada] = useState('');
    const [puntajeCrudo, setPuntajeCrudo] = useState({}); 
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [modalidadSeleccionada, setModalidadSeleccionada] = useState(null);

    useEffect(() => {
        fetchCompetencias();
    }, []);

    const fetchCompetencias = async () => {
        try {
            const res = await competenciaService.getCompetencias();
            setCompetencias(res.data.filter(comp => comp.status !== 'Finalizada')); 
        } catch (err) {
            setError("No se pudieron cargar las competencias.");
        }
    };

    const fetchInscripciones = async (competenciaId) => {
        if (!competenciaId) {
            setInscripciones([]);
            return;
        }
        try {
            const resIns = await competenciaService.getInscripciones();
            const inscritos = resIns.data.filter(ins =>
                ins.competencia === parseInt(competenciaId) && ins.estado === 'APROBADA'
            );
            
            setInscripciones(inscritos);

            const initialScores = {};
            inscritos.forEach(ins => {
                initialScores[ins.id] = '';
            });
            setPuntajeCrudo(initialScores); // Inicializa el estado para el formulario
            setError('');

        } catch (err) {
            setError("Error al cargar la lista de competidores aprobados.");
        }
    };

    const handleCompetenciaChange = async (e) => {
        const id = e.target.value;
        setSelectedCompetencia(id);
        setRondaSeleccionada(''); 
        fetchInscripciones(id);

        const competencia = competencias.find(c => c.id === parseInt(id));
        if (competencia && competencia.categorias && competencia.categorias.length > 0) {
            const categoriaId = competencia.categorias[0]; 
            const modalidadesRes = await competenciaService.getModalidades();
            
            const modalidad = modalidadesRes.data.find(m => m.categorias.some(c => c.id === categoriaId));
            setModalidadSeleccionada(modalidad || null);
        } else {
            setModalidadSeleccionada(null);
        }
    };

    const handleRawScoreChange = (inscripcionId, field, value) => {
        const numericValue = parseFloat(value);
        setPuntajeCrudo(prevData => ({
            ...prevData,
            [inscripcionId]: {
                ...prevData[inscripcionId],
                [field]: isNaN(numericValue) ? '' : numericValue
            }
        }));
    };
    
    const handleSubmitScore = async (inscripcionId) => {
        setMessage('');
        setError('');
        
        const scoreData = puntajeCrudo[inscripcionId]; 
        
        if (!rondaSeleccionada) {
            alert("Debe seleccionar una Ronda/Serie para ingresar el puntaje.");
            return;
        }
        if (!scoreData || Object.keys(scoreData).length === 0) {
            alert("Por favor ingrese algún dato de puntaje.");
            return;
        }

        try {
            await competenciaService.submitScore({
                inscripcion: parseInt(inscripcionId),
                puntaje_crudo: scoreData, 
                ronda_o_serie: rondaSeleccionada 
            });
            setMessage(`Puntaje registrado con éxito en la ronda ${rondaSeleccionada}.`);
            
            setPuntajeCrudo(prevData => ({
                ...prevData,
                [inscripcionId]: {}
            }));
            
        } catch (err) {
            const detail = err.response && err.response.data && JSON.stringify(err.response.data);
            setError(`Fallo al enviar puntaje. Detalle: ${detail || 'Error de servidor'}`);
        }
    };
    
    const renderScoreForm = (inscripcionId) => {
        if (!modalidadSeleccionada) return <div className="text-muted">Seleccione una competencia con modalidades definidas.</div>;

        const data = puntajeCrudo[inscripcionId] || {};
        const fieldChange = (field, value) => handleRawScoreChange(inscripcionId, field, value);
        const modalidadName = modalidadSeleccionada.name.toUpperCase();

        // Lógica para FBI
        if (modalidadName.includes('FBI')) {
            return (
                <div className="row g-2">
                    <p className="text-muted small mt-2">FBI (Regla: Multiplicación por impacto)</p>
                    <div className="col-6"><input type="number" className="form-control" placeholder="Impactos de 5" value={data.impactos_5 || ''} onChange={(e) => fieldChange('impactos_5', e.target.value)} /></div>
                    <div className="col-6"><input type="number" className="form-control" placeholder="Impactos de 4" value={data.impactos_4 || ''} onChange={(e) => fieldChange('impactos_4', e.target.value)} /></div>
                    <div className="col-6"><input type="number" className="form-control" placeholder="Impactos de 3" value={data.impactos_3 || ''} onChange={(e) => fieldChange('impactos_3', e.target.value)} /></div>
                </div>
            );
        }

        // Lógica para Silueta Metálica
        if (modalidadName.includes('SILUETA METÁLICA')) {
            return (
                <div className="row g-2">
                    <p className="text-muted small mt-2">SILUETA (Factores de 1, 1.5, 2, 2.5)</p>
                    <div className="col-6"><input type="number" className="form-control" placeholder="PÁJAROS (x1)" value={data.pajaros || ''} onChange={(e) => fieldChange('pajaros', e.target.value)} /></div>
                    <div className="col-6"><input type="number" className="form-control" placeholder="CHANCHOS (x1.5)" value={data.chanchos || ''} onChange={(e) => fieldChange('chanchos', e.target.value)} /></div>
                    <div className="col-6"><input type="number" className="form-control" placeholder="PAVAS (x2)" value={data.pavas || ''} onChange={(e) => fieldChange('pavas', e.target.value)} /></div>
                </div>
            );
        }

        // Lógica por Defecto (Bench Rest, Hunter, Escopeta - Total de Ronda)
        return (
            <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Puntaje Total de Ronda"
                value={data.puntaje_total_ronda || ''}
                onChange={(e) => fieldChange('puntaje_total_ronda', e.target.value)}
            />
        );
    };

    const getArmaInfo = (inscripcion) => {
        if (inscripcion.participaciones && inscripcion.participaciones.length > 0) {
            const participacion = inscripcion.participaciones[0];
            if (participacion.arma_info) {
                return participacion.arma_info;
            }
        }
        return "N/A";
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Panel del Juez Avanzado</h2>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="mb-3">
                <label className="form-label fw-bold">Seleccionar Competencia:</label>
                <select className="form-select" onChange={handleCompetenciaChange} value={selectedCompetencia}>
                    <option value="">-- Seleccione --</option>
                    {competencias.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
            </div>
            
            {selectedCompetencia && (
                <div className="card p-3 mb-4 shadow-sm">
                    <p className="mb-2">Modalidad Activa: <strong className="text-primary">{modalidadSeleccionada ? modalidadSeleccionada.name : 'Cargando...'}</strong></p>
                    <label className="form-label fw-bold">Ronda/Serie a Calificar:</label>
                    <select className="form-select" value={rondaSeleccionada} onChange={(e) => setRondaSeleccionada(e.target.value)} required>
                        <option value="">-- Seleccione una Ronda --</option>
                        {ROUND_OPTIONS.map(ronda => (
                            <option key={ronda} value={ronda}>{ronda}</option>
                        ))}
                    </select>
                    {rondaSeleccionada && <p className="mt-2 text-info small">Calificando: {rondaSeleccionada}</p>}
                </div>
            )}

            {inscripciones.length > 0 && selectedCompetencia && (
                <div className="row">
                    <h3 className="mb-3">Competidores Aprobados ({inscripciones.length})</h3>
                    {inscripciones.map(ins => (
                        <div key={ins.id} className="col-md-6 mb-4">
                            <div className="card p-3 shadow-sm">
                                <h4 className="card-title h5">{ins.deportista}</h4> 
                                <p className="text-muted small">Arma: {getArmaInfo(ins)}</p>
                                
                                <div className="mb-3">
                                    {renderScoreForm(ins.id)}
                                </div>

                                <button 
                                    className="btn btn-success w-100"
                                    onClick={() => handleSubmitScore(ins.id)}
                                    disabled={!rondaSeleccionada}
                                >
                                    Enviar Puntaje ({rondaSeleccionada || 'Seleccione Ronda'})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JudgePanel;