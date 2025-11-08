import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';
import deportistaService from '../services/deportistaService';
import armaService from '../services/armaService';

const RegisterInscripcion = () => {
    const [competencias, setCompetencias] = useState([]);
    const [deportistas, setDeportistas] = useState([]);
    const [armas, setArmas] = useState([]);
    const [inscripcionData, setInscripcionData] = useState({
        deportista: '',
        competencia: '',
        arma: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [competenciasRes, deportistasRes, armasRes] = await Promise.all([
                competenciaService.getCompetencias(),
                deportistaService.getDeportistasActivos(),
                armaService.getArmas()
            ]);
            setCompetencias(competenciasRes.data);
            setDeportistas(deportistasRes.data);
            setArmas(armasRes.data);
        } catch (err) {
            console.error("Error al obtener datos:", err.response || err);
            setError("No se pudieron cargar los datos necesarios para la inscripción.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInscripcionData({ ...inscripcionData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await competenciaService.createInscripcion(inscripcionData);
            setMessage("Inscripción enviada con éxito. Pendiente de aprobación.");
            // Limpiar el formulario
            setInscripcionData({
                deportista: '',
                competencia: '',
                arma: ''
            });
        } catch (err) {
            console.error("Error al crear inscripción:", err.response || err);
            setError("Error al crear inscripción. Revisa los datos.");
        }
    };

    return (
        <div>
            <h2>Inscribir Deportista en Competencia</h2>
            <form onSubmit={handleSubmit}>
                <label>Competencia:</label>
                <select name="competencia" onChange={handleChange} required>
                    <option value="">Seleccione una Competencia</option>
                    {competencias.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>

                <label>Deportista:</label>
                <select name="deportista" onChange={handleChange} required>
                    <option value="">Seleccione un Deportista</option>
                    {deportistas.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.full_name}</option>
                    ))}
                </select>

                <label>Arma:</label>
                <select name="arma" onChange={handleChange} required>
                    <option value="">Seleccione un Arma</option>
                    {armas.map(arma => (
                        <option key={arma.id} value={arma.id}>{arma.name}</option>
                    ))}
                </select>

                <button type="submit">Inscribir</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default RegisterInscripcion;