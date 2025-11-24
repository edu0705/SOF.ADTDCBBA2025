import api from '../config/api'; // Importamos la instancia segura

// Las armas se gestionan bajo el namespace de deportistas en el backend
// Ruta base: /api/deportistas/armas/

const getAllArmas = () => api.get('/deportistas/armas/');

const createArma = (data) => api.post('/deportistas/armas/', data, {
    headers: { 'Content-Type': 'multipart/form-data' } // Necesario para subir fotos si las hubiera
});

const getArmaById = (id) => api.get(`/deportistas/armas/${id}/`);

const updateArma = (id, data) => api.patch(`/deportistas/armas/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

const deleteArma = (id) => api.delete(`/deportistas/armas/${id}/`);

// Búsqueda específica (útil para autocompletado)
const searchArmas = (query) => api.get(`/deportistas/armas/?search=${query}`);

const armaService = {
    getAllArmas,
    createArma,
    getArmaById,
    updateArma,
    deleteArma,
    searchArmas
};

export default armaService;