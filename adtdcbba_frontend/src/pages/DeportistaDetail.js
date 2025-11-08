import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import deportistaService from '../services/deportistaService';

const DeportistaDetail = () => {
    const { id } = useParams(); // Obtiene el ID de la URL
    const [deportista, setDeportista] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Endpoint para obtener el detalle de un deportista
                const response = await deportistaService.getDeportistaDetail(id);
                setDeportista(response.data);
            } catch (err) {
                console.error("Error fetching detail:", err.response || err);
                setError("No se pudo cargar el perfil detallado. Verifique que el ID sea correcto.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Función auxiliar para obtener el valor o N/A
    const val = (value) => value || 'N/A';

    if (loading) return <div className="container mt-5">Cargando perfil...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
    if (!deportista) return <div className="container mt-5 alert alert-warning">Deportista no encontrado.</div>;

    return (
        <div className="container-fluid mt-4">
            <h2 className="text-primary mb-4">Revisión de Perfil: {val(deportista.first_name)} {val(deportista.last_name)}</h2>
            
            {/* Tarjeta de Información General */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white">
                    Información Básica
                </div>
                <div className="card-body row">
                    <div className="col-md-4"><strong>Club:</strong> <span className="badge bg-primary">{val(deportista.club_info)}</span></div>
                    <div className="col-md-4"><strong>Estado Actual:</strong> <span className={`badge bg-${deportista.status === 'Activo' ? 'success' : 'warning'}`}>{val(deportista.status)}</span></div>
                    <div className="col-md-4"><strong>Email:</strong> {val(deportista.email)}</div>

                    <hr className="my-2" />
                    
                    <div className="col-md-4"><strong>CI:</strong> {val(deportista.ci)}</div>
                    <div className="col-md-4"><strong>Fecha Nacimiento:</strong> {val(deportista.birth_date)}</div>
                    <div className="col-md-4"><strong>Teléfono:</strong> {val(deportista.telefono)}</div>

                    <hr className="my-2" />

                    <div className="col-md-4"><strong>Género:</strong> {val(deportista.genero)}</div>
                    <div className="col-md-4"><strong>Departamento:</strong> {val(deportista.departamento)}</div>
                    <div className="col-md-4"><strong>N° Afiliado:</strong> {val(deportista.user)}</div> {/* Muestra el ID de usuario como afiliado */}
                </div>
            </div>

            {/* Documentos */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-secondary text-white">Documentación ({deportista.documentos ? deportista.documentos.length : 0} archivos)</div>
                <ul className="list-group list-group-flush">
                    {deportista.documentos && deportista.documentos.length > 0 ? (
                        deportista.documentos.map((doc, index) => (
                            <li key={doc.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{val(doc.document_type)}</strong> (Vence: {val(doc.expiration_date)})
                                </span>
                                <a href={`/media/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                    Ver Archivo <i className="bi bi-box-arrow-up-right"></i>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item text-muted">No se han subido documentos.</li>
                    )}
                </ul>
            </div>

            {/* Armas */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-secondary text-white">Armamento Registrado ({deportista.armas ? deportista.armas.length : 0} armas)</div>
                <ul className="list-group list-group-flush">
                    {deportista.armas && deportista.armas.length > 0 ? (
                        deportista.armas.map((arma, index) => (
                            <li key={arma.id || index} className="list-group-item">
                                <strong>{val(arma.marca)} {val(arma.modelo)}</strong> ({val(arma.calibre)}) - Matrícula: {val(arma.numero_matricula)} - Inspección: {val(arma.fecha_inspeccion)}
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item text-muted">No se han registrado armas.</li>
                    )}
                </ul>
            </div>
            
            {/* Notas del Administrador (Motivo de Rechazo/Suspensión) */}
            {deportista.notas_admin && (
                <div className="alert alert-warning mt-3">
                    <strong>Notas/Motivo:</strong> {deportista.notas_admin}
                </div>
            )}
        </div>
    );
};

export default DeportistaDetail;