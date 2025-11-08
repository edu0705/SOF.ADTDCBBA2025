import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';

const ManageCompetitions = () => {
    const [competencias, setCompetencias] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    // Asumiendo que el puerto de la API es 8000. Si usas 8001, ¡ajusta la URL base!
    const API_BASE_URL = 'http://localhost:8000/api/competencias/competencias'; 

    useEffect(() => {
        fetchCompetencias();
    }, []);

    const fetchCompetencias = async () => {
        try {
            const response = await competenciaService.getCompetencias();
            setCompetencias(response.data);
        } catch (err) {
            console.error("Error al obtener competencias:", err.response || err);
            setError("No se pudieron cargar las competencias.");
        }
    };

    const handleCloseCompetition = async (id, name) => {
        if (!window.confirm(`¿Está seguro de OFICIALIZAR los resultados de la competencia "${name}"? Esta acción es irreversible.`)) {
            return;
        }

        setMessage('');
        setError('');
        try {
            // Llamada al endpoint: /api/competencias/competencias/{id}/close_competition/
            await competenciaService.closeCompetition(id);
            setMessage(`Competencia ${name} cerrada y resultados OFICIALIZADOS con éxito.`);
            fetchCompetencias(); // Recargar la lista
        } catch (err) {
            console.error("Error al cerrar competencia:", err.response || err);
            setError(`Fallo al cerrar la competencia: ${err.response.data.detail || 'Error de servidor'}`);
        }
    };

    return (
        <div>
            <h2>Gestión y Cierre de Competencias</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Fechas</th>
                        <th>Acción de Cierre</th>
                        <th>Reportes</th>
                    </tr>
                </thead>
                <tbody>
                    {competencias.map(comp => (
                        <tr key={comp.id}>
                            <td>{comp.name}</td>
                            <td><strong>{comp.status}</strong></td>
                            <td>{comp.start_date} a {comp.end_date}</td>
                            <td>
                                {comp.status !== 'Finalizada' ? (
                                    <button 
                                        onClick={() => handleCloseCompetition(comp.id, comp.name)}
                                    >
                                        Oficializar / Cerrar
                                    </button>
                                ) : (
                                    <span>Resultados Oficiales</span>
                                )}
                            </td>
                            <td>
                                {comp.status === 'Finalizada' && (
                                    <a 
                                        href={`${API_BASE_URL}/${comp.id}/generate_report/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Descargar Reporte
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCompetitions;