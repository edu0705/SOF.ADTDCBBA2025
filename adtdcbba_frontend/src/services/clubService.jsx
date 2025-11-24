import api from '../config/api'; // Importamos la instancia segura (con cookies)

// NOTA: Ya no usamos localStorage manual. 'api' gestiona las credenciales.

// Rutas estandarizadas hacia /api/clubs/list/
const getAllClubs = () => api.get('/clubs/list/');
const createClub = (data) => api.post('/clubs/list/', data);
const getClubById = (id) => api.get(`/clubs/list/${id}/`);
const updateClub = (id, data) => api.patch(`/clubs/list/${id}/`, data);
const deleteClub = (id) => api.delete(`/clubs/list/${id}/`);

const clubService = {
    getAllClubs,
    createClub,
    getClubById,
    updateClub,
    deleteClub
};

export default clubService;