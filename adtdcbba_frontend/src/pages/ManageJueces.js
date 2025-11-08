import React, { useState, useEffect } from 'react';
import competenciaService from '../services/competenciaService';

const ManageJueces = () => {
  const [jueces, setJueces] = useState([]);
  const [juez, setJuez] = useState({ full_name: '', license_number: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJueces();
  }, []);

  const fetchJueces = async () => {
    try {
      const response = await competenciaService.getJueces();
      setJueces(response.data);
      setError('');
    } catch (err) {
      setError("Error al cargar la lista de jueces.");
    }
  };

  const handleChange = (e) => {
      setJuez({ ...juez, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      if (editingId) {
        await competenciaService.updateJuez(editingId, juez);
        setMessage("Juez actualizado con éxito.");
      } else {
        await competenciaService.createJuez(juez);
        setMessage("Juez creado con éxito.");
      }
      setJuez({ full_name: '', license_number: '' });
      setEditingId(null);
      fetchJueces();
    } catch (err) {
      setError("Error al guardar juez. Verifique los datos.");
    }
  };

  const handleEdit = (j) => {
    setJuez(j);
    setEditingId(j.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este juez?")) return;
    setMessage('');
    setError('');
    try {
      await competenciaService.deleteJuez(id);
      setMessage("Juez eliminado con éxito.");
      fetchJueces();
    } catch (err) {
      setError("Error al eliminar juez.");
    }
  };

  return (
    <div className="container-fluid mt-4">
        <h2 className="text-primary mb-4">Gestionar Jueces</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-5">
            <div className="card-header bg-white">
                <h4 className="mb-0 text-dark">{editingId ? 'Modificar Juez' : 'Registrar Nuevo Juez'}</h4>
            </div>
            <div className="card-body">
                <form onSubmit={handleCreateOrUpdate} className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Nombre Completo</label>
                        <input type="text" className="form-control" name="full_name" value={juez.full_name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Número de Licencia</label>
                        <input type="text" className="form-control" name="license_number" value={juez.license_number} onChange={handleChange} required />
                    </div>
                    
                    <div className="col-12 mt-4">
                        <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-primary'} me-2`}>
                            <i className={`bi bi-${editingId ? 'pencil-square' : 'plus-circle'} me-2`}></i>
                            {editingId ? 'Actualizar Juez' : 'Crear Juez'}
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

        <h4 className="mb-3 text-secondary">Jueces Registrados</h4>
        <div className="card shadow-sm">
            <div className="card-body">
                {/* Aplicamos estilos de tabla estriada y hover */}
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th>Nombre</th>
                            <th>Licencia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jueces.map(j => (
                            <tr key={j.id}>
                                <td>{j.full_name}</td>
                                <td>{j.license_number}</td>
                                <td>
                                    <button onClick={() => handleEdit(j)} className="btn btn-sm btn-info me-2 text-white">
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button onClick={() => handleDelete(j.id)} className="btn btn-sm btn-danger">
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

export default ManageJueces;