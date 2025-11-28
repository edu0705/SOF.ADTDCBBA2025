import api from '../config/api';

const competenciaService = {
    // Competencias
    getAll: async () => (await api.get('/competencias/competencias/')).data,
    getById: async (id) => (await api.get(`/competencias/competencias/${id}/`)).data,
    create: async (data) => (await api.post('/competencias/competencias/', data)).data,
    
    // Polígonos (Para llenar el select)
    getPoligonos: async () => (await api.get('/competencias/poligonos/')).data,

    // Inscripciones
    getInscripciones: async () => (await api.get('/competencias/inscripciones/')).data,
    
    // Estadísticas y Reportes
    getStats: async (id) => (await api.get(`/competencias/competencias/${id}/official_results/`)).data,
};

export default competenciaService;