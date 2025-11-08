// src/pages/ManageDeportistas.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deportistaService from '../services/deportistaService';

const ManageDeportistas = () => {
    const [deportistas, setDeportistas] = useState([]); 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDeportistas();
    }, []);

    const fetchDeportistas = async () => {
        try {
            // Esta API devuelve TODOS los deportistas para el Presidente/Admin
            const response = await deportistaService.getDeportistas(); 
            
            // Filtro para excluir a los ya Rechazados de la vista principal de gestión
            const deportistasFiltrados = response.data.filter(dep => 
                dep.status !== 'Rechazado'
            );
            
            setDeportistas(deportistasFiltrados);
            setError('');
        } catch (err) {
            console.error("Error fetching deportistas:", err);
            setError("Error al cargar la lista de deportistas.");
        }
    };

    const handleApprove = async (id, status) => {
        setMessage('');
        setError('');
        try {
            // Usamos PATCH para actualizar solo el campo 'status'
            await deportistaService.updateDeportista(id, { status: status });
            setMessage(`Deportista ID ${id} marcado como ${status}.`);
            fetchDeportistas(); // Recargar la lista
        } catch (err) {
            setError("Fallo al actualizar el estado del deportista.");
        }
    };

    const handleReject = async (id) => {
        const motivo = prompt("Ingrese el motivo detallado del rechazo:");
        if (!motivo) return; 

        setMessage('');
        setError('');
        try {
            // Enviamos el estado 'Rechazado' y el motivo al nuevo campo 'notas_admin' del modelo Deportista
            await deportistaService.updateDeportista(id, { status: 'Rechazado', notas_admin: `Rechazo: ${motivo}` });
            setMessage(`Deportista ID ${id} RECHAZADO con motivo.`);
            fetchDeportistas();
        } catch (err) {
            setError("Fallo al rechazar el estado del deportista.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <h2 className="text-primary mb-4">Gestión de Aprobación de Deportistas</h2>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body">
                    <h4 className="mb-3 text-secondary">Solicitudes Pendientes y Perfiles Activos</h4>
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Club</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deportistas.map(dep => (
                                <tr key={dep.id} className={dep.status === 'Pendiente de Aprobación' ? 'table-warning' : ''}>
                                    <td>{dep.id}</td>
                                    <td>{dep.first_name} {dep.last_name}</td>
                                    
                                    <td>
                                        <span className="badge bg-primary">
                                            {dep.club_info || 'N/A'}
                                        </span>
                                    </td> 
                                    
                                    <td><span className={`badge bg-${dep.status === 'Activo' ? 'success' : 'warning'}`}>{dep.status}</span></td>
                                    <td>
                                        {/* 1. BOTÓN DE REVISIÓN DE PERFIL/DOCUMENTOS */}
                                        <Link to={`/admin/deportistas/${dep.id}`} className="btn btn-sm btn-info me-2 text-white">
                                            <i className="bi bi-eye me-1"></i> Revisar
                                        </Link>

                                        {/* 2. BOTÓN DE APROBAR / RECHAZAR */}
                                        {dep.status !== 'Activo' && dep.status !== 'Rechazado' && (
                                            <>
                                                <button onClick={() => handleApprove(dep.id, 'Activo')} className="btn btn-sm btn-success me-2">
                                                    <i className="bi bi-check-lg me-1"></i> Aprobar
                                                </button>
                                                <button onClick={() => handleReject(dep.id)} className="btn btn-sm btn-danger">
                                                    <i className="bi bi-x-lg me-1"></i> Rechazar
                                                </button>
                                            </>
                                        )}
                                        {/* 3. SUSPENDER (Opción para perfiles ya activos) */}
                                        {dep.status === 'Activo' && (
                                            <button onClick={() => handleApprove(dep.id, 'Suspendido')} className="btn btn-sm btn-outline-danger">
                                                Suspender
                                            </button>
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

export default ManageDeportistas;