import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';


const ManageModalidades = () => {
  const [modalidades, setModalidades] = useState([]);
  const [newModalidad, setNewModalidad] = useState({ name: '' });
  const [newCategoria, setNewCategoria] = useState({ name: '', modalidad: null });
  const [selectedModalidadId, setSelectedModalidadId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModalidades();
  }, []);

  const fetchModalidades = async () => {
    try {
      const response = await competenciaService.getModalidades();
      setModalidades(response.data);
      setError('');
    } catch (err) {
      setError("Error al cargar modalidades.");
    }
  };

  const handleCreateModalidad = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await competenciaService.createModalidad(newModalidad);
      setNewModalidad({ name: '' });
      fetchModalidades();
      setMessage("Modalidad creada con éxito.");
    } catch (err) {
      setError("Error al crear modalidad.");
    }
  };

  const handleDeleteModalidad = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta modalidad? Se eliminarán TODAS sus categorías asociadas.")) return;
    setMessage(''); setError('');
    try {
      await competenciaService.deleteModalidad(id);
      fetchModalidades();
      setMessage("Modalidad eliminada con éxito.");
      setSelectedModalidadId(null);
    } catch (err) {
      setError("Error al eliminar modalidad.");
    }
  };

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      // Aseguramos que el ID de modalidad sea un entero
      const dataToSend = { ...newCategoria, modalidad: parseInt(newCategoria.modalidad) };
      await competenciaService.createCategoria(dataToSend);
      setNewCategoria({ name: '', modalidad: null });
      fetchModalidades();
      setMessage("Categoría creada con éxito.");
    } catch (err) {
      setError("Error al crear categoría.");
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría?")) return;
    setMessage(''); setError('');
    try {
      await competenciaService.deleteCategoria(id);
      fetchModalidades();
      setMessage("Categoría eliminada con éxito.");
    } catch (err) {
      setError("Error al eliminar categoría.");
    }
  };

  return (
    <div className="container-fluid mt-4">
        <h2 className="text-primary mb-4">Gestionar Modalidades y Categorías</h2>
        
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-5">
            <div className="card-header bg-white">
                <h4 className="mb-0 text-dark">Crear Nueva Modalidad</h4>
            </div>
            <div className="card-body">
                <form onSubmit={handleCreateModalidad} className="row g-3">
                    <div className="col-md-8">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de la Modalidad (Ej: FBI, ESCOPETA)"
                            value={newModalidad.name}
                            onChange={(e) => setNewModalidad({ name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <button type="submit" className="btn btn-primary w-100">
                            <i className="bi bi-plus-circle me-2"></i> Crear Modalidad
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <h4 className="mb-3 text-secondary">Modalidades Registradas</h4>
        <div className="card shadow-sm">
            <div className="card-body">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th>Modalidad</th>
                            <th>Categorías</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modalidades.map((mod) => (
                            <React.Fragment key={mod.id}>
                                <tr>
                                    <td><strong>{mod.name}</strong></td>
                                    <td>
                                        <span className="badge bg-info text-dark me-2">{mod.categorias.length} Categorías</span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDeleteModalidad(mod.id)} className="btn btn-sm btn-danger me-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                        <button onClick={() => setSelectedModalidadId(selectedModalidadId === mod.id ? null : mod.id)} className={`btn btn-sm ${selectedModalidadId === mod.id ? 'btn-secondary' : 'btn-outline-primary'}`}>
                                            {selectedModalidadId === mod.id ? 'Ocultar' : 'Ver/Añadir Categorías'}
                                        </button>
                                    </td>
                                </tr>
                                {/* Fila de Categorías Anidadas */}
                                {selectedModalidadId === mod.id && (
                                    <tr>
                                        <td colSpan="3" className="p-4 bg-light">
                                            <div className="row">
                                                {mod.categorias.map(cat => (
                                                    <div key={cat.id} className="col-md-4 mb-2 d-flex justify-content-between align-items-center">
                                                        <span>• {cat.name}</span>
                                                        <button onClick={() => handleDeleteCategoria(cat.id)} className="btn btn-sm btn-outline-danger">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Formulario de Añadir Categoría */}
                                            <hr className="mt-4" />
                                            <h6 className="mb-3">Añadir Categoría a {mod.name}</h6>
                                            <form onSubmit={handleCreateCategoria} className="row g-2">
                                                {/* Hidden input para el ID de la modalidad */}
                                                <input type="hidden" name="modalidad" value={newCategoria.modalidad = mod.id} /> 
                                                <div className="col-md-8">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Nombre de la Categoría (Ej: FBI 9MM)"
                                                        value={newCategoria.name}
                                                        onChange={(e) => setNewCategoria({ ...newCategoria, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <button type="submit" className="btn btn-success w-100">Añadir</button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ManageModalidades;