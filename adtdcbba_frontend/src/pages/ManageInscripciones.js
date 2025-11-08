// src/pages/ManageInscripciones.js

import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';

const ManageInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInscripciones();
    }, []);

    const fetchInscripciones = async () => {
        try {
            // Obtenemos todas las inscripciones (el queryset de Django filtra por rol)
            const response = await competenciaService.getInscripciones();
            setInscripciones(response.data);
            setError('');
        } catch (err) {
            console.error("Error al obtener inscripciones:", err.response || err);
            setError("No se pudieron cargar las inscripciones. Verifique el rol 'Tesorero'.");
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setMessage('');
        setError('');
        try {
            // Utilizamos el método PATCH para enviar solo el campo 'estado'
            const dataToSend = { estado: status }; 
            
            await competenciaService.updateInscripcionStatus(id, dataToSend);
            setMessage(`Inscripción ${status === 'APROBADA' ? 'APROBADA' : 'RECHAZADA'} con éxito.`);
            fetchInscripciones(); // Vuelve a cargar la lista para actualizar la vista
        } catch (err) {
            console.error("Error al actualizar estado:", err.response || err);
            setError("Error al actualizar el estado de la inscripción.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APROBADA': return 'badge bg-success';
            case 'RECHAZADA': return 'badge bg-danger';
            case 'PENDIENTE': return 'badge bg-warning text-dark';
            default: return 'badge bg-secondary';
        }
    };

    return (
        <div className="container-fluid mt-4">
            <h2 className="text-primary mb-4">Gestionar Solicitudes de Inscripción</h2>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="mb-3 text-secondary">Solicitudes Pendientes y Aprobadas</h4>
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Competencia</th>
                                <th>Deportista</th>
                                <th>Club</th>
                                <th>Costo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscripciones.map(ins => (
                                <tr key={ins.id}>
                                    <td>{ins.id}</td>
                                    <td>{ins.competencia}</td> 
                                    <td>{ins.deportista}</td>
                                    <td>{ins.club}</td>
                                    <td>{ins.costo_inscripcion} Bs.</td>
                                    <td><span className={getStatusBadge(ins.estado)}>{ins.estado}</span></td>
                                    <td>
                                        {ins.estado === 'PENDIENTE' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(ins.id, 'APROBADA')} className="btn btn-sm btn-success me-2">
                                                    <i className="bi bi-check-lg me-1"></i> Aprobar
                                                </button>
                                                <button onClick={() => handleUpdateStatus(ins.id, 'RECHAZADA')} className="btn btn-sm btn-danger">
                                                    <i className="bi bi-x-lg me-1"></i> Rechazar
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageInscripciones;