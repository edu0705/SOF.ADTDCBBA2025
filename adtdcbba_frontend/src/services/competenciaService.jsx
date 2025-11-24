// src/services/competenciaService.jsx
import api from '../config/api'; // Importamos la instancia centralizada y segura

// NOTA: Ya no necesitamos configurar interceptors aquí ni leer localStorage.
// La instancia 'api' ya maneja cookies y credenciales automáticamente.

// --- GETS SIMPLES ---
const getCompetencias = () => api.get('/competencias/');
const getModalidades = () => api.get('/modalidades/');
const getInscripciones = () => api.get('/inscripciones/');
const getGastos = () => api.get('/gastos/');
const getCompetenciaStats = (id) => api.get(`/competencias/${id}/stats/`);
const getOfficialResults = (id) => api.get(`/competencias/${id}/official_results/`);
const getAnnualRanking = (year) => api.get(`/competencias/ranking/anual/?year=${year}`);
const getRecords = () => api.get('/competencias/records/');
const getClubRanking = (year) => api.get(`/competencias/ranking/clubes/?year=${year}`);

// --- ACCIONES DE ESCRITURA ---
const submitScore = (data) => api.post('/score/submit/', data);
const createGasto = (data) => api.post('/gastos/', data);
const deleteGasto = (id) => api.delete(`/gastos/${id}/`);
const deleteInscripcion = (id) => api.delete(`/inscripciones/${id}/`);
const updateInscripcion = (id, data) => api.patch(`/inscripciones/${id}/`, data);

// --- DESCARGA DE ARCHIVOS (BLOBS) ---
// Optimizamos para manejar correctamente la memoria del navegador

const downloadReceipt = async (id) => {
    try {
        const response = await api.get(`/inscripciones/${id}/print_receipt/`, { 
            responseType: 'blob' // Importante: Indica que esperamos binarios
        });
        
        // Crear URL temporal
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a'); 
        link.href = url; 
        link.setAttribute('download', `Recibo_${id}.pdf`);
        
        document.body.appendChild(link); 
        link.click();
        
        // LIMPIEZA: Liberar memoria después de la descarga
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (e) { 
        console.error("Error descargando recibo", e);
        // Tip: Si falla con blob, a veces el error viene como blob y no se lee en consola.
        alert("Error al descargar el recibo. Verifica tu conexión."); 
    }
};

const downloadDiploma = async (rid, nombre) => {
    try {
        const response = await api.get(`/resultados/${rid}/print_diploma/`, { 
            responseType: 'blob' 
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a'); 
        link.href = url; 
        link.setAttribute('download', `Diploma_${nombre}.pdf`);
        
        document.body.appendChild(link); 
        link.click();
        
        // Limpieza
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (e) { 
        console.error("Error descargando diploma", e); 
        alert("Error al generar el diploma."); 
    }
};

// --- EXPORTACIÓN ---
const competenciaService = {
  getCompetencias, 
  getModalidades, 
  getInscripciones, 
  submitScore,
  getOfficialResults, 
  getAnnualRanking, 
  getRecords, 
  getClubRanking,
  getGastos, 
  createGasto, 
  deleteGasto, 
  getCompetenciaStats,
  updateInscripcion, 
  deleteInscripcion,
  downloadReceipt, 
  downloadDiploma,
  api // Exponemos la instancia por si algún componente la necesita directo
};

export default competenciaService;