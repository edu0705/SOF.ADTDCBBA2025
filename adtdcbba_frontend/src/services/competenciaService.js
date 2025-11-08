import authService from './authService';
// Asumimos que authService ya tiene la URL base configurada a http://localhost:8001/api/

const competenciaService = {
  
  // --- Gestión de Datos Maestros (CRUD) ---
  
  // Polígonos
  getPoligonos: () => authService.api.get('competencias/poligonos/'),
  createPoligono: (data) => authService.api.post('competencias/poligonos/', data),
  updatePoligono: (id, data) => authService.api.put(`competencias/poligonos/${id}/`, data),
  deletePoligono: (id) => authService.api.delete(`competencias/poligonos/${id}/`),

  // Jueces
  getJueces: () => authService.api.get('competencias/jueces/'),
  createJuez: (data) => authService.api.post('competencias/jueces/', data),
  updateJuez: (id, data) => authService.api.put(`competencias/jueces/${id}/`, data),
  deleteJuez: (id) => authService.api.delete(`competencias/jueces/${id}/`),
  
  // Modalidades
  getModalidades: () => authService.api.get('competencias/modalidades/'),
  createModalidad: (data) => authService.api.post('competencias/modalidades/', data),
  deleteModalidad: (id) => authService.api.delete(`competencias/modalidades/${id}/`),
  
  // Categorías
  createCategoria: (data) => authService.api.post('competencias/categorias/', data),
  deleteCategoria: (id) => authService.api.delete(`competencias/categorias/${id}/`),

  
  // --- Flujo de Inscripción y Competencia ---

  // Competencias
  getCompetencias: () => authService.api.get('competencias/competencias/'),
  createCompetencia: (data) => authService.api.post('competencias/competencias/', data),

  // Inscripciones
  getInscripciones: () => authService.api.get('competencias/inscripciones/'),
  createInscripcion: (data) => authService.api.post('competencias/inscripcion/create/', data),
  updateInscripcionStatus: (id, data) => authService.api.patch(`competencias/inscripciones/${id}/`, data),

  // Resultados (Live Scoring)
  getResultados: () => authService.api.get('competencias/resultados/'), // <-- CRUCIAL PARA PRECARGA
  submitScore: (data) => authService.api.post('competencias/score/submit/', data),
  
  // Cierre de Competencia
  closeCompetition: (id) => authService.api.post(`competencias/competencias/${id}/close_competition/`),
};

export default competenciaService;