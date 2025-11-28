import api from '../config/api';

const inscripcionService = {
    // Obtener todas las inscripciones
    getAll: async () => {
        const response = await api.get('/inscripciones/');
        return response.data;
    },
    
    // Obtener una inscripción por ID
    getById: async (id) => {
        const response = await api.get(`/inscripciones/${id}/`);
        return response.data;
    },

    // Crear nueva inscripción
    create: async (data) => {
        const response = await api.post('/inscripciones/', data);
        return response.data;
    },

    // Actualizar inscripción
    update: async (id, data) => {
        const response = await api.put(`/inscripciones/${id}/`, data);
        return response.data;
    },

    // Eliminar inscripción
    delete: async (id) => {
        const response = await api.delete(`/inscripciones/${id}/`);
        return response.data;
    },

    // Descargar Recibo (PDF) - Basado en tu backend
    printReceipt: async (id) => {
        const response = await api.get(`/inscripciones/${id}/print_receipt/`, {
            responseType: 'blob' // Vital para manejar archivos binarios como PDF
        });
        return response.data;
    }
};

export default inscripcionService;