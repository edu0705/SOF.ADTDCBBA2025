// src/services/deportistaService.jsx
import api from '../config/api'; // Importamos la instancia segura (con cookies)

// NOTA: Ya no necesitamos interceptores ni localStorage aquí.
// 'api' ya lo maneja todo centralizado.

// 1. CRUD DEPORTISTAS
// La ruta en el backend es 'router.register(r'list', ...)' -> /api/deportistas/list/
const getAllDeportistas = () => api.get('/deportistas/list/');
const createDeportista = (data) => api.post('/deportistas/list/', data);
const getDeportistaById = (id) => api.get(`/deportistas/list/${id}/`);
const updateDeportista = (id, data) => api.patch(`/deportistas/list/${id}/`, data);

// 2. DOCUMENTOS Y ARMAS
// Usamos las rutas específicas definidas en urls.py
const uploadDocument = (formData) => api.post('/deportistas/documentos/', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
});

const registerArma = (formData) => api.post('/deportistas/armas/', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
});

const deleteArma = (id) => api.delete(`/deportistas/armas/${id}/`);
const searchArmas = (query) => api.get(`/deportistas/armas/?search=${query}`);

// 3. PRÉSTAMOS
const createLoan = (data) => api.post('/deportistas/prestamos/', data);

const downloadLoanReport = async (id) => {
    try {
        const response = await api.get(`/deportistas/prestamos/${id}/print_report/`, { responseType: 'blob' });
        createDownloadLink(response.data, `Prestamo_${id}.pdf`);
    } catch (e) { console.error(e); }
};

// 4. CARNET Y CV
const downloadCarnet = async (id, n) => {
    try {
        // Usamos la acción sobre el deportista
        const response = await api.get(`/deportistas/list/${id}/print_carnet/`, { responseType: 'blob' });
        createDownloadLink(response.data, `Carnet_${n}.pdf`);
    } catch (e) { 
        console.error("Error descargando carnet", e); 
        alert("Error al descargar el carnet."); 
    }
};

const getStats = (id = null) => {
    // Si hay ID, pedimos stats de ese usuario. Si no, pedimos "stats_me" (mis estadísticas)
    // Backend: @action(detail=False) stats_me -> /list/stats_me/
    // Backend: @action(detail=True) stats -> /list/{id}/stats/
    const endpoint = id ? `/deportistas/list/${id}/stats/` : `/deportistas/list/stats_me/`;
    return api.get(endpoint);
};

const downloadCV = async (id) => {
    try {
        const endpoint = id ? `/deportistas/list/${id}/cv/` : `/deportistas/list/0/cv/`; 
        const response = await api.get(endpoint, { responseType: 'blob' });
        createDownloadLink(response.data, `CV_Deportivo.pdf`);
    } catch (e) { 
        console.error("Error descargando CV", e); 
        alert("Error al descargar el CV."); 
    }
};

// Función auxiliar para descargas (DRY - Don't Repeat Yourself)
const createDownloadLink = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a'); 
    link.href = url; 
    link.setAttribute('download', filename);
    document.body.appendChild(link); 
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};

const deportistaService = {
    getAllDeportistas, createDeportista, getDeportistaById, updateDeportista,
    uploadDocument, registerArma, deleteArma, searchArmas,
    createLoan, downloadLoanReport, downloadCarnet,
    getStats, downloadCV,
    api
};

export default deportistaService;