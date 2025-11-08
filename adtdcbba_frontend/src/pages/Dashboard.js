import React, { useState, useEffect, useCallback } from 'react'; // Agregamos useCallback aquí
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = () => {
  // Inicializamos como un array vacío para evitar el error .map is not a function
  const [clubs, setClubs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Usamos useCallback para que la función fetchClubs sea estable y no cause warnings
  const fetchClubs = useCallback(async () => {
    try {
      const response = await authService.api.get('clubs/');
      
      let data = response.data;
      
      // Lógica robusta para extraer la lista de clubs
      // Si la API usa paginación (DRF por defecto), la lista está en 'results'.
      if (data && data.results && Array.isArray(data.results)) {
          data = data.results;
      } 
      
      // Asignamos el array (o un array vacío si el formato es inesperado)
      setClubs(Array.isArray(data) ? data : []); 
      setError(null);
      
    } catch (err) {
      console.error('Error fetching clubs:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }
      setError('Error al cargar la información del Dashboard.');
      setClubs([]); 
      
    } finally {
        setLoading(false);
    }
  }, [navigate]); // navigate es una dependencia para useCallback

  useEffect(() => {
    // Redirige al login si no hay token (Lógica de PrivateRoute)
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Llamamos a la función estable
    fetchClubs();
    
  }, [navigate, fetchClubs]); // <-- ¡Lista de dependencias limpia y completa!

  // Solo renderiza cuando los datos han sido cargados
  if (loading) {
    return <div>Cargando Dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard de Clubs</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Listado de Clubs Registrados:</h3>
      <ul>
        {/* Renderizado simple y seguro */}
        {clubs.length > 0 ? (
          clubs.map(club => (
            <li key={club.id}>{club.name}</li>
          ))
        ) : (
          <li>No hay clubs para mostrar o su usuario no tiene permisos para ver esta lista.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;