import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';

const ManagePoligonos = () => {
  const [poligonos, setPoligonos] = useState([]);
  // Inicializamos fecha_vencimiento_licencia con un string vacío para evitar problemas de formato de fecha
  const [poligono, setPoligono] = useState({ name: '', address: '', numero_licencia: '', fecha_vencimiento_licencia: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoligonos();
  }, []);

  const fetchPoligonos = async () => {
    try {
      const response = await competenciaService.getPoligonos();
      setPoligonos(response.data);
      setError('');
    } catch (err) {
      console.error("Error fetching poligonos:", err);
      setError("Error al cargar la lista de polígonos.");
    }
  };

  const handleChange = (e) => {
      setPoligono({ ...poligono, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await competenciaService.updatePoligono(editingId, poligono);
        setMessage("Polígono actualizado con éxito.");
      } else {
        await competenciaService.createPoligono(poligono);
        setMessage("Polígono creado con éxito.");
      }
      // Limpiar y resetear estados
      setPoligono({ name: '', address: '', numero_licencia: '', fecha_vencimiento_licencia: '' });
      setEditingId(null);
      fetchPoligonos();
    } catch (err) {
      console.error("Error creating/updating poligono:", err.response || err);
      setError("Error al guardar polígono. Verifique los datos.");
    }
  };

  const handleEdit = (p) => {
    // Formatear la fecha a YYYY-MM-DD para el input[type="date"]
    const formattedDate = p.fecha_vencimiento_licencia ? new Date(p.fecha_vencimiento_licencia).toISOString().split('T')[0] : '';
    setPoligono({ ...p, fecha_vencimiento_licencia: formattedDate });
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este polígono?")) return;
    setMessage('');
    setError('');
    try {
      await competenciaService.deletePoligono(id);
      setMessage("Polígono eliminado con éxito.");
      fetchPoligonos();
    } catch (err) {
      console.error("Error deleting poligono:", err.response || err);
      setError("Error al eliminar polígono.");
    }
  };

  return (
    <div className="container-fluid mt-4">
        <h2 className="text-primary mb-4">Gestionar Polígonos</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-5">
            <div className="card-header bg-white">
                <h4 className="mb-0 text-dark">{editingId ? 'Modificar Polígono' : 'Registrar Nuevo Polígono'}</h4>
            </div>
            <div className="card-body">
                {/* Formulario de Creación/Edición */}
                <form onSubmit={handleCreateOrUpdate} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={poligono.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Dirección</label>
                        <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={poligono.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Número de Licencia</label>
                        <input
                            type="text"
                            className="form-control"
                            name="numero_licencia"
                            value={poligono.numero_licencia}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Fecha de Vencimiento (Licencia)</label>
                        <input
                            type="date"
                            className="form-control"
                            name="fecha_vencimiento_licencia"
                            value={poligono.fecha_vencimiento_licencia}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="col-12 mt-4">
                        <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'} me-2`}>
                            <i className={`bi bi-${editingId ? 'pencil-square' : 'plus-circle'} me-2`}></i>
                            {editingId ? 'Actualizar Polígono' : 'Crear Polígono'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => setEditingId(null)} className="btn btn-secondary">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        <h4 className="mb-3 text-secondary">Polígonos Registrados</h4>
        <div className="card shadow-sm">
            <div className="card-body">
                {/* Tabla para Visualizar Datos */}
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Licencia</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {poligonos.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.address}</td>
                                <td>{p.numero_licencia || 'N/A'}</td>
                                <td>{p.fecha_vencimiento_licencia || 'Permanente'}</td>
                                <td>
                                    <button onClick={() => handleEdit(p)} className="btn btn-sm btn-info me-2 text-white">
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">
                                        <i className="bi bi-trash"></i>
                                    </button>
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

export default ManagePoligonos;